"use client";

import { ChangeEvent, ClipboardEvent, DragEvent, useRef, useState } from "react";
import { CropEditor } from "@/components/CropEditor";
import { validateUploadBasics } from "@/lib/image-validation";

const configuredMaxMb = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || "12");
const MAX_MB = Number.isFinite(configuredMaxMb) && configuredMaxMb > 0 ? configuredMaxMb : 12;
const PREVIEW_MAX_EDGE = 1400;
const EMPTY_FOREGROUND_THRESHOLD = 0.0015;

type Stage = "idle" | "processing" | "complete" | "error";
type Feedback = "great" | "too_much_removed" | "background_left";
type ResultStatus = "idle" | "processing" | "complete" | "error";

type ResultState = {
  status: ResultStatus;
  blob: Blob | null;
  previewUrl: string;
  error: string;
  width: number;
  height: number;
  foregroundCoverage: number;
  engine: string;
};

type CropTarget = { blob: Blob; label: string } | null;

type PreparedImage = {
  previewUrl: string;
  width: number;
  height: number;
  foregroundCoverage: number;
};

const emptyResult = (): ResultState => ({
  status: "idle",
  blob: null,
  previewUrl: "",
  error: "",
  width: 0,
  height: 0,
  foregroundCoverage: 0,
  engine: "",
});

function percent(value: number) {
  return `${Math.max(0, Math.min(100, value * 100)).toFixed(value < 0.1 ? 1 : 0)}%`;
}

async function prepareImage(blob: Blob, label: string): Promise<PreparedImage> {
  if (!blob || blob.size < 32) throw new Error(`${label} returned an empty image.`);
  if (blob.type && !blob.type.startsWith("image/")) throw new Error(`${label} returned an unsupported file type.`);

  const objectUrl = URL.createObjectURL(blob);
  const image = new Image();
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`${label} returned an image the browser could not decode.`));
      image.src = objectUrl;
    });

    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) throw new Error(`${label} returned an image with invalid dimensions.`);

    const scale = Math.min(1, PREVIEW_MAX_EDGE / Math.max(width, height));
    const previewWidth = Math.max(1, Math.round(width * scale));
    const previewHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = previewWidth;
    canvas.height = previewHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("This browser cannot create the image preview canvas.");

    ctx.clearRect(0, 0, previewWidth, previewHeight);
    ctx.drawImage(image, 0, 0, previewWidth, previewHeight);

    const pixels = ctx.getImageData(0, 0, previewWidth, previewHeight).data;
    let foregroundPixels = 0;
    const totalPixels = Math.max(1, previewWidth * previewHeight);
    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] >= 18) foregroundPixels += 1;
    }

    const previewUrl = canvas.toDataURL("image/png");
    if (!previewUrl || previewUrl === "data:,") throw new Error(`${label} preview could not be encoded.`);

    return {
      previewUrl,
      width,
      height,
      foregroundCoverage: foregroundPixels / totalPixels,
    };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function completeResult(blob: Blob, prepared: PreparedImage, engine: string): ResultState {
  return {
    status: "complete",
    blob,
    previewUrl: prepared.previewUrl,
    error: "",
    width: prepared.width,
    height: prepared.height,
    foregroundCoverage: prepared.foregroundCoverage,
    engine,
  };
}

