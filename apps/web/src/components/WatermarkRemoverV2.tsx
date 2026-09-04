"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { createWatermarkEngine, type WatermarkEngine } from "@pilio/gemini-watermark-remover/browser";

type Kind = "image" | "video";
type Provider = "Gemini" | "Veo 3" | "Meta AI" | "Other";
type Rect = { x: number; y: number; w: number; h: number };
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

function getMetaGeometry(width: number, height: number): Rect {
  const minDim = Math.min(width, height);
  const size = Math.max(48, Math.round(minDim * 0.075));
  const margin = Math.max(24, Math.round(minDim * 0.0625));
  return { x: Math.max(0, width - margin - size * 1.8), y: Math.max(0, height - margin - size), w: size * 1.8, h: size };
}

function repairMetaRegion(c: HTMLCanvasElement, box: Rect) {
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  const source = document.createElement("canvas");
  const sw = Math.max(1, Math.round(box.w * 0.55));
  const sh = Math.max(1, Math.round(box.h));
  source.width = sw; source.height = sh;
  source.getContext("2d")?.drawImage(c, Math.max(0, Math.round(box.x - sw)), Math.round(box.y), sw, sh, 0, 0, sw, sh);
  ctx.save(); ctx.beginPath(); ctx.rect(Math.round(box.x), Math.round(box.y), Math.round(box.w), Math.round(box.h)); ctx.clip();
  ctx.drawImage(source, 0, 0, sw, sh, Math.round(box.x), Math.round(box.y), Math.round(box.w), Math.round(box.h));
  ctx.restore();
}

function resizeAlphaMap(source: Float32Array, sourceSize: number, targetSize: number) {
  if (targetSize === sourceSize) return new Float32Array(source);
  const out = new Float32Array(targetSize * targetSize);
  const max = Math.max(1, sourceSize - 1);
  for (let y = 0; y < targetSize; y++) {
    const sy = (y / Math.max(1, targetSize - 1)) * max;
    const y0 = Math.floor(sy), y1 = Math.min(max, y0 + 1), fy = sy - y0;
    for (let x = 0; x < targetSize; x++) {
      const sx = (x / Math.max(1, targetSize - 1)) * max;
      const x0 = Math.floor(sx), x1 = Math.min(max, x0 + 1), fx = sx - x0;
      const a = source[y0 * sourceSize + x0] ?? 0;
      const b = source[y0 * sourceSize + x1] ?? a;
      const c = source[y1 * sourceSize + x0] ?? a;
      const d = source[y1 * sourceSize + x1] ?? a;
      out[y * targetSize + x] = a * (1 - fx) * (1 - fy) + b * fx * (1 - fy) + c * (1 - fx) * fy + d * fx * fy;
    }
  }
  return out;
}

function applyReverseAlphaBlend(c: HTMLCanvasElement, alphaMap: Float32Array, position: Rect, gain: number) {
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unavailable.");
  const image = ctx.getImageData(0, 0, c.width, c.height);
  const alphaWidth = Math.max(1, Math.round(position.w));
  const alphaHeight = Math.max(1, Math.round(position.h));
  const x0 = Math.max(0, Math.round(position.x));
  const y0 = Math.max(0, Math.round(position.y));
  const w = Math.min(alphaWidth, c.width - x0);
  const h = Math.min(alphaHeight, c.height - y0);
  if (w <= 0 || h <= 0) return;
  const safeGain = clamp(gain, 0.25, 2.5);
  for (let row = 0; row < h; row++) {
    for (let col = 0; col < w; col++) {
      const raw = alphaMap[row * alphaWidth + col] ?? 0;
      const magnitude = Math.abs(raw);
      const signal = Math.max(0, magnitude - 3 / 255) * safeGain;
      if (signal < 0.002) continue;
      const alpha = Math.min(magnitude * safeGain, 0.99);
      const oneMinus = 1 - alpha;
      const logo = raw < 0 ? 0 : 255;
      const idx = ((y0 + row) * image.width + (x0 + col)) * 4;
      for (let channel = 0; channel < 3; channel++) {
        const watermarked = image.data[idx + channel];
        const original = (watermarked - alpha * logo) / oneMinus;
        image.data[idx + channel] = Math.max(0, Math.min(255, Math.round(original)));
      }
    }
  }
  ctx.putImageData(image, 0, 0);
}

