"use client";

import { useEffect, useRef, useState } from "react";

type MediaKind = "image" | "video";
type Provider = "Gemini" | "Meta AI" | "Both / Other";

const presets = [
  { id: "top-right", label: "Top right", x: 78, y: 4, w: 18, h: 10 },
  { id: "bottom-right", label: "Bottom right", x: 78, y: 86, w: 18, h: 10 },
  { id: "top-left", label: "Top left", x: 4, y: 4, w: 18, h: 10 },
  { id: "bottom-left", label: "Bottom left", x: 4, y: 86, w: 18, h: 10 },
];

function patchCanvas(source: HTMLCanvasElement, x: number, y: number, w: number, h: number) {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const pad = Math.max(2, Math.round(Math.min(w, h) * 0.15));
  const sx = Math.max(0, x - pad);
  const sy = Math.max(0, y - pad);
  const sw = Math.min(source.width - sx, w + pad * 2);
  const sh = Math.min(source.height - sy, h + pad * 2);
  const data = ctx.getImageData(sx, sy, sw, sh);
  const copy = new Uint8ClampedArray(data.data);
  const left = Math.max(0, x - sx - 1);
  const right = Math.min(sw - 1, x - sx + w);
  const top = Math.max(0, y - sy - 1);
  const bottom = Math.min(sh - 1, y - sy + h);
  for (let yy = Math.max(0, y - sy); yy < Math.min(sh, y - sy + h); yy++) {
    for (let xx = Math.max(0, x - sx); xx < Math.min(sw, x - sx + w); xx++) {
      const srcX = xx - (x - sx) < (w / 2) ? left : right;
      const srcY = yy - (y - sy) < (h / 2) ? top : bottom;
      const from = (srcY * sw + srcX) * 4;
      const to = (yy * sw + xx) * 4;
      copy[to] = data.data[from];
      copy[to + 1] = data.data[from + 1];
      copy[to + 2] = data.data[from + 2];
      copy[to + 3] = data.data[from + 3];
    }
  }
  ctx.putImageData(new ImageData(copy, sw, sh), sx, sy);
}

export function WatermarkRemover() {
  const [kind, setKind] = useState<MediaKind>("image");
  const [provider, setProvider] = useState<Provider>("Gemini");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [preset, setPreset] = useState(presets[0]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const imageRef = useRef<HTMLImageElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!file) return;
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);

  function chooseFile(next: File | null) {
    if (!next) return;
    const isVideo = next.type.startsWith("video/");
    setKind(isVideo ? "video" : "image");
    setFile(next);
    setMessage("");
  }

  async function processImage() {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    setBusy(true);
    setMessage("Reconstructing the selected area locally in your browser…");
    const max = 2200;
    const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    patchCanvas(canvas, Math.round(canvas.width * preset.x / 100), Math.round(canvas.height * preset.y / 100), Math.round(canvas.width * preset.w / 100), Math.round(canvas.height * preset.h / 100));
    canvas.toBlob((blob) => {
      if (!blob) { setBusy(false); setMessage("Could not create the result."); return; }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `flythebg-${provider.toLowerCase().replaceAll(" ", "-")}-watermark-clean.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      setBusy(false);
      setMessage("Done. The cleaned image was created locally and downloaded.");
    }, "image/png");
  }

  async function processVideo() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    setBusy(true);
    setMessage("Preparing a local preview frame. Full video export can be memory-intensive in a browser.");
    await video.play();
    const scale = Math.min(1, 2200 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    patchCanvas(canvas, Math.round(canvas.width * preset.x / 100), Math.round(canvas.height * preset.y / 100), Math.round(canvas.width * preset.w / 100), Math.round(canvas.height * preset.h / 100));
    canvas.toBlob((blob) => {
      if (!blob) { setBusy(false); return; }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `flythebg-${provider.toLowerCase().replaceAll(" ", "-")}-video-preview.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      setBusy(false);
      setMessage("Preview frame downloaded. Video reconstruction is intentionally conservative to avoid freezing the user's device.");
    }, "image/png");
  }

  return (
    <div className="wmWorkspace">
      <div className="wmToolbar">
        <div className="wmTabs"><button className={kind === "image" ? "active" : ""} onClick={() => setKind("image")}>Image</button><button className={kind === "video" ? "active" : ""} onClick={() => setKind("video")}>Video</button></div>
        <label>AI source<select value={provider} onChange={(e) => setProvider(e.target.value as Provider)}><option>Gemini</option><option>Meta AI</option><option>Both / Other</option></select></label>
      </div>
      <div className="wmUpload" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); chooseFile(e.dataTransfer.files[0] ?? null); }}>
        <input id="wm-file" type="file" accept={kind === "image" ? "image/*" : "video/*"} onChange={(e) => chooseFile(e.target.files?.[0] ?? null)} />
        <label htmlFor="wm-file"><span className="wmIcon">✦</span><strong>{file ? file.name : `Choose a ${kind}`}</strong><small>or drag and drop · processed locally in this browser</small></label>
      </div>
      {url && <div className="wmPreview">
        {kind === "image" ? <img ref={imageRef} src={url} alt="Selected image" onLoad={() => setMessage("Choose the watermark location, then clean the image.")} /> : <video ref={videoRef} src={url} muted controls preload="metadata" />}
        <div className="wmMask" style={{ left: `${preset.x}%`, top: `${preset.y}%`, width: `${preset.w}%`, height: `${preset.h}%` }} aria-hidden="true"><span>watermark area</span></div>
      </div>}
      <div className="wmPresets"><span>Watermark location</span>{presets.map((item) => <button key={item.id} className={preset.id === item.id ? "active" : ""} onClick={() => setPreset(item)}>{item.label}</button>)}</div>
      <div className="wmActions"><button className="wmPrimary" disabled={!file || busy} onClick={kind === "image" ? processImage : processVideo}>{busy ? "Working…" : kind === "image" ? "Remove watermark" : "Clean preview frame"}</button><span>{message}</span></div>
      <canvas ref={canvasRef} className="wmHiddenCanvas" aria-hidden="true" />
      <p className="wmDisclaimer"><strong>Important:</strong> Gemini, Meta AI, Google, and Meta are trademarks and properties of their respective owners. This independent FlytheBG utility is not affiliated with or endorsed by them. Results depend on the selected area and surrounding pixels; inspect exported media before publishing.</p>
    </div>
  );
}
