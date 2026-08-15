"use client";

import { ChangeEvent, ClipboardEvent, DragEvent, useEffect, useRef, useState } from "react";
import { validateUploadBasics } from "@/lib/image-validation";

const configuredMaxMb = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || "12");
const MAX_MB = Number.isFinite(configuredMaxMb) && configuredMaxMb > 0 ? configuredMaxMb : 12;
type Stage = "idle" | "processing" | "complete" | "error";
type BackgroundMode = "transparent" | "white" | "black" | "custom";

export function Uploader() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const [error, setError] = useState("");
  const [background, setBackground] = useState<BackgroundMode>("transparent");
  const [customColor, setCustomColor] = useState("#dbeafe");

  useEffect(() => () => {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
  }, [originalUrl]);

  useEffect(() => () => {
    if (resultUrl) URL.revokeObjectURL(resultUrl);
  }, [resultUrl]);

  async function processFile(nextFile: File) {
    if (stage === "processing") return;
    const problem = validateUploadBasics(nextFile, MAX_MB);
    if (problem) { setError(problem); setStage("error"); return; }

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(nextFile);
    setOriginalUrl(URL.createObjectURL(nextFile));
    setResultUrl("");
    setError("");
    setStage("processing");

    try {
      const form = new FormData();
      form.append("image", nextFile);
      const response = await fetch("/api/remove-background", { method: "POST", body: form });
      if (!response.ok) {
        const body = await response.json().catch(() => ({ error: "Background removal failed." }));
        throw new Error(body.error || "Background removal failed.");
      }
      const output = await response.blob();
      setResultUrl(URL.createObjectURL(output));
      setStage("complete");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Background removal failed.");
      setStage("error");
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
    const next = Array.from(event.clipboardData.files).find((item) => item.type.startsWith("image/"));
    if (next) {
      event.preventDefault();
      void processFile(next);
    }
  }

  async function downloadResult() {
    if (!resultUrl) return;
    let href = resultUrl;
    let temporary = "";
    if (background !== "transparent") {
      const image = new Image();
      image.src = resultUrl;
      await image.decode();
      const canvas = document.createElement("canvas");
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.fillStyle = background === "white" ? "#ffffff" : background === "black" ? "#000000" : customColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
      if (!blob) return;
      temporary = URL.createObjectURL(blob);
      href = temporary;
    }
    const link = document.createElement("a");
    const base = file?.name.replace(/\.[^.]+$/, "") || "image";
    link.href = href;
    link.download = `${base}-flythebg.png`;
    link.click();
    if (temporary) URL.revokeObjectURL(temporary);
  }

  function reset() {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (resultUrl) URL.revokeObjectURL(resultUrl);
    setFile(null); setOriginalUrl(""); setResultUrl(""); setError(""); setStage("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  if (stage === "complete" && resultUrl) {
    const previewBackground = background === "transparent" ? undefined : background === "white" ? "#fff" : background === "black" ? "#000" : customColor;
    return (
      <div className="toolCard resultCard">
        <div className="toolTop"><div><span className="toolKicker">Result ready</span><h2>Fine-tune your cutout</h2></div><button className="textButton" onClick={reset}>New image</button></div>
        <div className="comparisonGrid">
          <figure><figcaption>Original</figcaption><div className="imageStage soft"><img src={originalUrl} alt="Original upload preview" /></div></figure>
          <figure><figcaption>Removed</figcaption><div className="imageStage checker" style={previewBackground ? { background: previewBackground } : undefined}><img src={resultUrl} alt="Background removed preview" /></div></figure>
        </div>
        <div className="editorPanel">
          <div><span className="controlLabel">Background</span><div className="swatches">
            <button aria-label="Transparent background" className={`swatch checkerSwatch ${background === "transparent" ? "active" : ""}`} onClick={() => setBackground("transparent")} />
            <button aria-label="White background" className={`swatch whiteSwatch ${background === "white" ? "active" : ""}`} onClick={() => setBackground("white")} />
            <button aria-label="Black background" className={`swatch blackSwatch ${background === "black" ? "active" : ""}`} onClick={() => setBackground("black")} />
            <label className={`swatch colorSwatch ${background === "custom" ? "active" : ""}`} style={{ background: customColor }} title="Custom color"><input aria-label="Choose custom background color" type="color" value={customColor} onChange={(e) => { setCustomColor(e.target.value); setBackground("custom"); }} /></label>
          </div></div>
          <button className="primaryButton fullButton" onClick={() => void downloadResult()}>Download PNG <span>↓</span></button>
        </div>
      </div>
    );
  }

  return (
    <div className="toolCard">
      <div className="toolTop"><div><span className="toolKicker">Background remover</span><h2>Drop an image here</h2></div><span className="securePill">Private flow</span></div>
      <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="srOnly" onChange={onInput} />
      <div
        className={`dropZone ${dragging ? "dragging" : ""}`}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onPaste={onPaste}
        role="button" tabIndex={0}
        onClick={() => stage !== "processing" && inputRef.current?.click()}
        onKeyDown={(e) => { if ((e.key === "Enter" || e.key === " ") && stage !== "processing") inputRef.current?.click(); }}
      >
        {stage === "processing" ? (
          <div className="processingState" aria-live="polite"><div className="spinner" /><strong>Removing background…</strong><p>Preparing pixels and running AI inference.</p><div className="indeterminate"><i /></div></div>
        ) : (
          <><div className="uploadIcon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 13v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg></div><strong>Choose an image</strong><p>or drag & drop it here</p><span className="fileHint">PNG · JPEG · WebP · up to {MAX_MB} MB · paste supported</span></>
        )}
      </div>
      {stage === "error" && <div className="errorBox" role="alert"><strong>Couldn’t process that image.</strong><span>{error}</span><button onClick={reset}>Try another</button></div>}
      <div className="toolFinePrint"><span>✓ No account required</span><span>✓ Transparent PNG output</span><span>By using FlytheBG you accept our <a href="/terms">Terms</a> and <a href="/privacy">Privacy Policy</a>.</span></div>
    </div>
  );
}
