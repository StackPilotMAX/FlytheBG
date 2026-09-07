"use client";

import { useEffect, useRef, useState } from "react";
import {
  createWatermarkEngine,
  removeWatermarkFromImage,
  type WatermarkMeta,
  type WatermarkPosition,
} from "@pilio/gemini-watermark-remover/browser";

type Rect = { x: number; y: number; w: number; h: number };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

function toRect(position: WatermarkPosition | null | undefined): Rect | null {
  if (!position) return null;
  return { x: position.x, y: position.y, w: position.width, h: position.height };
}

function drawFrame(ctx: CanvasRenderingContext2D, source: HTMLVideoElement, width: number, height: number) {
  ctx.drawImage(source, 0, 0, width, height);
}

function applyReverseAlpha(
  ctx: CanvasRenderingContext2D,
  position: Rect,
  alpha: Float32Array,
) {
  const x = Math.max(0, Math.round(position.x));
  const y = Math.max(0, Math.round(position.y));
  const w = Math.min(Math.round(position.w), ctx.canvas.width - x);
  const h = Math.min(Math.round(position.h), ctx.canvas.height - y);
  if (w <= 0 || h <= 0) return;

  const pixels = ctx.getImageData(x, y, w, h);
  const alphaSize = Math.max(1, Math.round(Math.sqrt(alpha.length)));

  for (let row = 0; row < h; row += 1) {
    for (let col = 0; col < w; col += 1) {
      const mapX = clamp(Math.floor((col / Math.max(1, w)) * alphaSize), 0, alphaSize - 1);
      const mapY = clamp(Math.floor((row / Math.max(1, h)) * alphaSize), 0, alphaSize - 1);
      const raw = alpha[mapY * alphaSize + mapX] || 0;
      const magnitude = Math.abs(raw);
      if (magnitude < 0.01) continue;

      const a = Math.min(magnitude, 0.99);
      const inverse = 1 - a;
      const logo = raw < 0 ? 0 : 255;
      const index = (row * w + col) * 4;

      for (let channel = 0; channel < 3; channel += 1) {
        const watermarked = pixels.data[index + channel];
        const restored = (watermarked - a * logo) / inverse;
        pixels.data[index + channel] = clamp(Math.round(restored), 0, 255);
      }
    }
  }

  ctx.putImageData(pixels, x, y);
}

function confidence(meta: WatermarkMeta | null) {
  const value = meta?.detection?.adaptiveConfidence;
  return typeof value === "number" ? Math.round(clamp(value, 0, 1) * 100) : null;
}

function rectStyle(rect: Rect | null, width: number, height: number) {
  if (!rect || !width || !height) return null;
  return {
    left: `${(rect.x / width) * 100}%`,
    top: `${(rect.y / height) * 100}%`,
    width: `${(rect.w / width) * 100}%`,
    height: `${(rect.h / height) * 100}%`,
  };
}

function zoomStyle(rect: Rect | null, width: number, height: number) {
  if (!rect || !width || !height) return undefined;
  return {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    objectPosition: `${((rect.x + rect.w / 2) / width) * 100}% ${((rect.y + rect.h / 2) / height) * 100}%`,
    transform: `scale(${Math.max(2.5, 180 / Math.max(12, rect.w))})`,
    transformOrigin: "center",
  };
}

