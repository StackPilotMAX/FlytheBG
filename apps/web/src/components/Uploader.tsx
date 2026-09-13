"use client";

import { ChangeEvent, ClipboardEvent, DragEvent, useId, useRef, useState } from "react";
import { CropEditor } from "@/components/CropEditor";
import { validateUploadBasics } from "@/lib/image-validation";

const MAX_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || "12") || 12;
const PREVIEW_EDGE = 960;

type Stage = "idle" | "processing" | "complete" | "error";
type Prepared = { url: string; width: number; height: number };
type CropTarget = { blob: Blob; label: string } | null;

function revoke(url?: string) {
  if (url?.startsWith("blob:")) URL.revokeObjectURL(url);
}

async function createPreview(blob: Blob, label: string): Promise<Prepared> {
  const sourceUrl = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`${label} could not be decoded by this browser.`));
      image.src = sourceUrl;
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
    if (!ctx) throw new Error("This browser cannot create an image preview.");
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const previewBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Preview encoding failed.")), "image/png");
    });
    canvas.width = canvas.height = 1;
    return { url: URL.createObjectURL(previewBlob), width, height };
  } finally {
    image.src = "";
    URL.revokeObjectURL(sourceUrl);
  }
}

async function removeBackground(file: File, onProgress: (message: string) => void) {
  onProgress("Uploading securely to the private FlytheBG processing service…");
  const form = new FormData();
  form.append("image", file, file.name);
  const response = await fetch("/api/remove-background", {
    method: "POST",
    body: form,
    cache: "no-store",
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(payload?.error || "Background removal failed. Please try again.");
  }
  onProgress("Hugging Face AI processing complete. Preparing your result…");
  const blob = await response.blob();
  if (!blob.type.startsWith("image/") || blob.size < 32) throw new Error("The background-removal service returned an invalid image.");
  return blob;
}

export function Uploader() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [original, setOriginal] = useState<Prepared | null>(null);
  const [result, setResult] = useState<Prepared | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [engine, setEngine] = useState("");
  const [progress, setProgress] = useState("Waiting for an image");
  const [error, setError] = useState("");
  const [cleanupNotice, setCleanupNotice] = useState("");
  const [cropTarget, setCropTarget] = useState<CropTarget>(null);

  function clearWorkingState(notice = "") {
    revoke(original?.url);
    revoke(result?.url);
    setOriginal(null); setResult(null); setResultBlob(null); setFileName("");
    setEngine(""); setProgress("Waiting for an image"); setError(""); setCropTarget(null);
    setStage("idle"); setCleanupNotice(notice);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function processFile(file: File) {
    if (stage === "processing") return;
    const problem = validateUploadBasics(file, MAX_MB);
    if (problem) { setError(problem); setStage("error"); return; }
    revoke(original?.url); revoke(result?.url);
    setOriginal(null); setResult(null); setResultBlob(null); setCropTarget(null);
    setFileName(file.name); setCleanupNotice(""); setError(""); setEngine("");
    setProgress("Preparing secure upload…"); setStage("processing");

    let originalPreview: Prepared | null = null;
    let resultPreview: Prepared | null = null;
    try {
      originalPreview = await createPreview(file, "Original image");
      setOriginal(originalPreview);
      const output = await removeBackground(file, setProgress);
      resultPreview = await createPreview(output, "Background removed image");
      setResultBlob(output);
      setResult(resultPreview);
      setEngine("Private Hugging Face AI · /remove_background · server-side processing");
      setProgress("Complete"); setStage("complete");
    } catch (reason) {
      if (originalPreview) revoke(originalPreview.url);
      if (resultPreview) revoke(resultPreview.url);
      setOriginal(null); setResult(null); setResultBlob(null);
      setError(reason instanceof Error ? reason.message : "Background removal failed.");
      setStage("error");
    }
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
  }
  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault(); setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }
  function onPaste(event: ClipboardEvent<HTMLElement>) {
    if (stage === "processing") return;
    for (let index = 0; index < event.clipboardData.files.length; index += 1) {
      const file = event.clipboardData.files.item(index);
      if (file?.type.startsWith("image/")) { event.preventDefault(); void processFile(file); break; }
    }
  }
  function downloadResult() {
    if (!resultBlob) return;
    const href = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    const base = fileName.replace(/\.[^.]+$/, "") || "flythebg";
    link.href = href; link.download = `${base}-background-removed.png`;
    document.body.appendChild(link); link.click(); link.remove();
    window.setTimeout(() => {
      URL.revokeObjectURL(href);
      clearWorkingState("Download started. The working source, cutout, and previews were released from this FlytheBG tab.");
    }, 1200);
  }

  if (stage === "complete" && original && result && resultBlob) {
    return (
      <section className="toolSurface resultSurface" aria-live="polite">
        <div className="surfaceHeader">
          <div><span className="kicker">Result ready</span><h2>Your transparent PNG is ready.</h2><p>{engine}</p></div>
          <button className="buttonGhost" type="button" onClick={() => clearWorkingState()}>New image</button>
        </div>
        <div className="privacyBar"><span className="statusDot"/><div><strong>Processed through FlytheBG&apos;s private Hugging Face AI service</strong><span>Your browser sends this image only to the FlytheBG processing route; the Hugging Face token stays server-side.</span></div></div>
        <div className="compareGrid">
          <article className="compareCard"><div className="compareTitle"><strong>Original</strong><span>{original.width} × {original.height}px</span></div><div className="imageWell"><img src={original.url} alt="Original selected image" /></div></article>
          <article className="compareCard emphasized"><div className="compareTitle"><strong>Background removed</strong><span>{result.width} × {result.height}px</span></div><div className="imageWell checker"><img src={result.url} alt="Background removed transparent PNG preview" /></div></article>
        </div>
        <div className="resultActionsBar">
          <div><strong>Transparent PNG</strong><span>The result is produced by the private Hugging Face Space and returned to this browser for preview and download.</span></div>
          <div className="buttonRow"><button className="buttonSecondary" type="button" onClick={() => setCropTarget({ blob: resultBlob, label: "Private Hugging Face AI" })}>Crop</button><button className="buttonPrimary" type="button" onClick={downloadResult}>Download PNG <span>↓</span></button></div>
        </div>
        {cropTarget && <CropEditor sourceBlob={cropTarget.blob} fileName={fileName || "image.png"} label={cropTarget.label} onClose={() => setCropTarget(null)} />}
      </section>
    );
  }

  return (
    <section className="toolSurface uploadSurface" onPaste={onPaste}>
      <div className="surfaceHeader">
        <div><span className="kicker">Private Hugging Face AI</span><h2>Drop an image. Get a clean transparent PNG.</h2><p>PNG, JPEG, and WebP images up to {MAX_MB} MB.</p></div>
        <span className="privacyPill">● Private server-side processing</span>
      </div>
      <div className="modelFlow" aria-label="Private background-removal model"><div><span>01</span><strong>Hugging Face Gradio AI</strong><small>Private Space · authenticated server-side · result returned to the requesting browser</small></div></div>
      <input ref={inputRef} id={inputId} className="srOnly" type="file" accept="image/png,image/jpeg,image/webp" onChange={onInput} disabled={stage === "processing"}/>
      <label htmlFor={inputId} className={`uploadDropZone ${dragging ? "dragging" : ""} ${stage === "processing" ? "busy" : ""}`} tabIndex={stage === "processing" ? -1 : 0} onDragEnter={(event) => { event.preventDefault(); if (stage !== "processing") setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
        {stage === "processing" ? <div className="processingPanel"><span className="spinner" aria-hidden="true"/><strong>Removing the background with private Hugging Face AI…</strong><p>{progress}</p><small>Your image is processed by the server-side FlytheBG route. The Hugging Face token is never sent to your browser.</small></div> : <div className="uploadPrompt"><span className="uploadGlyph" aria-hidden="true">↑</span><strong>Choose image</strong><p>Click, drag & drop, or paste an image here.</p><small>Your image is sent to FlytheBG&apos;s private background-removal service for processing.</small></div>}
      </label>
      {stage === "error" && <div className="errorNotice" role="alert"><div><strong>Background removal could not finish.</strong><p>{error}</p></div><button className="buttonSecondary" type="button" onClick={() => clearWorkingState()}>Try another image</button></div>}
      {cleanupNotice && stage === "idle" && <div className="successNotice"><strong>Working image cleared.</strong><span>{cleanupNotice}</span></div>}
      <div className="toolFootnote"><strong>Private Hugging Face AI.</strong><span>Your selected image is sent to FlytheBG&apos;s authenticated processing route and forwarded to the private Hugging Face Space. Background removal does not run locally in the browser.</span></div>
    </section>
  );
}
