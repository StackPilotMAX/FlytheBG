"use client";

import { ChangeEvent, ClipboardEvent, DragEvent, useRef, useState } from "react";
import { CropEditor } from "@/components/CropEditor";
import { removeBackgroundWithFallback } from "@/lib/browser-background-removal";
import { validateUploadBasics } from "@/lib/image-validation";

const MAX_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || "12") || 12;
const PREVIEW_EDGE = 960;

type Stage = "idle" | "processing" | "complete" | "error";
type CropTarget = { blob: Blob; label: string } | null;
type Prepared = { url: string; width: number; height: number };

function revoke(url: string) {
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
}

async function previewFor(blob: Blob, label: string): Promise<Prepared> {
  const source = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`${label} could not be decoded.`));
      image.src = source;
    });
    await image.decode().catch(() => undefined);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) throw new Error(`${label} has invalid dimensions.`);

    const scale = Math.min(1, PREVIEW_EDGE / Math.max(width, height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot create a preview.");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const previewBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Preview encoding failed.")), "image/png");
    });
    canvas.width = 1;
    canvas.height = 1;
    return { url: URL.createObjectURL(previewBlob), width, height };
  } finally {
    image.src = "";
    URL.revokeObjectURL(source);
  }
}

export function Uploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [original, setOriginal] = useState<Prepared | null>(null);
  const [result, setResult] = useState<Prepared | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [engine, setEngine] = useState("");
  const [progress, setProgress] = useState("Waiting");
  const [error, setError] = useState("");
  const [cleanupNotice, setCleanupNotice] = useState("");
  const [cropTarget, setCropTarget] = useState<CropTarget>(null);

  function clearWorkingState(notice = "") {
    if (original) revoke(original.url);
    if (result) revoke(result.url);
    setOriginal(null);
    setResult(null);
    setResultBlob(null);
    setFileName("");
    setEngine("");
    setProgress("Waiting");
    setError("");
    setStage("idle");
    setCropTarget(null);
    setCleanupNotice(notice);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function processFile(file: File) {
    if (stage === "processing") return;
    const problem = validateUploadBasics(file, MAX_MB);
    if (problem) {
      setError(problem);
      setStage("error");
      return;
    }

    if (original) revoke(original.url);
    if (result) revoke(result.url);
    setOriginal(null);
    setResult(null);
    setResultBlob(null);
    setFileName(file.name);
    setEngine("");
    setError("");
    setCleanupNotice("");
    setProgress("Preparing image…");
    setStage("processing");

    try {
      setOriginal(await previewFor(file, "Original image"));
      const output = await removeBackgroundWithFallback(file, setProgress);
      const prepared = await previewFor(output.blob, "Background removed image");
      setResultBlob(output.blob);
      setResult(prepared);
      setEngine(`IMG.LY IS-Net ${output.modelLabel} · browser only`);
      setProgress("Complete");
      setStage("complete");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Background removal failed in this browser.");
      setStage("error");
    }
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }

  function onPaste(event: ClipboardEvent<HTMLDivElement>) {
    for (let index = 0; index < event.clipboardData.files.length; index += 1) {
      const file = event.clipboardData.files.item(index);
      if (file?.type.startsWith("image/")) {
        event.preventDefault();
        void processFile(file);
        break;
      }
    }
  }

  function downloadResult() {
    if (!resultBlob) return;
    const href = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    const base = fileName.replace(/\.[^.]+$/, "") || "flythebg";
    link.href = href;
    link.download = `${base}-background-removed.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(href);
      clearWorkingState("Download started. FlytheBG released the uploaded image, cutout, and previews from this tab memory. The downloaded PNG remains on your device.");
    }, 1400);
  }

  if (stage === "complete" && original && result && resultBlob) {
    return (
      <div className="toolCard resultCard browserOnlyResult">
        <div className="toolTop">
          <div>
            <span className="toolKicker">Browser-only result</span>
            <h2>Your transparent PNG is ready.</h2>
          </div>
          <button className="textButton" onClick={() => clearWorkingState()}>New image</button>
        </div>

        <div className="localProcessingBanner">
          <span className="liveDot" />
          <div><strong>{engine}</strong><span>Your source photo was processed in this browser. It was not uploaded to FlytheBG, Render, Supabase, or an image database.</span></div>
        </div>

        <div className="beforeAfterGrid">
          <article className="comparePanel">
            <div className="compareHead"><span>Original</span><small>{original.width} × {original.height}px</small></div>
            <div className="imageStage soft"><img src={original.url} alt="Original upload preview" /></div>
          </article>
          <article className="comparePanel resultFocus">
            <div className="compareHead"><span>Background removed</span><small>{result.width} × {result.height}px</small></div>
            <div className="imageStage checker"><img src={result.url} alt="Background removed result" /></div>
          </article>
        </div>

        <div className="resultToolbar">
          <div><strong>Transparent PNG</strong><span>IMG.LY quantized automatically falls back to FP16 if the first model fails.</span></div>
          <div className="resultActions">
            <button className="secondaryButton" onClick={() => setCropTarget({ blob: resultBlob, label: "Browser AI" })}>Crop</button>
            <button className="primaryButton" onClick={downloadResult}>Download PNG & clear <span>↓</span></button>
          </div>
        </div>

        {cropTarget && <CropEditor sourceBlob={cropTarget.blob} fileName={fileName || "image.png"} label={cropTarget.label} onClose={() => setCropTarget(null)} />}
      </div>
    );
  }

  return (
    <div className="toolCard browserOnlyTool">
      <div className="toolTop">
        <div><span className="toolKicker">Private browser AI</span><h2>Remove the background on your device.</h2></div>
        <span className="securePill"><i/> No image upload</span>
      </div>

      <div className="browserModelStrip">
        <div><b>01</b><strong>IMG.LY Quantized</strong><span>Fast first attempt</span></div>
        <i>→</i>
        <div><b>02</b><strong>IMG.LY FP16</strong><span>Automatic fallback</span></div>
      </div>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="srOnly" onChange={onInput} />
      <div
        className={`dropZone ${dragging ? "dragging" : ""}`}
        role="button"
        tabIndex={0}
        onClick={() => stage !== "processing" && inputRef.current?.click()}
        onKeyDown={(event) => { if ((event.key === "Enter" || event.key === " ") && stage !== "processing") inputRef.current?.click(); }}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onPaste={onPaste}
      >
        {stage === "processing" ? (
          <div className="processingState" aria-live="polite">
            <div className="scanner"><i /></div>
            <strong>Removing the background locally…</strong>
            <p>The first browser model is tried before the higher-precision fallback.</p>
            <span className="fileHint">{progress}</span>
            <div className="indeterminate"><i /></div>
          </div>
        ) : (
          <>
            <div className="uploadIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg></div>
            <strong>Choose an image</strong>
            <p>or drag, drop, or paste</p>
            <span className="fileHint">PNG · JPEG · WebP · up to {MAX_MB} MB</span>
          </>
        )}
      </div>

      {stage === "error" && <div className="errorBox" role="alert"><strong>Browser AI could not finish.</strong><span>{error}</span><button onClick={() => clearWorkingState()}>Try another image</button></div>}
      {cleanupNotice && stage === "idle" && <div className="cleanupComplete"><strong>Working image cleared</strong><span>{cleanupNotice}</span></div>}

      <div className="privacyPromise">
        <strong>Your photo stays in your browser.</strong>
        <span>FlytheBG does not intentionally send image bytes to its database or hosting server. IMG.LY model/runtime files may be downloaded from IMG.LY infrastructure so browser inference can run.</span>
      </div>
    </div>
  );
}
