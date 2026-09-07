"use client";

import { useEffect, useRef, useState } from "react";
import { createWatermarkEngine, removeWatermarkFromImage, type WatermarkMeta, type WatermarkPosition } from "@pilio/gemini-watermark-remover/browser";

type Rect = { x: number; y: number; w: number; h: number };
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const toRect = (p: WatermarkPosition | null | undefined): Rect | null => p ? { x: p.x, y: p.y, w: p.width, h: p.height } : null;
const confidence = (m: WatermarkMeta | null) => typeof m?.detection?.adaptiveConfidence === "number" ? Math.round(clamp(m.detection.adaptiveConfidence, 0, 1) * 100) : null;

async function canvasToBlob(canvas: HTMLCanvasElement | OffscreenCanvas, type = "image/png"): Promise<Blob> {
  if (typeof canvas.convertToBlob === "function") return canvas.convertToBlob({ type });
  if (typeof canvas.toBlob === "function") {
    return new Promise<Blob>((resolve, reject) => canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error("Could not encode the cleaned image.")), type));
  }
  throw new Error("This browser does not support canvas image export.");
}

function reverseAlpha(ctx: CanvasRenderingContext2D, rect: Rect, alpha: Float32Array) {
  const x = Math.max(0, Math.round(rect.x)), y = Math.max(0, Math.round(rect.y));
  const w = Math.min(Math.round(rect.w), ctx.canvas.width - x), h = Math.min(Math.round(rect.h), ctx.canvas.height - y);
  if (w <= 0 || h <= 0) return;
  const pixels = ctx.getImageData(x, y, w, h);
  const size = Math.max(1, Math.round(Math.sqrt(alpha.length)));
  for (let row = 0; row < h; row++) for (let col = 0; col < w; col++) {
    const ax = clamp(Math.floor(col / Math.max(1, w) * size), 0, size - 1);
    const ay = clamp(Math.floor(row / Math.max(1, h) * size), 0, size - 1);
    const raw = alpha[ay * size + ax] || 0, a = Math.min(Math.abs(raw), 0.99);
    if (a < 0.01) continue;
    const logo = raw < 0 ? 0 : 255, inv = 1 - a, i = (row * w + col) * 4;
    for (let c = 0; c < 3; c++) pixels.data[i + c] = clamp(Math.round((pixels.data[i + c] - a * logo) / inv), 0, 255);
  }
  ctx.putImageData(pixels, x, y);
}

