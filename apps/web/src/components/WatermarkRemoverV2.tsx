"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

type Kind = "image" | "video";
type Provider = "Gemini" | "Veo 3" | "Meta AI" | "Other";
type Rect = { x: number; y: number; w: number; h: number };

const UPSTREAM = "https://raw.githubusercontent.com/ishara-madu/gemini-watermark-remover/main/assets";
const MASKS = { small: `${UPSTREAM}/bg_48.png`, large: `${UPSTREAM}/bg_96.png` };
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const loadMask = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image();
  image.crossOrigin = "anonymous";
  image.onload = () => resolve(image);
  image.onerror = () => reject(new Error("The calibrated watermark reference could not be loaded."));
  image.src = src;
});
let masksPromise: Promise<{ small: HTMLImageElement; large: HTMLImageElement }> | null = null;
const getMasks = () => masksPromise || (masksPromise = Promise.all([loadMask(MASKS.small), loadMask(MASKS.large)]).then(([small, large]) => ({ small, large })));

function getGeminiGeometry(width: number, height: number): Rect {
  // Geometry follows the supplied ishara-madu project: scale from the 96px/64px
  // reference while keeping the mark locked to the lower-right edge.
  const minDim = Math.min(width, height);
  const ratio = minDim / 1536;
  const size = Math.max(16, Math.round(96 * ratio));
  const margin = Math.max(8, Math.round(64 * ratio));
  return { x: Math.max(0, width - margin - size), y: Math.max(0, height - margin - size), w: size, h: size };
}

function getMetaGeometry(width: number, height: number): Rect {
  // Legacy Meta AI visible marks are commonly rendered near the lower-right.
  // Keep this as a fixed, editable preset rather than pretending Meta's newer
  // invisible Content Seal has a removable pixel rectangle.
  const size = Math.max(48, Math.round(Math.min(width, height) * 0.075));
  const margin = Math.max(24, Math.round(Math.min(width, height) * 0.0625));
  return { x: Math.max(0, width - margin - size * 1.8), y: Math.max(0, height - margin - size), w: size * 1.8, h: size };
}

async function reverseAlpha(c: HTMLCanvasElement, box: Rect, strength: number) {
  const ctx = c.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas unavailable.");
  const masks = await getMasks();
  const sourceSize = box.w > 72 ? masks.large : masks.small;
  const sourceW = sourceSize === masks.large ? 96 : 48;
  const sourceH = sourceW;
  const roiPad = Math.round(Math.max(box.w, box.h) * 0.65);
  const rx = Math.max(0, Math.round(box.x - roiPad));
  const ry = Math.max(0, Math.round(box.y - roiPad));
  const rw = Math.min(c.width - rx, Math.round(box.w + roiPad * 2));
  const rh = Math.min(c.height - ry, Math.round(box.h + roiPad * 2));
  const pixels = ctx.getImageData(rx, ry, rw, rh);
  const maskCanvas = document.createElement("canvas");
  maskCanvas.width = Math.max(1, Math.round(box.w));
  maskCanvas.height = Math.max(1, Math.round(box.h));
  const maskCtx = maskCanvas.getContext("2d", { willReadFrequently: true });
  if (!maskCtx) throw new Error("Reference canvas unavailable.");
  maskCtx.imageSmoothingEnabled = false;
  maskCtx.drawImage(sourceSize, 0, 0, sourceW, sourceH, 0, 0, maskCanvas.width, maskCanvas.height);
  const mask = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height).data;
  const gain = strength / 100;
  const localX = Math.round(box.x - rx);
  const localY = Math.round(box.y - ry);
  for (let y = 0; y < maskCanvas.height; y++) {
    for (let x = 0; x < maskCanvas.width; x++) {
      const dst = ((localY + y) * rw + localX + x) * 4;
      const src = (y * maskCanvas.width + x) * 4;
      if (dst < 0 || dst + 3 >= pixels.data.length) continue;
      let alpha = Math.max(mask[src], mask[src + 1], mask[src + 2]) / 255 * gain;
      if (alpha < 0.002) continue;
      alpha = Math.min(alpha, 0.99);
      for (let channel = 0; channel < 3; channel++) {
        pixels.data[dst + channel] = clamp(Math.round((pixels.data[dst + channel] - alpha * 255) / (1 - alpha)), 0, 255);
      }
    }
  }
  ctx.putImageData(pixels, rx, ry);
}

