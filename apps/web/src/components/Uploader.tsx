"use client";

import { ChangeEvent, ClipboardEvent, DragEvent, useRef, useState } from "react";
import { CropEditor } from "@/components/CropEditor";
import { removeBackgroundInBrowser, type BrowserBackgroundModel } from "@/lib/browser-background-removal";
import { validateUploadBasics } from "@/lib/image-validation";

const configuredMaxMb = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || "12");
const MAX_MB = Number.isFinite(configuredMaxMb) && configuredMaxMb > 0 ? configuredMaxMb : 12;
const PREVIEW_MAX_EDGE = 960;
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
type PreparedImage = { previewUrl: string; width: number; height: number; foregroundCoverage: number };

const emptyResult = (): ResultState => ({ status: "idle", blob: null, previewUrl: "", error: "", width: 0, height: 0, foregroundCoverage: 0, engine: "" });

function percent(value: number) {
  return `${Math.max(0, Math.min(100, value * 100)).toFixed(value < 0.1 ? 1 : 0)}%`;
}

function revokePreview(url: string | undefined) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

async function canvasToPreviewUrl(canvas: HTMLCanvasElement, label: string) {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error(`${label} preview could not be encoded.`)), "image/png");
  });
  return URL.createObjectURL(blob);
}

async function prepareImage(blob: Blob, label: string): Promise<PreparedImage> {
  if (!blob || blob.size < 32) throw new Error(`${label} returned an empty image.`);
  if (blob.type && !blob.type.startsWith("image/")) throw new Error(`${label} returned an unsupported file type.`);

  const objectUrl = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`${label} returned an image the browser could not decode.`));
      image.src = objectUrl;
    });
    await image.decode().catch(() => undefined);

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
    for (let i = 3; i < pixels.length; i += 4) if (pixels[i] >= 18) foregroundPixels += 1;

    const previewUrl = await canvasToPreviewUrl(canvas, label);
    canvas.width = 1;
    canvas.height = 1;
    return { previewUrl, width, height, foregroundCoverage: foregroundPixels / totalPixels };
  } finally {
    image.src = "";
    URL.revokeObjectURL(objectUrl);
  }
}

function completeResult(blob: Blob, prepared: PreparedImage, engine: string): ResultState {
  return { status: "complete", blob, previewUrl: prepared.previewUrl, error: "", width: prepared.width, height: prepared.height, foregroundCoverage: prepared.foregroundCoverage, engine };
}

