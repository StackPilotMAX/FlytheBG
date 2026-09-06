"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { removeWatermarkFromImage, type WatermarkMeta, type WatermarkPosition } from "@pilio/gemini-watermark-remover/browser";

type Rect = { x: number; y: number; w: number; h: number };
type Kind = "image" | "video";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

function toRect(position: WatermarkPosition | null | undefined): Rect | null {
  if (!position) return null;
  return { x: position.x, y: position.y, w: position.width, h: position.height };
}

function confidence(meta: WatermarkMeta | null) {
  const value = meta?.detection?.adaptiveConfidence;
  return typeof value === "number" ? Math.round(clamp(value, 0, 1) * 100) : null;
}

function displayRect(rect: Rect | null, mediaW: number, mediaH: number, scale: number, ox: number, oy: number) {
  if (!rect || !mediaW || !mediaH) return null;
  const w = rect.w * scale / 100;
  const h = rect.h * scale / 100;
  return {
    x: clamp(rect.x + (rect.w - w) / 2 + ox, 0, Math.max(0, mediaW - w)),
    y: clamp(rect.y + (rect.h - h) / 2 + oy, 0, Math.max(0, mediaH - h)),
    w,
    h,
  };
}

function drawSource(source: CanvasImageSource, width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d")!.drawImage(source, 0, 0, width, height);
  return canvas;
}

async function canvasBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Could not encode image.")), "image/png"));
}