function repairMetaRegion(c: HTMLCanvasElement, box: Rect) {
  // Conservative, non-blurred patch for the legacy visible Meta label.
  // It is intentionally small and previewable; users can move/resize it if a
  // particular Meta surface uses a different visible mark.
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable.");
  const pad = Math.max(6, Math.round(box.h * 0.18));
  const sx = Math.max(0, Math.round(box.x - box.w * 0.55));
  const sy = Math.max(0, Math.round(box.y));
  const sw = Math.min(c.width - sx, Math.max(1, Math.round(box.w * 0.55)));
  const sh = Math.min(c.height - sy, Math.max(1, Math.round(box.h + pad * 2)));
  const source = document.createElement("canvas");
  source.width = sw; source.height = sh;
  source.getContext("2d")?.drawImage(c, sx, sy, sw, sh, 0, 0, sw, sh);
  ctx.save();
  ctx.beginPath();
  ctx.rect(Math.round(box.x), Math.round(box.y), Math.round(box.w), Math.round(box.h));
  ctx.clip();
  ctx.drawImage(source, 0, 0, sw, sh, Math.round(box.x), Math.round(box.y), Math.round(box.w), Math.round(box.h));
  ctx.restore();
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
  const [msg, setMsg] = useState("Upload your media. Gemini and Veo use the calibrated upstream alpha-unblending method; Meta AI uses a fixed editable legacy visible-mark preset.");
  const stage = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const vid = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const drag = useRef<{ x: number; y: number } | null>(null);

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

  const media = () => kind === "image" ? { w: img.current?.naturalWidth || 0, h: img.current?.naturalHeight || 0 } : { w: vid.current?.videoWidth || 0, h: vid.current?.videoHeight || 0 };
  const dimensions = media();
  const preset = useMemo(() => dimensions.w && dimensions.h ? provider === "Meta AI" ? getMetaGeometry(dimensions.w, dimensions.h) : getGeminiGeometry(dimensions.w, dimensions.h) : null, [provider, dimensions.w, dimensions.h]);
  const active = sel ? { x: clamp(sel.x + ox, 0, 100), y: clamp(sel.y + oy, 0, 100), w: clamp(sel.w * scale / 100, 1, 100), h: clamp(sel.h * scale / 100, 1, 100) } : preset ? { x: preset.x / dimensions.w * 100 + ox, y: preset.y / dimensions.h * 100 + oy, w: preset.w / dimensions.w * 100 * scale / 100, h: preset.h / dimensions.h * 100 * scale / 100 } : null;

  const point = (event: ReactPointerEvent) => { const bounds = stage.current?.getBoundingClientRect(); return bounds ? { x: clamp((event.clientX - bounds.left) / bounds.width * 100, 0, 100), y: clamp((event.clientY - bounds.top) / bounds.height * 100, 0, 100) } : null; };
  const down = (event: ReactPointerEvent) => { if (busy) return; const p = point(event); if (!p) return; drag.current = p; setSel({ x: p.x, y: p.y, w: 0, h: 0 }); (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId); };
  const move = (event: ReactPointerEvent) => { if (!drag.current) return; const p = point(event); if (!p) return; const a = drag.current; setSel({ x: Math.min(a.x, p.x), y: Math.min(a.y, p.y), w: Math.abs(a.x - p.x), h: Math.abs(a.y - p.y) }); };
  const choose = (next: File | null) => { if (!next) return; setFile(next); setKind(next.type.startsWith("video/") ? "video" : "image"); setSel(null); setPreviewUrl(""); setMsg("Media loaded. The fixed source preset is shown in the preview; drag to override it."); };
  const box = (w: number, h: number) => active ? { x: active.x * w / 100, y: active.y * h / 100, w: active.w * w / 100, h: active.h * h / 100 } : null;

  const processCanvas = async (source: HTMLImageElement | HTMLVideoElement, outputW: number, outputH: number) => {
    const c = canvas.current!;
    c.width = outputW; c.height = outputH;
    c.getContext("2d")!.drawImage(source, 0, 0, outputW, outputH);
    const target = box(outputW, outputH);
    if (!target) throw new Error("Select a watermark region first.");
    if (provider === "Meta AI") repairMetaRegion(c, target); else await reverseAlpha(c, target, strength);
    return c;
  };

  const previewImage = async () => {
    if (!img.current || !active) return;
    setBusy(true);
    try {
      const source = img.current;
      const scaleDown = Math.min(1, 1200 / Math.max(source.naturalWidth, source.naturalHeight));
      const c = await processCanvas(source, Math.max(1, Math.round(source.naturalWidth * scaleDown)), Math.max(1, Math.round(source.naturalHeight * scaleDown)));
      const blob = await new Promise<Blob | null>((resolve) => c.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("Preview generation failed.");
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setMsg("Preview ready. Compare it with the original before exporting.");
    } catch (error) { setMsg(error instanceof Error ? error.message : "Preview failed."); } finally { setBusy(false); }
  };

  const exportImage = async () => {
    if (!img.current || !active) return;
    const started = performance.now(); setBusy(true);
    try {
      const source = img.current;
      const scaleDown = Math.min(1, 3200 / Math.max(source.naturalWidth, source.naturalHeight));
      const c = await processCanvas(source, Math.max(1, Math.round(source.naturalWidth * scaleDown)), Math.max(1, Math.round(source.naturalHeight * scaleDown)));
      const blob = await new Promise<Blob | null>((resolve) => c.toBlob(resolve, "image/png"));
      if (!blob) throw new Error("PNG export failed.");
      const objectUrl = URL.createObjectURL(blob); const anchor = document.createElement("a"); anchor.href = objectUrl; anchor.download = `flythebg-${provider.toLowerCase().replaceAll(" ", "-")}-clean.png`; anchor.click(); setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
      const time = (performance.now() - started) / 1000; setElapsed(time); setMsg(`Done in ${time.toFixed(1)}s. Clean PNG exported locally.`);
    } catch (error) { setMsg(error instanceof Error ? error.message : "Image processing failed."); } finally { setBusy(false); }
  };

  const exportVideo = async () => {
    if (!vid.current || !active) return;
    const started = performance.now(); setBusy(true);
    try {
      const video = vid.current, c = canvas.current!, w = video.videoWidth, h = video.videoHeight;
      if (!w || !h) throw new Error("Video metadata is not ready.");
      c.width = w; c.height = h; video.currentTime = 0;
      await new Promise<void>((resolve) => video.readyState >= 2 ? resolve() : video.addEventListener("loadeddata", () => resolve(), { once: true }));
      const stream = c.captureStream(30);
      const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime }); const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => event.data.size && chunks.push(event.data);
      const finished = new Promise<void>((resolve, reject) => { recorder.onstop = () => resolve(); recorder.onerror = () => reject(new Error("Video recorder failed.")); });
      recorder.start(250); await video.play();
      const ctx = c.getContext("2d")!;
      await new Promise<void>((resolve, reject) => {
        const tick = async () => { try { ctx.drawImage(video, 0, 0, w, h); const target = box(w, h)!; if (provider === "Meta AI") repairMetaRegion(c, target); else await reverseAlpha(c, target, strength); if (video.ended) resolve(); else requestAnimationFrame(tick); } catch (error) { reject(error); } };
        tick();
      });
      recorder.stop(); await finished; video.pause();
      const objectUrl = URL.createObjectURL(new Blob(chunks, { type: mime })); const anchor = document.createElement("a"); anchor.href = objectUrl; anchor.download = `flythebg-${provider.toLowerCase().replaceAll(" ", "-")}-clean.webm`; anchor.click(); setTimeout(() => URL.revokeObjectURL(objectUrl), 3000);
      const time = (performance.now() - started) / 1000; setElapsed(time); setMsg(`Done in ${time.toFixed(1)}s. Video exported locally as WebM. Audio preservation depends on browser recording support.`);
    } catch (error) { setMsg(error instanceof Error ? error.message : "Video processing failed. Try Chrome or Edge."); } finally { setBusy(false); }
  };

  return <div className="wmV2">
    <div className="wmControlsTop">
      <div className="wmSegment"><button className={kind === "image" ? "active" : ""} onClick={() => setKind("image")} disabled={busy}>Image</button><button className={kind === "video" ? "active" : ""} onClick={() => setKind("video")} disabled={busy}>Video</button></div>
      <div className="wmProvider"><span>Source</span><select value={provider} onChange={(event) => { setProvider(event.target.value as Provider); setSel(null); setPreviewUrl(""); }} disabled={busy}><option>Gemini</option><option>Veo 3</option><option>Meta AI</option><option>Other</option></select></div>
      <label className="wmUpload">{file ? "Replace media" : "Upload image or video"}<input type="file" accept="image/*,video/*" onChange={(event) => choose(event.target.files?.[0] || null)} disabled={busy} /></label>
    </div>
    <div className="wmInstructions"><strong>{provider === "Meta AI" ? "Fixed legacy Meta preset" : "Calibrated Gemini / Veo engine"}</strong><span>{provider === "Meta AI" ? "A visible Meta mark has historically appeared near the lower-right. Newer Meta Content Seal is invisible and is not a visible pixel overlay." : "The supplied ishara-madu reverse-alpha method restores the known visible mark without blur or AI inpainting."}</span></div>
    <div className="wmStage" ref={stage} onPointerDown={down} onPointerMove={move} onPointerUp={() => { drag.current = null; }}>
      {file && kind === "image" && <img ref={img} src={url} alt="Watermark removal preview" draggable={false} />}
      {file && kind === "video" && <video ref={vid} src={url} controls playsInline preload="metadata" />}
      {!file && <div className="wmEmpty">Upload an image or video to begin</div>}
      {active && <div className="wmMask" style={{ left: `${active.x}%`, top: `${active.y}%`, width: `${active.w}%`, height: `${active.h}%` }}><span>{sel ? "Manual selection" : provider === "Meta AI" ? "Meta fixed preset" : "Calibrated fixed preset"}</span></div>}
    </div>
    {previewUrl && <div className="wmCompare"><div><span>Original</span>{file && <img src={url} alt="Original media" />}</div><div><span>Removal preview</span><img src={previewUrl} alt="Watermark removal result preview" /></div></div>}
    <canvas ref={canvas} className="wmHiddenCanvas" aria-hidden="true" />
    <div className="wmActionRow"><button className="wmSecondary" onClick={() => { setSel(null); setStrength(100); setScale(100); setOx(0); setOy(0); setPreviewUrl(""); }} disabled={busy}>Reset preset</button>{kind === "image" && <button className="wmSecondary" onClick={previewImage} disabled={!file || !active || busy}>Preview result</button>}{kind === "image" ? <button className="wmPrimary" onClick={exportImage} disabled={!file || !active || busy}>{busy ? `Processing ${elapsed.toFixed(1)}s…` : "Remove & Export Image"}</button> : <button className="wmPrimary" onClick={exportVideo} disabled={!file || !active || busy}>{busy ? `Processing ${elapsed.toFixed(1)}s…` : "Remove & Export Video"}</button>}</div>
    {busy && <div className="wmProgress" role="status">Processing locally — <strong>{elapsed.toFixed(1)}s elapsed</strong>. Do not refresh or close this tab.</div>}
    <div className="wmFine"><label>Strength <output>{strength}%</output><input type="range" min="50" max="100" value={strength} onChange={(event) => setStrength(Number(event.target.value))} disabled={busy} /></label><label>Size scale <output>{scale}%</output><input type="range" min="60" max="160" value={scale} onChange={(event) => setScale(Number(event.target.value))} disabled={busy} /></label><label>Position X <output>{ox > 0 ? "+" : ""}{ox}%</output><input type="range" min="-20" max="20" value={ox} onChange={(event) => setOx(Number(event.target.value))} disabled={busy} /></label><label>Position Y <output>{oy > 0 ? "+" : ""}{oy}%</output><input type="range" min="-20" max="20" value={oy} onChange={(event) => setOy(Number(event.target.value))} disabled={busy} /></label></div>
    <p className="wmStatus" role="status">{msg}</p>
    <p className="wmAttribution">Gemini/Veo calibrated assets and reverse-alpha method adapted from the MIT-licensed <a href="https://github.com/ishara-madu/gemini-watermark-remover" target="_blank" rel="noreferrer">ishara-madu/gemini-watermark-remover</a>. Only edit media you own or have permission to modify.</p>
  </div>;
}