export function Uploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [originalPreview, setOriginalPreview] = useState<PreparedImage | null>(null);
  const [precision, setPrecision] = useState<ResultState>(emptyResult);
  const [browser, setBrowser] = useState<ResultState>(emptyResult);
  const [browserProgress, setBrowserProgress] = useState("Waiting");
  const [runId, setRunId] = useState("");
  const [feedback, setFeedback] = useState<Feedback | "">("");
  const [feedbackState, setFeedbackState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [cropTarget, setCropTarget] = useState<CropTarget>(null);
  const [cleanupNotice, setCleanupNotice] = useState("");

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
      revokePreview(prepared.previewUrl);
      throw new Error("FlytheBG Precision could not find a usable foreground. Its empty cutout was rejected.");
    }

    setRunId(response.headers.get("x-flythebg-run-id") || "");
    setPrecision(completeResult(output, prepared, "IS-Net precision · private server"));
  }

  async function runBrowserCandidate(nextFile: File, model: BrowserBackgroundModel) {
    const result = await removeBackgroundInBrowser(nextFile, model, setBrowserProgress);
    const prepared = await prepareImage(result.blob, `IMG.LY ${result.modelLabel}`);
    return { output: result.blob, prepared, modelLabel: result.modelLabel };
  }

  async function runBrowserModel(nextFile: File) {
    setBrowser({ ...emptyResult(), status: "processing", engine: "IMG.LY Browser AI" });
    setBrowserProgress("Loading browser-only model…");

    let candidate = await runBrowserCandidate(nextFile, "isnet_quint8");
    if (candidate.prepared.foregroundCoverage < EMPTY_FOREGROUND_THRESHOLD) {
      revokePreview(candidate.prepared.previewUrl);
      setBrowserProgress("Quantized result was empty — retrying browser FP16…");
      candidate = await runBrowserCandidate(nextFile, "isnet_fp16");
    }

    if (candidate.prepared.foregroundCoverage < EMPTY_FOREGROUND_THRESHOLD) {
      revokePreview(candidate.prepared.previewUrl);
      throw new Error("IMG.LY Browser AI could not find a usable foreground. The empty cutout was rejected.");
    }

    setBrowserProgress("Complete · processed on this device");
    setBrowser(completeResult(candidate.output, candidate.prepared, `IMG.LY IS-Net ${candidate.modelLabel} · browser only`));
  }

  async function processFile(nextFile: File) {
    if (stage === "processing") return;
    const problem = validateUploadBasics(nextFile, MAX_MB);
    if (problem) { setError(problem); setStage("error"); return; }

    setFileName(nextFile.name);
    setCleanupNotice("");
    setOriginalPreview(null);
    setPrecision({ ...emptyResult(), status: "processing" });
    setBrowser({ ...emptyResult(), status: "processing" });
    setRunId("");
    setFeedback("");
    setFeedbackState("idle");
    setBrowserProgress("Starting browser AI…");
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

    // The engines are independent. One failure never cancels the other engine.
    const [serverResult, browserResult] = await Promise.allSettled([runPrecision(nextFile), runBrowserModel(nextFile)]);

    if (serverResult.status === "rejected") {
      const message = serverResult.reason instanceof Error ? serverResult.reason.message : "FlytheBG Precision failed.";
      setPrecision({ ...emptyResult(), status: "error", error: message, engine: "FlytheBG Precision" });
    }
    if (browserResult.status === "rejected") {
      const message = browserResult.reason instanceof Error ? browserResult.reason.message : "Browser AI failed.";
      setBrowser({ ...emptyResult(), status: "error", error: message, engine: "IMG.LY Browser AI" });
      setBrowserProgress("Unavailable");
    }

    if (serverResult.status === "rejected" && browserResult.status === "rejected") {
      setError("Neither engine produced a usable cutout. Try a photo with a clearer subject/background boundary.");
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
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ runId, feedback: value }) });
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
    for (let i = 0; i < event.clipboardData.files.length; i += 1) {
      const item = event.clipboardData.files.item(i);
      if (item?.type.startsWith("image/")) {
        event.preventDefault();
        void processFile(item);
        break;
      }
    }
  }

  function reset(notice = "") {
    revokePreview(originalPreview?.previewUrl);
    revokePreview(precision.previewUrl);
    revokePreview(browser.previewUrl);
    setFileName("");
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
    setCleanupNotice(notice);
    if (inputRef.current) inputRef.current.value = "";
  }

  function download(blob: Blob | null, label: string) {
    if (!blob) return;
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const base = fileName.replace(/\.[^.]+$/, "") || "image";
    link.href = href;
    link.download = `${base}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(href);
      reset("Download started successfully. The uploaded image, AI results and previews were released from this tab memory. Your downloaded PNG remains on your device.");
    }, 1500);
  }

  const availableCount = Number(precision.status === "complete" && !!precision.blob) + Number(browser.status === "complete" && !!browser.blob);

  if (stage === "complete" && originalPreview) {
    return (
      <div className="toolCard resultCard dualResultCard">
        <div className="toolTop">
          <div><span className="toolKicker">Independent AI results</span><h2>{availableCount === 2 ? "Two usable cutouts. Choose the cleaner one." : "One usable cutout is ready."}</h2></div>
          <button className="textButton" onClick={() => reset()}>New image</button>
        </div>
        <div className="resultRetention"><span className="liveDot"/>{availableCount === 2 ? "Both engines completed independently." : "One engine failed, but the other result is still available."} IMG.LY runs on this device; the server model is a separate path. Downloading clears working images from this tab memory.</div>

        <div className="originalStrip"><span>Original · {originalPreview.width} × {originalPreview.height}px</span><div className="imageStage soft"><img src={originalPreview.previewUrl} alt="Original upload preview" /></div></div>

        <div className="modelResultGrid">
          <article className="modelResult">
            <div className="modelResultHead"><div><strong>FlytheBG Precision</strong><span>{precision.engine || "Private server · independent engine"}</span></div><b className="modelBadge">A</b></div>
            {precision.status === "complete" && precision.blob ? <>
              <div className="imageStage checker"><img src={precision.previewUrl} alt="FlytheBG Precision background removed result" /></div>
              <div className="resultMeta"><span>{precision.width} × {precision.height}px</span><span>Foreground {percent(precision.foregroundCoverage)}</span></div>
              <div className="resultActions"><button className="primaryButton" onClick={() => download(precision.blob, "flythebg-precision")}>Download PNG & clear ↓</button><button className="secondaryButton" onClick={() => setCropTarget({ blob: precision.blob!, label: "FlytheBG Precision" })}>Crop</button></div>
            </> : <div className="modelError"><div><strong>Server result unavailable</strong><span>{precision.error || "FlytheBG Precision did not return a usable image. Browser AI can still be used independently."}</span></div></div>}
          </article>

          <article className="modelResult">
            <div className="modelResultHead"><div><strong>IMG.LY Browser AI</strong><span>{browser.engine || "Runs locally in this browser"}</span></div><b className="modelBadge browserBadge">B</b></div>
            {browser.status === "complete" && browser.blob ? <>
              <div className="imageStage checker"><img src={browser.previewUrl} alt="IMG.LY browser background removed result" /></div>
              <div className="resultMeta"><span>{browser.width} × {browser.height}px</span><span>Foreground {percent(browser.foregroundCoverage)}</span></div>
              <div className="resultActions"><button className="primaryButton" onClick={() => download(browser.blob, "browser-ai")}>Download PNG & clear ↓</button><button className="secondaryButton" onClick={() => setCropTarget({ blob: browser.blob!, label: "IMG.LY Browser AI" })}>Crop</button></div>
            </> : <div className="modelError"><div><strong>Browser result unavailable</strong><span>{browser.error || browserProgress}</span></div></div>}
          </article>
        </div>

        {cropTarget && <CropEditor sourceBlob={cropTarget.blob} fileName={fileName || "image.png"} label={cropTarget.label} onClose={() => setCropTarget(null)} />}

        {runId && <div className="feedbackPanel">
          <div><span className="controlLabel">Rate FlytheBG Precision</span><p>Optional. Sends only the quality category, not your photo.</p></div>
          <div className="feedbackButtons"><button disabled={feedbackState === "sending" || feedbackState === "sent"} className={feedback === "great" ? "selected" : ""} onClick={() => void sendFeedback("great")}>✓ Looks great</button><button disabled={feedbackState === "sending" || feedbackState === "sent"} className={feedback === "too_much_removed" ? "selected" : ""} onClick={() => void sendFeedback("too_much_removed")}>− Too much removed</button><button disabled={feedbackState === "sending" || feedbackState === "sent"} className={feedback === "background_left" ? "selected" : ""} onClick={() => void sendFeedback("background_left")}>+ Background left</button></div>
          {feedbackState === "sent" && <span className="feedbackNote success">Thanks — aggregate calibration updated.</span>}
          {feedbackState === "error" && <span className="feedbackNote">Feedback could not be saved. Your image result is unaffected.</span>}
        </div>}
      </div>
    );
  }

  return (
    <div className="toolCard">
      <div className="toolTop"><div><span className="toolKicker">Independent dual-engine remover</span><h2>Upload once. Keep whichever engine succeeds.</h2></div><span className="securePill"><i/> Privacy-first</span></div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="srOnly" onChange={onInput} />
      <div className={`dropZone ${dragging ? "dragging" : ""}`} onDragEnter={(e) => { e.preventDefault(); setDragging(true); }} onDragOver={(e) => e.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={onDrop} onPaste={onPaste} role="button" tabIndex={0} onClick={() => stage !== "processing" && inputRef.current?.click()} onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && stage !== "processing") inputRef.current?.click(); }}>
        {stage === "processing" ? <div className="processingState" aria-live="polite"><div className="scanner"><i/></div><strong>Running two independent engines…</strong><p>FlytheBG Precision on the server + IMG.LY entirely in this browser.</p><span className="fileHint">{browserProgress}</span><div className="indeterminate"><i /></div></div> : <><div className="uploadIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg></div><strong>Choose an image</strong><p>or drag, drop, or paste</p><span className="fileHint">PNG · JPEG · WebP · up to {MAX_MB} MB</span></>}
      </div>
      {stage === "error" && <div className="errorBox" role="alert"><strong>Couldn’t produce a usable cutout.</strong><span>{error}</span><button onClick={() => reset()}>Try another image</button></div>}
      {cleanupNotice && stage === "idle" && <div className="cleanupComplete"><strong>Privacy cleanup complete</strong><span>{cleanupNotice}</span></div>}
      <div className="toolFinePrint"><span>✓ Engines fail independently</span><span>✓ IMG.LY browser-only inference</span><span>✓ Empty-result protection</span><span>✓ Crop by cursor, ratio or pixels</span><span>✓ Working images cleared after download starts</span><span>By using FlytheBG you accept our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</span></div>
    </div>
  );
}
