"use client";

import { ChangeEvent, ClipboardEvent, DragEvent, useEffect, useRef, useState } from "react";
import { CropEditor } from "@/components/CropEditor";
import { validateUploadBasics } from "@/lib/image-validation";

const configuredMaxMb = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || "12");
const MAX_MB = Number.isFinite(configuredMaxMb) && configuredMaxMb > 0 ? configuredMaxMb : 12;

type Stage = "idle" | "processing" | "complete" | "error";
type ResultState = { status: "idle" | "processing" | "complete" | "error"; url: string; error: string };
type Feedback = "great" | "too_much_removed" | "background_left";
type CropTarget = { url: string; label: string } | null;

const emptyResult = (): ResultState => ({ status: "idle", url: "", error: "" });

export function Uploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [precision, setPrecision] = useState<ResultState>(emptyResult);
  const [browser, setBrowser] = useState<ResultState>(emptyResult);
  const [browserProgress, setBrowserProgress] = useState("Waiting");
  const [runId, setRunId] = useState("");
  const [feedback, setFeedback] = useState<Feedback | "">("");
  const [feedbackState, setFeedbackState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [cropTarget, setCropTarget] = useState<CropTarget>(null);

  useEffect(() => () => { if (originalUrl) URL.revokeObjectURL(originalUrl); }, [originalUrl]);
  useEffect(() => () => { if (precision.url) URL.revokeObjectURL(precision.url); }, [precision.url]);
  useEffect(() => () => { if (browser.url) URL.revokeObjectURL(browser.url); }, [browser.url]);

  async function runPrecision(nextFile: File) {
    setPrecision({ status: "processing", url: "", error: "" });
    const form = new FormData();
    form.append("image", nextFile);
    const response = await fetch("/api/remove-background", { method: "POST", body: form });
    if (!response.ok) {
      const body = await response.json().catch(() => ({ error: "FlytheBG Precision failed." }));
      throw new Error(body.error || "FlytheBG Precision failed.");
    }
    const output = await response.blob();
    const url = URL.createObjectURL(output);
    setRunId(response.headers.get("x-flythebg-run-id") || "");
    setPrecision({ status: "complete", url, error: "" });
  }

  async function runBrowserModel(nextFile: File) {
    setBrowser({ status: "processing", url: "", error: "" });
    setBrowserProgress("Loading browser model…");
    const { removeBackground } = await import("@imgly/background-removal");
    const output = await removeBackground(nextFile, {
      debug: false,
      device: "cpu",
      model: "isnet_quint8",
      rescale: true,
      output: { format: "image/png", quality: 1 },
      progress: (key: string, current: number, total: number) => {
        const percent = total > 0 ? Math.round((current / total) * 100) : 0;
        setBrowserProgress(key.startsWith("fetch:") ? `Downloading browser AI ${percent}%` : `Browser AI ${percent}%`);
      },
    });
    const url = URL.createObjectURL(output);
    setBrowserProgress("Complete");
    setBrowser({ status: "complete", url, error: "" });
  }

  async function processFile(nextFile: File) {
    if (stage === "processing") return;
    const problem = validateUploadBasics(nextFile, MAX_MB);
    if (problem) { setError(problem); setStage("error"); return; }

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (precision.url) URL.revokeObjectURL(precision.url);
    if (browser.url) URL.revokeObjectURL(browser.url);
    setFile(nextFile);
    setOriginalUrl(URL.createObjectURL(nextFile));
    setPrecision({ status: "processing", url: "", error: "" });
    setBrowser({ status: "processing", url: "", error: "" });
    setRunId(""); setFeedback(""); setFeedbackState("idle"); setBrowserProgress("Starting…"); setCropTarget(null); setError(""); setStage("processing");

    const [first, second] = await Promise.allSettled([runPrecision(nextFile), runBrowserModel(nextFile)]);
    if (first.status === "rejected") {
      const message = first.reason instanceof Error ? first.reason.message : "FlytheBG Precision failed.";
      setPrecision({ status: "error", url: "", error: message });
    }
    if (second.status === "rejected") {
      const message = second.reason instanceof Error ? second.reason.message : "Browser AI failed.";
      setBrowser({ status: "error", url: "", error: message });
      setBrowserProgress("Unavailable");
    }
    if (first.status === "rejected" && second.status === "rejected") {
      setError("Both background-removal engines failed for this image. Try another image or retry later.");
      setStage("error");
    } else {
      setStage("complete");
    }
  }

  async function sendFeedback(value: Feedback) {
    if (!runId || feedbackState === "sending" || feedbackState === "sent") return;
    setFeedback(value); setFeedbackState("sending");
    try {
      const response = await fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ runId, feedback: value }) });
      if (!response.ok) throw new Error("Feedback could not be saved.");
      setFeedbackState("sent");
    } catch {
      setFeedbackState("error");
    }
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) { const next = event.target.files?.[0]; if (next) void processFile(next); }
  function onDrop(event: DragEvent<HTMLDivElement>) { event.preventDefault(); setDragging(false); if (stage === "processing") return; const next = event.dataTransfer.files?.[0]; if (next) void processFile(next); }
  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    if (stage === "processing") return;
    let next: File | null = null;
    for (let i = 0; i < event.clipboardData.files.length; i += 1) {
      const item = event.clipboardData.files.item(i);
      if (item?.type.startsWith("image/")) { next = item; break; }
    }
    if (next) { event.preventDefault(); void processFile(next); }
  }

  function download(url: string, label: string) {
    if (!url) return;
    const link = document.createElement("a");
    const base = file?.name.replace(/\.[^.]+$/, "") || "image";
    link.href = url;
    link.download = `${base}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
    link.click();
  }

  function reset() {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (precision.url) URL.revokeObjectURL(precision.url);
    if (browser.url) URL.revokeObjectURL(browser.url);
    setFile(null); setOriginalUrl(""); setPrecision(emptyResult()); setBrowser(emptyResult()); setRunId(""); setFeedback(""); setFeedbackState("idle"); setError(""); setStage("idle"); setCropTarget(null); setBrowserProgress("Waiting");
    if (inputRef.current) inputRef.current.value = "";
  }

  if (stage === "complete") {
    return (
      <div className="toolCard resultCard dualResultCard">
        <div className="toolTop"><div><span className="toolKicker">Two independent results</span><h2>Choose the cleaner cutout.</h2></div><button className="textButton" onClick={reset}>New image</button></div>
        <div className="resultRetention"><span className="liveDot"/>Precision runs on the private service. Browser AI runs on your device.</div>
        <div className="originalStrip"><span>Original</span><div className="imageStage soft"><img src={originalUrl} alt="Original upload preview" /></div></div>
        <div className="modelResultGrid">
          <article className="modelResult">
            <div className="modelResultHead"><div><strong>FlytheBG Precision</strong><span>Private server · two-pass edge refinement</span></div><b className="modelBadge">A</b></div>
            {precision.status === "complete" ? <div className="imageStage checker"><img src={precision.url} alt="FlytheBG Precision background removed result" /></div> : <div className="modelError">{precision.error || "Precision result unavailable."}</div>}
            {precision.status === "complete" && <div className="resultActions"><button className="primaryButton" onClick={() => download(precision.url, "flythebg-precision")}>Download PNG ↓</button><button className="secondaryButton" onClick={() => setCropTarget({ url: precision.url, label: "FlytheBG Precision" })}>Crop</button></div>}
          </article>
          <article className="modelResult">
            <div className="modelResultHead"><div><strong>Browser AI</strong><span>IMG.LY IS-Net · processed on this device</span></div><b className="modelBadge">B</b></div>
            {browser.status === "complete" ? <div className="imageStage checker"><img src={browser.url} alt="Browser AI background removed result" /></div> : <div className="modelError">{browser.error || browserProgress}</div>}
            {browser.status === "complete" && <div className="resultActions"><button className="primaryButton" onClick={() => download(browser.url, "browser-ai")}>Download PNG ↓</button><button className="secondaryButton" onClick={() => setCropTarget({ url: browser.url, label: "Browser AI" })}>Crop</button></div>}
          </article>
        </div>
        {cropTarget && <CropEditor sourceUrl={cropTarget.url} fileName={file?.name || "image.png"} label={cropTarget.label} onClose={() => setCropTarget(null)} />}
        {runId && <div className="feedbackPanel">
          <div><span className="controlLabel">Rate FlytheBG Precision</span><p>Optional. Sends only the quality category, not your photo.</p></div>
          <div className="feedbackButtons">
            <button disabled={feedbackState === "sending" || feedbackState === "sent"} className={feedback === "great" ? "selected" : ""} onClick={() => void sendFeedback("great")}>✓ Looks great</button>
            <button disabled={feedbackState === "sending" || feedbackState === "sent"} className={feedback === "too_much_removed" ? "selected" : ""} onClick={() => void sendFeedback("too_much_removed")}>− Too much removed</button>
            <button disabled={feedbackState === "sending" || feedbackState === "sent"} className={feedback === "background_left" ? "selected" : ""} onClick={() => void sendFeedback("background_left")}>+ Background left</button>
          </div>
          {feedbackState === "sent" && <span className="feedbackNote success">Thanks — aggregate calibration updated.</span>}
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
      {stage === "error" && <div className="errorBox" role="alert"><strong>Couldn’t process that image.</strong><span>{error}</span><button onClick={reset}>Try another</button></div>}
      <div className="toolFinePrint"><span>✓ Two outputs</span><span>✓ Crop by cursor, ratio, or pixels</span><span>✓ No account</span><span>By using FlytheBG you accept our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</span></div>
    </div>
  );
}