export function WatermarkRemoverAuto() {
  const [file, setFile] = useState<File | null>(null), [source, setSource] = useState(""), [clean, setClean] = useState("");
  const [kind, setKind] = useState<"image" | "video">("image"), [meta, setMeta] = useState<WatermarkMeta | null>(null);
  const [position, setPosition] = useState<Rect | null>(null), [busy, setBusy] = useState(false), [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("Upload a Gemini image or video. The visible sparkle is located automatically.");
  const imageRef = useRef<HTMLImageElement>(null), videoRef = useRef<HTMLVideoElement>(null), inputRef = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);
  useEffect(() => () => urls.current.forEach(URL.revokeObjectURL), []);
  const remember = (u: string) => { urls.current.push(u); return u; };

  const selectFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) return setMessage("Please choose an image or video file.");
    setFile(f); setKind(f.type.startsWith("video/") ? "video" : "image"); setSource(remember(URL.createObjectURL(f)));
    setClean(""); setMeta(null); setPosition(null); setProgress(0);
    setMessage(f.type.startsWith("video/") ? "Video loaded. The first frame will locate the fixed visible sparkle automatically." : "Image loaded. Locating the visible Gemini sparkle…");
  };

  const processImage = async () => {
    if (!imageRef.current) return; setBusy(true); setMessage("Locating the visible sparkle and reconstructing only that region…");
    try {
      const result = await removeWatermarkFromImage(imageRef.current, { adaptiveMode: "auto" });
      setMeta(result.meta); const rect = toRect(result.meta?.position); setPosition(rect);
      if (!result.meta?.applied || !rect) return setMessage("No verified Gemini visible watermark was found. Nothing was blurred or guessed.");
      const blob = await canvasToBlob(result.canvas as HTMLCanvasElement | OffscreenCanvas, "image/png");
      setClean(remember(URL.createObjectURL(blob))); const c = confidence(result.meta);
      setMessage(`Visible watermark removed automatically${c !== null ? ` (${c}% detection confidence)` : ""}.`);
    } catch (e) { setMessage(e instanceof Error ? e.message : "Automatic Gemini watermark removal failed."); }
    finally { setBusy(false); }
  };

  const processVideo = async () => {
    if (!videoRef.current) return; setBusy(true); setProgress(0); setClean(""); setMessage("Checking the first frame for the visible sparkle…");
    try {
      const video = videoRef.current;
      if (video.readyState < 2) await new Promise<void>((resolve, reject) => { const ok = () => { cleanup(); resolve(); }; const bad = () => { cleanup(); reject(new Error("Video could not be decoded.")); }; const cleanup = () => { video.removeEventListener("loadeddata", ok); video.removeEventListener("error", bad); }; video.addEventListener("loadeddata", ok, { once: true }); video.addEventListener("error", bad, { once: true }); });
      const width = video.videoWidth, height = video.videoHeight; video.pause(); video.currentTime = 0;
      await new Promise<void>(resolve => { if (video.readyState >= 2) resolve(); else video.addEventListener("seeked", () => resolve(), { once: true }); });
      const engine = await createWatermarkEngine(), frame = document.createElement("canvas"); frame.width = width; frame.height = height;
      const fctx = frame.getContext("2d", { willReadFrequently: true }); if (!fctx) throw new Error("Canvas processing is unavailable in this browser.");
      fctx.drawImage(video, 0, 0, width, height);
      const detection = await removeWatermarkFromImage(frame, { adaptiveMode: "auto", engine });
      setMeta(detection.meta); const rect = toRect(detection.meta?.position); setPosition(rect);
      if (!detection.meta?.applied || !rect) return setMessage("No verified Gemini visible watermark was found in the first frame. No video frames were altered.");
      const alpha = await engine.getAlphaMap(Math.max(8, Math.round(Math.max(rect.w, rect.h))));
      const canvas = document.createElement("canvas"); canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true }); if (!ctx) throw new Error("Canvas processing is unavailable in this browser.");
      const stream = canvas.captureStream(30), mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12_000_000 }), chunks: Blob[] = [];
      recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
      const stopped = new Promise<void>((resolve, reject) => { recorder.addEventListener("stop", () => resolve(), { once: true }); recorder.addEventListener("error", () => reject(new Error("Video recording failed.")), { once: true }); });
      const draw = () => { if (video.ended) return; ctx.drawImage(video, 0, 0, width, height); reverseAlpha(ctx, rect, alpha); if (video.duration) setProgress(clamp(video.currentTime / video.duration, 0, 1)); if (!video.ended) requestAnimationFrame(draw); };
      recorder.start(250); video.currentTime = 0; await video.play(); requestAnimationFrame(draw);
      await new Promise<void>(resolve => video.addEventListener("ended", () => resolve(), { once: true }));
      recorder.stop(); await stopped; stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: mime }); if (blob.size < 1024) throw new Error("The cleaned video export was empty.");
      setClean(remember(URL.createObjectURL(blob))); setProgress(1); setMessage("Visible watermark removed from the fixed region across the video. Export is ready as WebM.");
    } catch (e) { setMessage(e instanceof Error ? e.message : "Automatic video watermark removal failed."); }
    finally { setBusy(false); videoRef.current?.pause(); }
  };

  const process = () => kind === "image" ? void processImage() : void processVideo();
  const download = () => { if (!clean || !file) return; const a = document.createElement("a"); a.href = clean; a.download = kind === "image" ? "flythebg-gemini-visible-watermark-clean.png" : "flythebg-gemini-visible-watermark-clean.webm"; document.body.appendChild(a); a.click(); a.remove(); };
  const c = confidence(meta);

  return <div style={{ maxWidth: 980, margin: "0 auto", borderRadius: 18, background: "#f7f7fb", border: "1px solid #e8e8ef", padding: 18, color: "#1f1f28", fontFamily: "Inter,system-ui,sans-serif" }}>
    <style>{`@media(max-width:760px){.wm-auto-grid,.wm-auto-compare{grid-template-columns:1fr!important}}`}</style>
    <div onClick={() => inputRef.current?.click()} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); selectFile(e.dataTransfer.files?.[0] || null); }} style={{ border: "2px dashed #c9c9d8", borderRadius: 14, padding: "34px 24px", textAlign: "center", background: "white", cursor: "pointer" }}>
      <input ref={inputRef} hidden type="file" accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime" onChange={e => selectFile(e.target.files?.[0] || null)} />
      <div style={{ fontSize: 16, fontWeight: 800 }}>Upload Gemini image or video</div><div style={{ marginTop: 7, color: "#747482", fontSize: 13 }}>Automatic visible-sparkle detection — no X/Y positioning or watermark-size guessing.</div>
    </div>
    {file && <>
      <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, fontWeight: 800, color: busy ? "#6756e8" : meta?.applied ? "#4b43b9" : "#777" }}>{busy ? (kind === "video" ? `Cleaning visible watermark… ${Math.round(progress * 100)}%` : "Locating and reconstructing visible watermark…") : message}</div>
      <div className="wm-auto-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 185px", gap: 16, marginTop: 12 }}>
        <div style={{ background: "white", borderRadius: 10, padding: 10, overflow: "hidden", minHeight: 240 }}><div style={{ fontSize: 11, color: "#858592", marginBottom: 7, textAlign: "center", fontWeight: 800 }}>ORIGINAL</div>{kind === "image" ? <img ref={imageRef} src={source} alt="Original Gemini image" style={{ display: "block", maxWidth: "100%", maxHeight: 430, margin: "0 auto", borderRadius: 7 }} draggable={false} /> : <video ref={videoRef} src={source} controls playsInline preload="metadata" style={{ display: "block", maxWidth: "100%", maxHeight: 430, margin: "0 auto", borderRadius: 7 }} />}</div>
        <div style={{ display: "grid", gap: 14, alignContent: "start" }}><div style={{ background: "white", borderRadius: 10, padding: 8, border: "1px solid #e5e5eb" }}><div style={{ fontSize: 10, fontWeight: 800, color: "#70707c", textAlign: "center", marginBottom: 7 }}>AUTO DETECTION</div><div style={{ padding: 12, minHeight: 90, display: "grid", placeItems: "center", textAlign: "center", color: "#70707c", fontSize: 12 }}>{position ? `${Math.round(position.w)} × ${Math.round(position.h)} px region${c !== null ? ` • ${c}% confidence` : ""}` : "Waiting for verified Gemini candidate"}</div></div><div style={{ background: "white", borderRadius: 10, padding: 8, border: "1px solid #e5e5eb" }}><div style={{ fontSize: 10, fontWeight: 800, color: "#15966f", textAlign: "center", marginBottom: 7 }}>RESULT</div><div style={{ minHeight: 90, display: "grid", placeItems: "center", textAlign: "center", color: "#70707c", fontSize: 12 }}>{clean ? "Clean export ready" : busy ? "Reconstructing only the detected region…" : "Automatic result will appear here"}</div></div></div>
      </div>
      <div className="wm-auto-compare" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}><div style={{ padding: 12, borderRadius: 10, background: "white", border: "1px solid #e5e5eb" }}><strong style={{ fontSize: 12 }}>Automatic detection</strong><p style={{ margin: "6px 0 0", color: "#70707c", fontSize: 12 }}>Only a verified Gemini visible candidate is processed; there is no blind blur or manual coordinate control.</p></div><div style={{ padding: 12, borderRadius: 10, background: "white", border: "1px solid #e5e5eb" }}><strong style={{ fontSize: 12 }}>Visible mark only</strong><p style={{ margin: "6px 0 0", color: "#70707c", fontSize: 12 }}>The workflow does not remove or falsify SynthID or other invisible provenance.</p></div></div>
      <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>{!clean && <button type="button" onClick={process} disabled={busy} style={{ border: 0, background: "linear-gradient(90deg,#6255df,#493bd0)", color: "white", borderRadius: 9, padding: "10px 20px", cursor: busy ? "not-allowed" : "pointer", fontWeight: 800 }}>{busy ? "Processing…" : kind === "image" ? "Auto-Remove Visible Watermark" : "Auto-Remove Video Watermark"}</button>}{clean && <button type="button" onClick={download} style={{ border: 0, background: "#15966f", color: "white", borderRadius: 9, padding: "10px 20px", cursor: "pointer", fontWeight: 800 }}>Download Clean {kind === "image" ? "PNG" : "WebM"}</button>}{clean && <button type="button" onClick={() => { setClean(""); setMeta(null); setPosition(null); setProgress(0); setMessage("Ready to process another file."); }} style={{ border: "1px solid #dddde6", background: "white", borderRadius: 9, padding: "10px 18px", cursor: "pointer", fontWeight: 700 }}>Process Another</button>}</div>
      <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fff9ed", border: "1px solid #f1dfbd", color: "#6b5730", fontSize: 11, lineHeight: 1.55 }}><strong>Important:</strong> This tool targets the visible Gemini sparkle only. A cleaned visual appearance is not proof that media was camera-captured or non-AI. Use it only for media you own or are authorized to edit, and review the export before publishing.</div>
    </>}
  </div>;
}