export function WatermarkRemoverAuto() {
  const [file, setFile] = useState<File | null>(null);
  const [kind, setKind] = useState<Kind>("image");
  const [sourceUrl, setSourceUrl] = useState("");
  const [detected, setDetected] = useState<Rect | null>(null);
  const [meta, setMeta] = useState<WatermarkMeta | null>(null);
  const [cleanCanvas, setCleanCanvas] = useState<HTMLCanvasElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [strength, setStrength] = useState(100);
  const [scale, setScale] = useState(100);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const [busy, setBusy] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [message, setMessage] = useState("Upload a Gemini image. The watermark will be located automatically.");
  const [elapsed, setElapsed] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewObjectRef = useRef("");

  const mediaSize = useMemo(() => ({
    w: imgRef.current?.naturalWidth || videoRef.current?.videoWidth || 0,
    h: imgRef.current?.naturalHeight || videoRef.current?.videoHeight || 0,
  }), [file, sourceUrl, cleanCanvas]);

  const active = displayRect(detected, mediaSize.w, mediaSize.h, scale, ox, oy);
  const confidencePct = confidence(meta);
  const detectionLabel = meta?.applied && active
    ? `Auto-Detected: ${meta.decisionTier === "adaptive" ? "New Gemini (Adaptive)" : "Gemini (Verified)"} (${Math.round(active.w)}px)${confidencePct !== null ? ` (${confidencePct}% match)` : ""}`
    : detecting ? "Scanning image for Gemini watermark…" : "Gemini watermark not detected";

  useEffect(() => {
    if (!file) return;
    const objectUrl = URL.createObjectURL(file);
    setSourceUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  useEffect(() => () => {
    if (previewObjectRef.current) URL.revokeObjectURL(previewObjectRef.current);
  }, []);

  const reset = () => {
    setStrength(100);
    setScale(100);
    setOx(0);
    setOy(0);
  };

  const selectFile = (next: File | null) => {
    if (!next) return;
    const isImage = next.type.startsWith("image/");
    const isVideo = next.type.startsWith("video/");
    if (!isImage && !isVideo) {
      setMessage("Please choose a PNG, JPG, WebP, MP4, WebM, or MOV file.");
      return;
    }
    setFile(next);
    setKind(isVideo ? "video" : "image");
    setDetected(null);
    setMeta(null);
    setCleanCanvas(null);
    setPreviewUrl("");
    reset();
    setMessage(isVideo ? "Video loaded. Detection will use the first frame." : "Image loaded. Locating the watermark automatically…");
    if (isImage) {
      const objectUrl = URL.createObjectURL(next);
      const image = new Image();
      image.onload = async () => {
        setDetecting(true);
        try {
          const result = await removeWatermarkFromImage(image, { adaptiveMode: "auto" });
          setMeta(result.meta);
          setDetected(toRect(result.meta?.position));
          setCleanCanvas(result.canvas as HTMLCanvasElement);
          if (result.meta?.applied && result.meta.position) {
            const confidenceText = confidence(result.meta);
            setMessage(`Watermark located automatically${confidenceText !== null ? ` with ${confidenceText}% confidence` : ""}. Preview the cleaned pixels below.`);
          } else {
            setMessage("No verified Gemini watermark was found. Nothing was blurred or guessed.");
          }
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "Automatic detection failed.");
        } finally {
          setDetecting(false);
          URL.revokeObjectURL(objectUrl);
        }
      };
      image.onerror = () => {
        setDetecting(false);
        URL.revokeObjectURL(objectUrl);
        setMessage("The image could not be decoded.");
      };
      image.src = objectUrl;
    }
  };

  const processAdjustedImage = async () => {
    if (!imgRef.current || !detected) throw new Error("No detected watermark region is available.");
    const source = imgRef.current;
    const maxSide = Math.max(source.naturalWidth, source.naturalHeight);
    const factor = Math.min(1, 4200 / maxSide);
    const w = Math.max(1, Math.round(source.naturalWidth * factor));
    const h = Math.max(1, Math.round(source.naturalHeight * factor));
    const canvas = drawSource(source, w, h);
    if (strength === 100 && scale === 100 && ox === 0 && oy === 0) return cleanCanvas || canvas;

    const { createWatermarkEngine } = await import("@pilio/gemini-watermark-remover/browser");
    const engine = await createWatermarkEngine();
    const alphaSize = Math.max(1, Math.round(detected.w * factor));
    const alpha = await engine.getAlphaMap(alphaSize);
    const target = displayRect({ x: detected.x * factor, y: detected.y * factor, w: detected.w * factor, h: detected.h * factor }, w, h, scale, ox * factor, oy * factor);
    if (!target) return canvas;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    const pixels = ctx.getImageData(0, 0, w, h);
    const gain = clamp(strength / 100, 0.15, 1.25);
    for (let y = 0; y < Math.round(target.h); y++) {
      for (let x = 0; x < Math.round(target.w); x++) {
        const ax = clamp(Math.floor(x / Math.max(1, target.w) * alphaSize), 0, alphaSize - 1);
        const ay = clamp(Math.floor(y / Math.max(1, target.h) * alphaSize), 0, alphaSize - 1);
        const a = Math.min(0.985, Math.abs(alpha[ay * alphaSize + ax] || 0) * gain);
        if (a < 0.002) continue;
        const px = Math.round(target.x + x);
        const py = Math.round(target.y + y);
        if (px < 0 || py < 0 || px >= w || py >= h) continue;
        const i = (py * w + px) * 4;
        const logo = (alpha[ay * alphaSize + ax] || 0) < 0 ? 0 : 255;
        const inv = 1 - a;
        for (let c = 0; c < 3; c++) pixels.data[i + c] = clamp(Math.round((pixels.data[i + c] - a * logo) / inv), 0, 255);
      }
    }
    ctx.putImageData(pixels, 0, 0);
    return canvas;
  };

  const preview = async () => {
    if (kind !== "image" || !detected) return;
    const started = performance.now();
    setBusy(true);
    try {
      const canvas = await processAdjustedImage();
      const blob = await canvasBlob(canvas);
      if (previewObjectRef.current) URL.revokeObjectURL(previewObjectRef.current);
      previewObjectRef.current = URL.createObjectURL(blob);
      setPreviewUrl(previewObjectRef.current);
      setElapsed((performance.now() - started) / 1000);
      setMessage("Preview ready. Compare the zoomed original and cleaned region before exporting.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Preview failed.");
    } finally {
      setBusy(false);
    }
  };

  const exportImage = async () => {
    if (kind !== "image" || !detected) return;
    const started = performance.now();
    setBusy(true);
    try {
      const canvas = await processAdjustedImage();
      const blob = await canvasBlob(canvas);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flythebg-gemini-clean.png";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      setElapsed((performance.now() - started) / 1000);
      setMessage(`Done in ${((performance.now() - started) / 1000).toFixed(1)}s. Clean PNG exported.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  };

  const zoomStyle = (rect: Rect | null) => rect ? ({
    objectFit: "cover" as const,
    objectPosition: `${((rect.x + rect.w / 2) / Math.max(1, mediaSize.w)) * 100}% ${((rect.y + rect.h / 2) / Math.max(1, mediaSize.h)) * 100}%`,
    transform: `scale(${Math.max(2.5, 180 / Math.max(12, rect.w))})`,
    transformOrigin: "center",
  }) : undefined;

  const cropBox = active ? {
    left: `${active.x / Math.max(1, mediaSize.w) * 100}%`,
    top: `${active.y / Math.max(1, mediaSize.h) * 100}%`,
    width: `${active.w / Math.max(1, mediaSize.w) * 100}%`,
    height: `${active.h / Math.max(1, mediaSize.h) * 100}%`,
  } : null;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", borderRadius: 18, background: "#f7f7fb", border: "1px solid #e8e8ef", padding: 18, color: "#1f1f28", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`@media(max-width:760px){.wm-grid{grid-template-columns:1fr!important}.wm-controls{grid-template-columns:1fr 1fr!important}.wm-upload{padding:28px 16px!important}}`}</style>
      <div className="wm-upload" style={{ border: "2px dashed #c9c9d8", borderRadius: 14, padding: "34px 24px", textAlign: "center", background: "white", cursor: "pointer" }} onClick={() => inputRef.current?.click()}>
        <input ref={inputRef} type="file" hidden accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime" onChange={(e) => selectFile(e.target.files?.[0] || null)} />
        <div style={{ fontSize: 16, fontWeight: 700 }}>Upload Gemini image or video</div>
        <div style={{ marginTop: 7, color: "#747482", fontSize: 13 }}>Drop a file here or tap to choose one</div>
      </div>

      {file && kind === "image" && (
        <>
          <div style={{ marginTop: 18, textAlign: "center", fontSize: 13, fontWeight: 700, color: detecting ? "#6756e8" : meta?.applied ? "#4b43b9" : "#777" }}>{detectionLabel}</div>
          <div className="wm-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 185px", gap: 16, marginTop: 12 }}>
            <div style={{ position: "relative", background: "#fff", borderRadius: 10, padding: 10, overflow: "hidden", minHeight: 240 }}>
              <div style={{ fontSize: 11, color: "#858592", marginBottom: 7, textAlign: "center", fontWeight: 700 }}>PREVIEW (FULL FRAME)</div>
              <div style={{ position: "relative", maxWidth: "100%", margin: "0 auto", width: "fit-content" }}>
                <img ref={imgRef} src={sourceUrl} alt="Original" style={{ display: "block", maxWidth: "100%", maxHeight: 410, borderRadius: 7 }} />
                {cropBox && <div style={{ position: "absolute", border: "2px solid #5147d9", pointerEvents: "none", ...cropBox }} />}
              </div>
            </div>
            <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
              <div style={{ background: "white", borderRadius: 10, padding: 8, overflow: "hidden", border: "1px solid #e5e5eb" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#70707c", textAlign: "center", marginBottom: 7 }}>⌕ ZOOMED ORIGINAL</div>
                <div style={{ height: 150, borderRadius: 7, overflow: "hidden", background: "#ddd" }}><img src={sourceUrl} alt="Zoomed original" style={{ width: "100%", height: "100%", ...zoomStyle(active) }} /></div>
              </div>
              <div style={{ background: "white", borderRadius: 10, padding: 8, overflow: "hidden", border: "1px solid #e5e5eb" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#15966f", textAlign: "center", marginBottom: 7 }}>✓ ZOOMED CLEANED</div>
                <div style={{ height: 150, borderRadius: 7, overflow: "hidden", background: "#ddd" }}>{previewUrl ? <img src={previewUrl} alt="Zoomed cleaned" style={{ width: "100%", height: "100%", ...zoomStyle(active) }} /> : cleanCanvas ? <canvas ref={(node) => { if (node) { node.width = cleanCanvas.width; node.height = cleanCanvas.height; node.getContext("2d")?.drawImage(cleanCanvas, 0, 0); } }} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#999", fontSize: 12 }}>Waiting for detection</div>}</div>
              </div>
            </div>
          </div>

          <div className="wm-controls" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 14, background: "white", borderRadius: 10, padding: "12px 14px" }}>
            {[["Strength (Gain)", strength, setStrength, 25, 125, strength === 100 ? "1.00×" : `${(strength / 100).toFixed(2)}×`],["Size Scale", scale, setScale, 70, 140, `${(scale / 100).toFixed(2)}×`],["Position X", ox, setOx, -Math.max(300, Math.round(mediaSize.w * .15)), Math.max(300, Math.round(mediaSize.w * .15)), `${ox}px`],["Position Y", oy, setOy, -Math.max(300, Math.round(mediaSize.h * .15)), Math.max(300, Math.round(mediaSize.h * .15)), `${oy}px`]].map(([label,value,setter,min,max,display]) => <label key={String(label)} style={{ fontSize: 10, fontWeight: 800, color: "#70707d" }}><div style={{ display: "flex", justifyContent: "space-between", gap: 5, marginBottom: 7 }}><span>{String(label)}</span><span style={{ color: "#5147d9" }}>{String(display)}</span></div><input aria-label={String(label)} type="range" min={Number(min)} max={Number(max)} value={Number(value)} onChange={(e) => (setter as (v:number)=>void)(Number(e.target.value))} style={{ width: "100%", accentColor: "#5147d9" }} /></label>)}
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginTop: 12 }}>
            <button type="button" onClick={reset} disabled={busy} style={{ border: "1px solid #dddde6", background: "white", borderRadius: 9, padding: "10px 16px", cursor: "pointer" }}>↻ Reset Sliders</button>
            <button type="button" onClick={preview} disabled={busy || !detected} style={{ border: "1px solid #d5d2fb", background: "white", color: "#5147d9", borderRadius: 9, padding: "10px 18px", fontWeight: 700, cursor: "pointer" }}>{busy ? "Processing…" : "Preview Result"}</button>
            <button type="button" onClick={exportImage} disabled={busy || !detected} style={{ border: 0, background: "#5147d9", color: "white", borderRadius: 9, padding: "10px 20px", fontWeight: 800, cursor: "pointer" }}>Remove &amp; Export Image</button>
          </div>
        </>
      )}

      {file && kind === "video" && <VideoPanel file={file} onMessage={setMessage} />}

      <div style={{ marginTop: 12, textAlign: "center", color: "#777783", fontSize: 12 }}>{message}{elapsed > 0 ? ` • ${elapsed.toFixed(1)}s` : ""}</div>
    </div>
  );
}

function VideoPanel({ file, onMessage }: { file: File; onMessage: (s: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [url, setUrl] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  useEffect(() => { const u = URL.createObjectURL(file); setUrl(u); return () => URL.revokeObjectURL(u); }, [file]);

  const run = async () => {
    if (!video.current) return;
    setRunning(true); setProgress(0);
    try {
      const { createWatermarkEngine } = await import("@pilio/gemini-watermark-remover/browser");
      const engine = await createWatermarkEngine();
      const v = video.current;
      await new Promise<void>((resolve) => { if (v.readyState >= 2) resolve(); else v.addEventListener("loadeddata", () => resolve(), { once: true }); });
      const w = v.videoWidth, h = v.videoHeight;
      const first = document.createElement("canvas"); first.width = w; first.height = h; first.getContext("2d")!.drawImage(v, 0, 0, w, h);
      const firstResult = await removeWatermarkFromImage(first, { adaptiveMode: "auto", engine });
      const position = firstResult.meta?.position;
      if (!position) throw new Error("No verified Gemini watermark was found in the first frame.");
      const alpha = await engine.getAlphaMap(Math.max(1, Math.round(position.width)));
      const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12000000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
      const ended = new Promise<void>((resolve) => { v.onended = () => resolve(); });
      v.currentTime = 0; await v.play();
      const frame = () => {
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(v, 0, 0, w, h);
        const pixels = ctx.getImageData(Math.round(position.x), Math.round(position.y), Math.round(position.width), Math.round(position.height));
        for (let y = 0; y < pixels.height; y++) for (let x = 0; x < pixels.width; x++) {
          const a = Math.min(0.985, Math.abs(alpha[y * pixels.width + x] || 0)); if (a < 0.002) continue;
          const i = (y * pixels.width + x) * 4; const logo = (alpha[y * pixels.width + x] || 0) < 0 ? 0 : 255; const inv = 1 - a;
          for (let c = 0; c < 3; c++) pixels.data[i+c] = clamp(Math.round((pixels.data[i+c] - a * logo) / inv), 0, 255);
        }
        ctx.putImageData(pixels, Math.round(position.x), Math.round(position.y));
        setProgress(v.duration ? v.currentTime / v.duration : 0);
        if (!v.ended) requestAnimationFrame(frame);
      };
      recorder.start(250); requestAnimationFrame(frame); await ended; recorder.stop();
      await new Promise<void>((resolve) => recorder.onstop = () => resolve());
      const blob = new Blob(chunks, { type: mime });
      const download = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = download; a.download = "flythebg-gemini-clean.webm"; a.click(); setTimeout(() => URL.revokeObjectURL(download), 2000);
      onMessage("Video watermark detected automatically and exported as WebM.");
    } catch (error) { onMessage(error instanceof Error ? error.message : "Video processing failed."); }
    finally { setRunning(false); }
  };

  return <div style={{ marginTop: 18, background: "white", borderRadius: 12, padding: 14 }}><video ref={video} src={url} controls style={{ width: "100%", maxHeight: 430, borderRadius: 8 }} /><div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}><button type="button" onClick={run} disabled={running} style={{ border: 0, background: "#5147d9", color: "white", borderRadius: 9, padding: "11px 18px", fontWeight: 800 }}>{running ? `Removing… ${Math.round(progress*100)}%` : "Auto-Detect & Remove Video Watermark"}</button><span style={{ color: "#777", fontSize: 12 }}>Detection happens from the first frame; no X/Y positioning is required.</span></div></div>;
}