export function WatermarkRemoverAuto() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [cleanUrl, setCleanUrl] = useState("");
  const [position, setPosition] = useState<Rect | null>(null);
  const [meta, setMeta] = useState<WatermarkMeta | null>(null);
  const [mediaSize, setMediaSize] = useState({ w: 0, h: 0 });
  const [kind, setKind] = useState<"image" | "video">("image");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("Upload a Gemini image or video. The visible sparkle is located automatically.");
  const [elapsed, setElapsed] = useState(0);
  const [progress, setProgress] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  useEffect(() => {
    return () => objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  const rememberUrl = (url: string) => {
    objectUrlsRef.current.push(url);
    return url;
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
    setSourceUrl(rememberUrl(URL.createObjectURL(next)));
    setCleanUrl("");
    setPosition(null);
    setMeta(null);
    setMediaSize({ w: 0, h: 0 });
    setProgress(0);
    setElapsed(0);
    setMessage(isVideo ? "Video loaded. The first frame will locate the fixed visible sparkle automatically." : "Image loaded. Locating the visible Gemini sparkle…");
  };

  const processImage = async () => {
    if (!imageRef.current) return;
    const started = performance.now();
    setBusy(true);
    setMessage("Locating the visible sparkle and reconstructing only that small region…");

    try {
      const image = imageRef.current;
      const result = await removeWatermarkFromImage(image, { adaptiveMode: "auto" });
      const resultMeta = result.meta || null;
      const resultPosition = toRect(resultMeta?.position);
      setMeta(resultMeta);
      setPosition(resultPosition);

      if (!resultMeta?.applied || !resultPosition) {
        setCleanUrl("");
        setMessage("No verified Gemini visible watermark was found. Nothing was blurred or guessed.");
        return;
      }

      const canvas = result.canvas as HTMLCanvasElement;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not encode the cleaned image.")), "image/png");
      });
      const cleanObjectUrl = rememberUrl(URL.createObjectURL(blob));
      setCleanUrl(cleanObjectUrl);
      setElapsed((performance.now() - started) / 1000);
      const match = confidence(resultMeta);
      setMessage(`Visible watermark removed automatically${match !== null ? ` (${match}% detection confidence)` : ""}. The original pixels outside the detected region are left untouched.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Automatic Gemini watermark removal failed.");
    } finally {
      setBusy(false);
    }
  };

  const processVideo = async () => {
    if (!videoRef.current) return;
    const started = performance.now();
    setBusy(true);
    setProgress(0);
    setCleanUrl("");
    setMessage("Checking the first frame for the visible sparkle…");

    try {
      const video = videoRef.current;
      await new Promise<void>((resolve, reject) => {
        if (video.readyState >= 2 && video.videoWidth) resolve();
        else {
          const onLoaded = () => { cleanup(); resolve(); };
          const onError = () => { cleanup(); reject(new Error("Video could not be decoded.")); };
          const cleanup = () => {
            video.removeEventListener("loadeddata", onLoaded);
            video.removeEventListener("error", onError);
          };
          video.addEventListener("loadeddata", onLoaded, { once: true });
          video.addEventListener("error", onError, { once: true });
        }
      });

      const width = video.videoWidth;
      const height = video.videoHeight;
      setMediaSize({ w: width, h: height });
      video.pause();
      video.currentTime = 0;
      await new Promise<void>((resolve) => {
        const done = () => { video.removeEventListener("seeked", done); resolve(); };
        video.addEventListener("seeked", done, { once: true });
      });

      const engine = await createWatermarkEngine();
      const firstFrame = document.createElement("canvas");
      firstFrame.width = width;
      firstFrame.height = height;
      const firstCtx = firstFrame.getContext("2d", { willReadFrequently: true });
      if (!firstCtx) throw new Error("Canvas processing is unavailable in this browser.");
      drawFrame(firstCtx, video, width, height);

      const detection = await engine.removeWatermarkFromImage(firstFrame, { adaptiveMode: "auto", engine });
      const detectedPosition = toRect(detection.meta?.position);
      setMeta(detection.meta || null);
      setPosition(detectedPosition);
      if (!detection.meta?.applied || !detectedPosition) {
        setMessage("No verified Gemini visible watermark was found in the first frame. No video frames were altered.");
        return;
      }

      const alpha = await engine.getAlphaMap(Math.max(8, Math.round(Math.max(detectedPosition.w, detectedPosition.h))));
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("Canvas processing is unavailable in this browser.");

      const stream = canvas.captureStream(30);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 12_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };

      const stopped = new Promise<void>((resolve, reject) => {
        recorder.addEventListener("stop", () => resolve(), { once: true });
        recorder.addEventListener("error", () => reject(new Error("Video recording failed.")), { once: true });
      });

      let lastFrameTime = -1;
      const draw = () => {
        if (video.ended) return;
        drawFrame(ctx, video, width, height);
        applyReverseAlpha(ctx, detectedPosition, alpha);
        if (video.duration) setProgress(clamp(video.currentTime / video.duration, 0, 1));
        if (video.currentTime !== lastFrameTime) lastFrameTime = video.currentTime;
        if (!video.ended) requestAnimationFrame(draw);
      };

      recorder.start(250);
      video.currentTime = 0;
      await video.play();
      requestAnimationFrame(draw);
      await new Promise<void>((resolve) => {
        const finish = () => { video.removeEventListener("ended", finish); resolve(); };
        video.addEventListener("ended", finish, { once: true });
      });
      recorder.stop();
      await stopped;
      stream.getTracks().forEach((track) => track.stop());

      const blob = new Blob(chunks, { type: mime });
      if (blob.size < 1024) throw new Error("The cleaned video export was empty.");
      const cleanObjectUrl = rememberUrl(URL.createObjectURL(blob));
      setCleanUrl(cleanObjectUrl);
      setElapsed((performance.now() - started) / 1000);
      setProgress(1);
      setMessage("Visible watermark removed from the fixed watermark region across the video. Export is ready as WebM.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Automatic video watermark removal failed.");
    } finally {
      setBusy(false);
      if (videoRef.current) videoRef.current.pause();
    }
  };

  const process = () => {
    if (kind === "image") void processImage();
    else void processVideo();
  };

  const download = () => {
    if (!cleanUrl || !file) return;
    const anchor = document.createElement("a");
    anchor.href = cleanUrl;
    anchor.download = kind === "image" ? "flythebg-gemini-visible-watermark-clean.png" : "flythebg-gemini-visible-watermark-clean.webm";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  const rect = rectStyle(position, mediaSize.w, mediaSize.h);
  const zoom = zoomStyle(position, mediaSize.w, mediaSize.h);
  const match = confidence(meta);

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", borderRadius: 18, background: "#f7f7fb", border: "1px solid #e8e8ef", padding: 18, color: "#1f1f28", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`@media(max-width:760px){.wm-auto-grid{grid-template-columns:1fr!important}.wm-auto-upload{padding:28px 16px!important}.wm-auto-compare{grid-template-columns:1fr!important}}`}</style>

      <div
        className="wm-auto-upload"
        style={{ border: "2px dashed #c9c9d8", borderRadius: 14, padding: "34px 24px", textAlign: "center", background: "white", cursor: "pointer" }}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => { event.preventDefault(); selectFile(event.dataTransfer.files?.[0] || null); }}
      >
        <input ref={inputRef} type="file" hidden accept="image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime" onChange={(event) => selectFile(event.target.files?.[0] || null)} />
        <div style={{ fontSize: 16, fontWeight: 800 }}>Upload Gemini image or video</div>
        <div style={{ marginTop: 7, color: "#747482", fontSize: 13 }}>Drop the original export here — no X/Y positioning or watermark-size guessing.</div>
      </div>

      {file && (
        <>
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, fontWeight: 800, color: busy ? "#6756e8" : meta?.applied ? "#4b43b9" : "#777" }}>
            {busy ? (kind === "video" ? `Cleaning visible watermark… ${Math.round(progress * 100)}%` : "Locating and reconstructing visible watermark…") : message}
          </div>

          <div className="wm-auto-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 185px", gap: 16, marginTop: 12 }}>
            <div style={{ background: "white", borderRadius: 10, padding: 10, overflow: "hidden", minHeight: 240 }}>
              <div style={{ fontSize: 11, color: "#858592", marginBottom: 7, textAlign: "center", fontWeight: 800 }}>ORIGINAL</div>
              <div style={{ position: "relative", maxWidth: "100%", margin: "0 auto", width: "fit-content" }}>
                {kind === "image" ? (
                  <img ref={imageRef} src={sourceUrl} alt="Original Gemini image" onLoad={(event) => setMediaSize({ w: event.currentTarget.naturalWidth, h: event.currentTarget.naturalHeight })} style={{ display: "block", maxWidth: "100%", maxHeight: 430, borderRadius: 7 }} draggable={false} />
                ) : (
                  <video ref={videoRef} src={sourceUrl} controls playsInline preload="metadata" onLoadedMetadata={(event) => setMediaSize({ w: event.currentTarget.videoWidth, h: event.currentTarget.videoHeight })} style={{ display: "block", maxWidth: "100%", maxHeight: 430, borderRadius: 7 }} />
                )}
                {rect && kind === "image" && <div style={{ position: "absolute", border: "2px solid #5147d9", boxShadow: "0 0 0 9999px rgba(81,71,217,.035)", pointerEvents: "none", ...rect }} />}
              </div>
            </div>

            <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
              <div style={{ background: "white", borderRadius: 10, padding: 8, overflow: "hidden", border: "1px solid #e5e5eb" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#70707c", textAlign: "center", marginBottom: 7 }}>⌕ ZOOMED ORIGINAL</div>
                <div style={{ height: 150, borderRadius: 7, overflow: "hidden", background: "#ddd" }}>{kind === "image" && <img src={sourceUrl} alt="Zoomed original watermark area" style={zoom} />}</div>
              </div>
              <div style={{ background: "white", borderRadius: 10, padding: 8, overflow: "hidden", border: "1px solid #e5e5eb" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#15966f", textAlign: "center", marginBottom: 7 }}>✓ RECONSTRUCTED</div>
                <div style={{ height: 150, borderRadius: 7, overflow: "hidden", background: "#ddd" }}>
                  {cleanUrl && kind === "image" && <img src={cleanUrl} alt="Cleaned Gemini watermark area" style={zoom} />}
                  {!cleanUrl && <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#999", fontSize: 12, textAlign: "center", padding: 16 }}>{busy ? "Repairing the small detected region…" : "Automatic result will appear here"}</div>}
                </div>
              </div>
            </div>
          </div>

          <div className="wm-auto-compare" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 14 }}>
            <div style={{ padding: 12, borderRadius: 10, background: "white", border: "1px solid #e5e5eb" }}>
              <strong style={{ fontSize: 12 }}>Automatic detection</strong>
              <p style={{ margin: "6px 0 0", color: "#70707c", fontSize: 12 }}>{position ? `${Math.round(position.w)} × ${Math.round(position.h)} px region located${match !== null ? ` • ${match}% confidence` : ""}.` : "The tool only applies a repair after the Gemini-specific detector confirms a visible candidate."}</p>
            </div>
            <div style={{ padding: 12, borderRadius: 10, background: "white", border: "1px solid #e5e5eb" }}>
              <strong style={{ fontSize: 12 }}>What gets changed</strong>
              <p style={{ margin: "6px 0 0", color: "#70707c", fontSize: 12 }}>Only the visible sparkle region is reconstructed. This is not a blur, crop, or whole-image filter.</p>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            {!cleanUrl && <button type="button" onClick={process} disabled={busy} style={{ border: 0, background: "linear-gradient(90deg,#6255df,#493bd0)", color: "white", borderRadius: 9, padding: "10px 20px", cursor: busy ? "not-allowed" : "pointer", fontWeight: 800 }}>{busy ? "Processing…" : kind === "image" ? "Auto-Remove Visible Watermark" : "Auto-Remove Video Watermark"}</button>}
            {cleanUrl && <button type="button" onClick={download} style={{ border: 0, background: "#15966f", color: "white", borderRadius: 9, padding: "10px 20px", cursor: "pointer", fontWeight: 800 }}>Download Clean {kind === "image" ? "PNG" : "WebM"}</button>}
            {cleanUrl && <button type="button" onClick={() => { setCleanUrl(""); setMeta(null); setPosition(null); setElapsed(0); setProgress(0); setMessage("Ready to process another file."); }} style={{ border: "1px solid #dddde6", background: "white", borderRadius: 9, padding: "10px 18px", cursor: "pointer", fontWeight: 700 }}>Process Another</button>}
          </div>

          <div style={{ textAlign: "center", marginTop: 9, color: "#8a8a95", fontSize: 10 }}>{elapsed > 0 ? `${elapsed.toFixed(2)}s • local browser processing` : "Local browser processing • visible watermark only"}</div>
          <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "#fff9ed", border: "1px solid #f1dfbd", color: "#6b5730", fontSize: 11, lineHeight: 1.55 }}>
            <strong>Important:</strong> This tool targets the visible Gemini sparkle only. It does not claim to remove SynthID or other invisible provenance systems, and a cleaned visual appearance must not be represented as proof that media was camera-captured or non-AI. Use it only for media you own or are authorized to edit, and review the exported result before publishing.
          </div>
        </>
      )}

      <canvas ref={previewRef} hidden aria-hidden="true" />
    </div>
  );
}