export function WatermarkRemoverV2() {
  const [kind, setKind] = useState<Kind>("image");
  const [provider, setProvider] = useState<Provider>("Gemini");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [sel, setSel] = useState<Rect | null>(null);
  const [strength, setStrength] = useState(100);
  const [scale, setScale] = useState(100);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const [busy, setBusy] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [previewUrl, setPreviewUrl] = useState("");
  const [mediaSize, setMediaSize] = useState({ w: 0, h: 0 });
  const [msg, setMsg] = useState("Upload an image or video. Processing stays local in your browser.");
  const [engine, setEngine] = useState<WatermarkEngine | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => { createWatermarkEngine().then(setEngine).catch(() => setMsg("The automatic watermark engine could not initialize in this browser.")); }, []);
  useEffect(() => { if (!file) return; const objectUrl = URL.createObjectURL(file); setUrl(objectUrl); return () => URL.revokeObjectURL(objectUrl); }, [file]);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  useEffect(() => {
    if (!busy) return;
    const started = performance.now();
    const id = window.setInterval(() => setElapsed((performance.now() - started) / 1000), 100);
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    addEventListener("beforeunload", guard);
    return () => { clearInterval(id); removeEventListener("beforeunload", guard); };
  }, [busy]);

  const preset = useMemo(() => {
    if (!mediaSize.w || !mediaSize.h) return null;
    if (provider === "Meta AI") return getMetaGeometry(mediaSize.w, mediaSize.h);
    if (!engine) return null;
    const info = engine.getWatermarkInfo(mediaSize.w, mediaSize.h);
    return { x: info.position.x, y: info.position.y, w: info.position.width, h: info.position.height };
  }, [engine, mediaSize, provider]);

  const active = sel ? {
    x: clamp(sel.x + ox / Math.max(1, mediaSize.w) * 100, 0, 100),
    y: clamp(sel.y + oy / Math.max(1, mediaSize.h) * 100, 0, 100),
    w: clamp(sel.w * scale / 100, 1, 100), h: clamp(sel.h * scale / 100, 1, 100)
  } : preset ? {
    x: clamp((preset.x + (preset.w - preset.w * scale / 100) / 2 + ox) / mediaSize.w * 100, 0, 100),
    y: clamp((preset.y + (preset.h - preset.h * scale / 100) / 2 + oy) / mediaSize.h * 100, 0, 100),
    w: clamp(preset.w / mediaSize.w * 100 * scale / 100, 1, 100),
    h: clamp(preset.h / mediaSize.h * 100 * scale / 100, 1, 100)
  } : null;

  const point = (event: ReactPointerEvent) => {
    const bounds = stage.current?.getBoundingClientRect();
    return bounds ? { x: clamp((event.clientX - bounds.left) / bounds.width * 100, 0, 100), y: clamp((event.clientY - bounds.top) / bounds.height * 100, 0, 100) } : null;
  };
  const down = (event: ReactPointerEvent) => {
    if (busy || provider !== "Meta AI") return;
    const p = point(event); if (!p) return;
    drag.current = p; setSel({ x: p.x, y: p.y, w: 0, h: 0 });
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };
  const move = (event: ReactPointerEvent) => {
    if (!drag.current) return;
    const p = point(event); if (!p) return;
    const a = drag.current; setSel({ x: Math.min(a.x, p.x), y: Math.min(a.y, p.y), w: Math.abs(a.x - p.x), h: Math.abs(a.y - p.y) });
  };
  const choose = (next: File | null) => {
    if (!next) return;
    setFile(next); setKind(next.type.startsWith("video/") ? "video" : "image"); setSel(null); setPreviewUrl(""); setMediaSize({ w: 0, h: 0 });
    setStrength(100); setScale(100); setOx(0); setOy(0);
    setMsg(next.type.startsWith("video/") ? "Video loaded. Processing will preserve its original aspect ratio." : "Image loaded. Detection and reconstruction will preserve its original aspect ratio.");
  };

  const getCustomTarget = (w: number, h: number) => {
    if (sel) return { x: sel.x * w / 100 + ox, y: sel.y * h / 100 + oy, w: Math.max(1, sel.w * w / 100 * scale / 100), h: Math.max(1, sel.h * h / 100 * scale / 100) };
    if (!preset) return null;
    const scaledW = preset.w * scale / 100;
    const scaledH = preset.h * scale / 100;
    return { x: preset.x + (preset.w - scaledW) / 2 + ox, y: preset.y + (preset.h - scaledH) / 2 + oy, w: Math.max(1, scaledW), h: Math.max(1, scaledH) };
  };

  const processCanvas = async (source: HTMLImageElement | HTMLVideoElement, outputW: number, outputH: number) => {
    const c = canvas.current!; c.width = outputW; c.height = outputH;
    c.getContext("2d")!.drawImage(source, 0, 0, outputW, outputH);
    if (provider === "Meta AI") {
      const target = getCustomTarget(outputW, outputH); if (!target) throw new Error("Select a Meta AI watermark region first.");
      repairMetaRegion(c, target); return c;
    }
    if (!engine) throw new Error("Automatic watermark processing is still loading. Try again in a moment.");
    if (strength === 100 && scale === 100 && ox === 0 && oy === 0) {
      const processed = await engine.removeWatermarkFromImage(c);
      const ctx = c.getContext("2d")!;
      ctx.clearRect(0, 0, outputW, outputH);
      ctx.drawImage(processed as CanvasImageSource, 0, 0, outputW, outputH);
      return c;
    }
    const info = engine.getWatermarkInfo(outputW, outputH);
    const target = getCustomTarget(outputW, outputH); if (!target) throw new Error("Watermark geometry is not available yet.");
    const baseSize = Math.max(1, Math.round(info.size));
    const targetSize = Math.max(1, Math.round(Math.max(target.w, target.h)));
    const alpha = await engine.getAlphaMap(baseSize);
    applyReverseAlphaBlend(c, resizeAlphaMap(alpha, baseSize, targetSize), { ...target, w: targetSize, h: targetSize }, strength / 100);
    return c;
  };

  const previewImage = async () => {
    if (!img.current || !active) return;
    setBusy(true);
    try {
      const source = img.current; const down = Math.min(1, 1200 / Math.max(source.naturalWidth, source.naturalHeight));
      const c = await processCanvas(source, Math.max(1, Math.round(source.naturalWidth * down)), Math.max(1, Math.round(source.naturalHeight * down)));
      const blob = await new Promise<Blob | null>((resolve) => c.toBlob(resolve, "image/png")); if (!blob) throw new Error("Preview generation failed.");
      if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(URL.createObjectURL(blob)); setMsg("Preview ready. Compare the result with the original before downloading.");
    } catch (error) { setMsg(error instanceof Error ? error.message : "Preview failed."); }
    finally { setBusy(false); }
  };

  const exportImage = async () => {
    if (!img.current || !active) return;
    const started = performance.now(); setBusy(true);
    try {
      const source = img.current; const down = Math.min(1, 3200 / Math.max(source.naturalWidth, source.naturalHeight));
      const c = await processCanvas(source, Math.max(1, Math.round(source.naturalWidth * down)), Math.max(1, Math.round(source.naturalHeight * down)));
      const blob = await new Promise<Blob | null>((resolve) => c.toBlob(resolve, "image/png")); if (!blob) throw new Error("PNG export failed.");
      const objectUrl = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = objectUrl;
      anchor.download = `flythebg-${provider.toLowerCase().replaceAll(" ", "-")}-clean.png`; anchor.click(); setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      const time = (performance.now() - started) / 1000; setElapsed(time); setMsg(`Done in ${time.toFixed(1)}s. Clean PNG exported locally.`);
    } catch (error) { setMsg(error instanceof Error ? error.message : "Image processing failed."); }
    finally { setBusy(false); }
  };

  const exportVideo = async () => {
    if (!vid.current || !active) return;
    const started = performance.now(); setBusy(true);
    try {
      const video = vid.current, c = canvas.current!, w = video.videoWidth, h = video.videoHeight;
      if (!w || !h) throw new Error("Video metadata is not ready.");
      c.width = w; c.height = h; video.currentTime = 0;
      await new Promise<void>((resolve) => video.readyState >= 2 ? resolve() : video.addEventListener("loadeddata", () => resolve(), { once: true }));
      const stream = c.captureStream(30); const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime }); const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
      const finished = new Promise<void>((resolve, reject) => { recorder.onstop = () => resolve(); recorder.onerror = () => reject(new Error("Video recorder failed.")); });
      recorder.start(250); await video.play(); const ctx = c.getContext("2d")!;
      await new Promise<void>((resolve, reject) => {
        const tick = async () => {
          try {
            ctx.drawImage(video, 0, 0, w, h);
            if (provider === "Meta AI") {
              const target = getCustomTarget(w, h); if (target) repairMetaRegion(c, target);
            } else if (engine) {
              if (strength === 100 && scale === 100 && ox === 0 && oy === 0) {
                const processed = await engine.removeWatermarkFromImage(c);
                ctx.clearRect(0, 0, w, h); ctx.drawImage(processed as CanvasImageSource, 0, 0, w, h);
              } else {
                const info = engine.getWatermarkInfo(w, h);
                const target = getCustomTarget(w, h); if (!target) throw new Error("Watermark geometry is not available yet.");
                const baseSize = Math.max(1, Math.round(info.size));
                const targetSize = Math.max(1, Math.round(Math.max(target.w, target.h)));
                const alpha = await engine.getAlphaMap(baseSize);
                applyReverseAlphaBlend(c, resizeAlphaMap(alpha, baseSize, targetSize), { ...target, w: targetSize, h: targetSize }, strength / 100);
              }
            } else throw new Error("Automatic watermark processing is still loading.");
            if (video.ended) resolve(); else requestAnimationFrame(tick);
          } catch (error) { reject(error); }
        };
        tick();
      });
      recorder.stop(); await finished; video.pause();
      const objectUrl = URL.createObjectURL(new Blob(chunks, { type: mime })); const anchor = document.createElement("a"); anchor.href = objectUrl;
      anchor.download = `flythebg-${provider.toLowerCase().replaceAll(" ", "-")}-clean.webm`; anchor.click(); setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
      const time = (performance.now() - started) / 1000; setElapsed(time); setMsg(`Done in ${time.toFixed(1)}s. Video exported locally as WebM.`);
    } catch (error) { setMsg(error instanceof Error ? error.message : "Video processing failed. Try Chrome or Edge."); }
    finally { setBusy(false); }
  };

  const providerDetails: Record<Provider, { label: string; note: string }> = {
    Gemini: { label: "Gemini", note: "Automatic" },
    "Veo 3": { label: "Veo 3", note: "Automatic" },
    "Meta AI": { label: "Meta AI", note: "Manual" },
    Other: { label: "Other", note: "Automatic" },
  };

  const tuningChanged = strength !== 100 || scale !== 100 || ox !== 0 || oy !== 0;

  return <div className="wmV2">
    <div className="wmControlsTop">
      <div className="wmSegment" role="tablist" aria-label="Media type"><button className={kind === "image" ? "active" : ""} onClick={() => setKind("image")} disabled={busy}>Image</button><button className={kind === "video" ? "active" : ""} onClick={() => setKind("video")} disabled={busy}>Video</button></div>
      <div className="wmProvider" aria-label="Choose source">
        <span className="wmProviderLabel">Source</span>
        <div className="wmProviderChoices" role="tablist" aria-label="Watermark source">
          {(Object.keys(providerDetails) as Provider[]).map((item) => <button key={item} type="button" className={provider === item ? "active" : ""} onClick={() => { setProvider(item); setSel(null); setPreviewUrl(""); }} disabled={busy} aria-selected={provider === item}><strong>{providerDetails[item].label}</strong><small>{providerDetails[item].note}</small></button>)}
        </div>
      </div>
      <label className="wmUpload">{file ? "Replace media" : "Upload image or video"}<input type="file" accept="image/*,video/*" onChange={(event) => choose(event.target.files?.[0] || null)} disabled={busy} /></label>
    </div>
    <div className="wmInstructions"><strong>{provider === "Meta AI" ? "Manual selection" : tuningChanged ? "Fine tune detection" : "Automatic detection"}</strong><span>{provider === "Meta AI" ? "Drag over the watermark area on the original media. The preview keeps the exact media proportions." : tuningChanged ? "Fine-tune strength, size and position while keeping the original media dimensions unchanged." : "The integrated detector uses the uploaded media's real pixel dimensions and calibrated watermark geometry."}</span></div>
    <div className="wmStage" ref={stage} style={{ aspectRatio: mediaSize.w && mediaSize.h ? `${mediaSize.w} / ${mediaSize.h}` : "16 / 9" }} onPointerDown={down} onPointerMove={move} onPointerUp={() => { drag.current = null; }}>
      {file && kind === "image" && <img ref={img} src={url} alt="Watermark removal preview" draggable={false} onLoad={(event) => setMediaSize({ w: event.currentTarget.naturalWidth, h: event.currentTarget.naturalHeight })} />}
      {file && kind === "video" && <video ref={vid} src={url} controls playsInline preload="metadata" onLoadedMetadata={(event) => setMediaSize({ w: event.currentTarget.videoWidth, h: event.currentTarget.videoHeight })} />}
      {!file && <div className="wmEmpty">Upload an image or video to begin</div>}
      {active && <div className="wmMask" style={{ left: `${active.x}%`, top: `${active.y}%`, width: `${active.w}%`, height: `${active.h}%` }}><span>{sel ? "Manual selection" : provider === "Meta AI" ? "Meta fixed preset" : tuningChanged ? "Adjusted watermark area" : "Detected watermark area"}</span></div>}
    </div>
    {previewUrl && <div className="wmCompare"><div><span>Original</span>{file && <img src={url} alt="Original media" />}</div><div><span>Removal preview</span><img src={previewUrl} alt="Watermark removal result preview" /></div></div>}
    <canvas ref={canvas} className="wmHiddenCanvas" aria-hidden="true" />
    <div className="wmActionRow"><button className="wmSecondary" onClick={() => { setSel(null); setStrength(100); setScale(100); setOx(0); setOy(0); setPreviewUrl(""); }} disabled={busy}>Reset controls</button>{kind === "image" && <button className="wmSecondary" onClick={previewImage} disabled={!file || !active || busy}>Preview result</button>}{kind === "image" ? <button className="wmPrimary" onClick={exportImage} disabled={!file || !active || busy}>{busy ? `Processing ${elapsed.toFixed(1)}s…` : "Remove & Export Image"}</button> : <button className="wmPrimary" onClick={exportVideo} disabled={!file || !active || busy}>{busy ? `Processing ${elapsed.toFixed(1)}s…` : "Remove & Export Video"}</button>}</div>
    {busy && <div className="wmProgress" role="status">Processing locally — <strong>{elapsed.toFixed(1)}s elapsed</strong>. Do not refresh or close this tab.</div>}
    <div className="wmFine wmFineFour">
      <label><span>Strength (Gain)</span><output>{strength}%</output><input type="range" min="40" max="180" step="1" value={strength} onChange={(event) => setStrength(Number(event.target.value))} disabled={busy} /></label>
      <label><span>Size Scale</span><output>{scale}%</output><input type="range" min="60" max="160" step="1" value={scale} onChange={(event) => setScale(Number(event.target.value))} disabled={busy} /></label>
      <label><span>Position X</span><output>{ox > 0 ? "+" : ""}{ox}px</output><input type="range" min="-200" max="200" step="1" value={ox} onChange={(event) => setOx(Number(event.target.value))} disabled={busy} /></label>
      <label><span>Position Y</span><output>{oy > 0 ? "+" : ""}{oy}px</output><input type="range" min="-200" max="200" step="1" value={oy} onChange={(event) => setOy(Number(event.target.value))} disabled={busy} /></label>
    </div>
    <p className="wmStatus" role="status">{msg}</p>
  </div>;
}