export function Uploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<PreparedImage | null>(null);
  const [precision, setPrecision] = useState<ResultState>(emptyResult);
  const [browser, setBrowser] = useState<ResultState>(emptyResult);
  const [browserProgress, setBrowserProgress] = useState("Waiting");
  const [runId, setRunId] = useState("");
  const [feedback, setFeedback] = useState<Feedback | "">("");
  const [feedbackState, setFeedbackState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [cropTarget, setCropTarget] = useState<CropTarget>(null);

  async function runPrecision(nextFile: File) {
    setPrecision({ ...emptyResult(), status: "processing", engine: "FlytheBG Precision" });
    const form = new FormData();
    form.append("image", nextFile);
    const response = await fetch("/api/remove-background", { method: "POST", body: form, cache: "no-store" });
    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "FlytheBG Precision failed." }));
      throw new Error(body.error || "FlytheBG Precision failed.");
    }

    const output = await response.blob();
    const prepared = await prepareImage(output, "FlytheBG Precision");
    if (prepared.foregroundCoverage < EMPTY_FOREGROUND_THRESHOLD) {
      throw new Error("FlytheBG Precision could not find a usable foreground in this photo. The empty cutout was rejected instead of showing a blank panel.");
    }

    setRunId(response.headers.get("x-flythebg-run-id") || "");
    setPrecision(completeResult(output, prepared, "IS-Net precision · private server"));
  }

  async function runImgly(nextFile: File, model: "isnet_quint8" | "isnet_fp16") {
    const { removeBackground } = await import("@imgly/background-removal");
    const modelLabel = model === "isnet_fp16" ? "FP16" : "quantized";
    const output = await removeBackground(nextFile, {
      debug: false,
      device: "cpu",
      model,
      rescale: true,
      output: { format: "image/png", quality: 1 },
      progress: (key: string, current: number, total: number) => {
        const progressValue = total > 0 ? Math.round((current / total) * 100) : 0;
        if (key.startsWith("fetch:")) setBrowserProgress(`Downloading ${modelLabel} browser AI ${progressValue}%`);
        else setBrowserProgress(`${modelLabel} browser AI ${progressValue}%`);
      },
    });
    const prepared = await prepareImage(output, `IMG.LY ${modelLabel}`);
    return { output, prepared, modelLabel };
  }

  async function runBrowserModel(nextFile: File) {
    setBrowser({ ...emptyResult(), status: "processing", engine: "IMG.LY Browser AI" });
    setBrowserProgress("Loading browser model…");

    let candidate = await runImgly(nextFile, "isnet_quint8");
    if (candidate.prepared.foregroundCoverage < EMPTY_FOREGROUND_THRESHOLD) {
      setBrowserProgress("Quantized result was empty — retrying higher-precision browser AI…");
      candidate = await runImgly(nextFile, "isnet_fp16");
    }

    if (candidate.prepared.foregroundCoverage < EMPTY_FOREGROUND_THRESHOLD) {
      throw new Error("Browser AI could not find a usable foreground in this photo. The empty cutout was rejected instead of showing a blank panel.");
    }

    setBrowserProgress("Complete");
    setBrowser(completeResult(candidate.output, candidate.prepared, `IMG.LY IS-Net ${candidate.modelLabel} · on device`));
  }

  async function processFile(nextFile: File) {
    if (stage === "processing") return;
    const problem = validateUploadBasics(nextFile, MAX_MB);
    if (problem) { setError(problem); setStage("error"); return; }

    setFile(nextFile);
    setOriginalPreview(null);
    setPrecision({ ...emptyResult(), status: "processing" });
    setBrowser({ ...emptyResult(), status: "processing" });
    setRunId("");
    setFeedback("");
    setFeedbackState("idle");
    setBrowserProgress("Starting…");
    setCropTarget(null);
    setError("");
    setStage("processing");

    try {
      setOriginalPreview(await prepareImage(nextFile, "Original image"));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The uploaded image could not be decoded.");
      setStage("error");
      return;
    }

    const [first, second] = await Promise.allSettled([runPrecision(nextFile), runBrowserModel(nextFile)]);
    if (first.status === "rejected") {
      const message = first.reason instanceof Error ? first.reason.message : "FlytheBG Precision failed.";
      setPrecision({ ...emptyResult(), status: "error", error: message, engine: "FlytheBG Precision" });
    }
    if (second.status === "rejected") {
      const message = second.reason instanceof Error ? second.reason.message : "Browser AI failed.";
      setBrowser({ ...emptyResult(), status: "error", error: message, engine: "IMG.LY Browser AI" });
      setBrowserProgress("Unavailable");
    }

    if (first.status === "rejected" && second.status === "rejected") {
      setError("Neither model produced a usable cutout for this image. Try a photo with a clearer subject/background boundary.");
      setStage("error");
    } else {
      setStage("complete");
    }
  }

  async function sendFeedback(value: Feedback) {
    if (!runId || feedbackState === "sending" || feedbackState === "sent") return;
    setFeedback(value);
    setFeedbackState("sending");
    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, feedback: value }),
      });
      if (!response.ok) throw new Error("Feedback could not be saved.");
      setFeedbackState("sent");
    } catch {
      setFeedbackState("error");
    }
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0];
    if (next) void processFile(next);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (stage === "processing") return;
    const next = event.dataTransfer.files?.[0];
    if (next) void processFile(next);
  }

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    if (stage === "processing") return;
    let next: File | null = null;
    for (let i = 0; i < event.clipboardData.files.length; i += 1) {
      const item = event.clipboardData.files.item(i);
      if (item?.type.startsWith("image/")) { next = item; break; }
    }
    if (next) { event.preventDefault(); void processFile(next); }
  }

  function download(blob: Blob | null, label: string) {
    if (!blob) return;
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const base = file?.name.replace(/\.[^.]+$/, "") || "image";
    link.href = href;
    link.download = `${base}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1500);
  }

  function reset() {
    setFile(null);
    setOriginalPreview(null);
    setPrecision(emptyResult());
    setBrowser(emptyResult());
    setRunId("");
    setFeedback("");
    setFeedbackState("idle");
    setError("");
    setStage("idle");
    setCropTarget(null);
    setBrowserProgress("Waiting");
    if (inputRef.current) inputRef.current.value = "";
  }

  if (stage === "complete" && originalPreview) {
    return (
      <div className="toolCard resultCard dualResultCard">
        <div className="toolTop">
          <div><span className="toolKicker">Two validated results</span><h2>Choose the cleaner cutout.</h2></div>
          <button className="textButton" onClick={reset}>New image</button>
        </div>
        <div className="resultRetention"><span className="liveDot"/>Every preview is decoded and validated before it is shown. Empty model outputs are rejected instead of appearing as black/white cards.</div>

        <div className="originalStrip">
          <span>Original · {originalPreview.width} × {originalPreview.height}px</span>
          <div className="imageStage soft"><img src={originalPreview.previewUrl} alt="Original upload preview" /></div>
        </div>

        <div className="modelResultGrid">
          <article className="modelResult">
            <div className="modelResultHead"><div><strong>FlytheBG Precision</strong><span>{precision.engine || "Private server · precision pipeline"}</span></div><b className="modelBadge">A</b></div>
            {precision.status === "complete" && precision.blob ? (
              <>
                <div className="imageStage checker"><img src={precision.previewUrl} alt="FlytheBG Precision background removed result" /></div>
                <div className="resultMeta"><span>{precision.width} × {precision.height}px</span><span>Foreground {percent(precision.foregroundCoverage)}</span></div>
                <div className="resultActions"><button className="primaryButton" onClick={() => download(precision.blob, "flythebg-precision")}>Download PNG ↓</button><button className="secondaryButton" onClick={() => setCropTarget({ blob: precision.blob!, label: "FlytheBG Precision" })}>Crop</button></div>
              </>
            ) : <div className="modelError"><div><strong>No usable preview</strong><span>{precision.error || "Precision result unavailable."}</span></div></div>}
          </article>

          <article className="modelResult">
            <div className="modelResultHead"><div><strong>Browser AI</strong><span>{browser.engine || "IMG.LY · processed on this device"}</span></div><b className="modelBadge">B</b></div>
            {browser.status === "complete" && browser.blob ? (
              <>
                <div className="imageStage checker"><img src={browser.previewUrl} alt="Browser AI background removed result" /></div>
                <div className="resultMeta"><span>{browser.width} × {browser.height}px</span><span>Foreground {percent(browser.foregroundCoverage)}</span></div>
                <div className="resultActions"><button className="primaryButton" onClick={() => download(browser.blob, "browser-ai")}>Download PNG ↓</button><button className="secondaryButton" onClick={() => setCropTarget({ blob: browser.blob!, label: "Browser AI" })}>Crop</button></div>
              </>
            ) : <div className="modelError"><div><strong>No usable preview</strong><span>{browser.error || browserProgress}</span></div></div>}
          </article>
        </div>

        {cropTarget && <CropEditor sourceBlob={cropTarget.blob} fileName={file?.name || "image.png"} label={cropTarget.label} onClose={() => setCropTarget(null)} />}

        {runId && <div className="feedbackPanel">
          <div><span className="controlLabel">Rate FlytheBG Precision</span><p>Optional. Sends only the quality category, not your photo.</p></div>
          <div className="feedbackButtons">
            <button disabled={feedbackState === "sending" || feedbackState === "sent"} className={feedback === "great" ? "selected" : ""} onClick={() => void sendFeedback("great")}>✓ Looks great</button>
            <button disabled={feedbackState === "sending" || feedbackState === "sent"} className={feedback === "too_much_removed" ? "selected" : ""} onClick={() => void sendFeedback("too_much_removed")}>− Too much removed</button>
            <button disabled={feedbackState === "sending" || feedbackState === "sent"} className={feedback === "background_left" ? "selected" : ""} onClick={() => void sendFeedback("background_left")}>+ Background left</button>
          </div>
          {feedbackState === "sent" && <span className="feedbackNote success">Thanks — aggregate calibration updated.</span>}
          {feedbackState === "error" && <span className="feedbackNote">Feedback could not be saved. Your image result is unaffected.</span>}
        </div>}
      </div>
    );
  }

  return (
    <div className="toolCard">
      <div className="toolTop"><div><span className="toolKicker">Dual-model background remover</span><h2>Upload once. Compare twice.</h2></div><span className="securePill"><i/> Privacy-first</span></div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="srOnly" onChange={onInput} />
      <div className={`dropZone ${dragging ? "dragging" : ""}`} onDragEnter={(e) => { e.preventDefault(); setDragging(true); }} onDragOver={(e) => e.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={onDrop} onPaste={onPaste} role="button" tabIndex={0} onClick={() => stage !== "processing" && inputRef.current?.click()} onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && stage !== "processing") inputRef.current?.click(); }}>
        {stage === "processing" ? (
          <div className="processingState" aria-live="polite"><div className="scanner"><i/></div><strong>Running two AI engines…</strong><p>FlytheBG Precision + browser-side IMG.LY model.</p><span className="fileHint">{browserProgress}</span><div className="indeterminate"><i /></div></div>
        ) : (
          <><div className="uploadIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg></div><strong>Choose an image</strong><p>or drag, drop, or paste</p><span className="fileHint">PNG · JPEG · WebP · up to {MAX_MB} MB</span></>
        )}
      </div>
      {stage === "error" && <div className="errorBox" role="alert"><strong>Couldn’t produce a usable cutout.</strong><span>{error}</span><button onClick={reset}>Try another image</button></div>}
      <div className="toolFinePrint"><span>✓ Two outputs</span><span>✓ Empty-result protection</span><span>✓ Crop by cursor, ratio, or pixels</span><span>✓ No account</span><span>By using FlytheBG you accept our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</span></div>
    </div>
  );
}
