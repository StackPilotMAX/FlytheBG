"use client";

import { useEffect, useRef, useState } from "react";

type MediaKind = "image" | "video";
type Provider = "Gemini" | "Meta AI" | "Both / Other";
type Rect = { x: number; y: number; w: number; h: number };

const presets: Array<Rect & { id: string; label: string }> = [
  { id: "top-right", label: "Top right", x: 78, y: 4, w: 18, h: 10 },
  { id: "bottom-right", label: "Bottom right", x: 78, y: 86, w: 18, h: 10 },
  { id: "top-left", label: "Top left", x: 4, y: 4, w: 18, h: 10 },
  { id: "bottom-left", label: "Bottom left", x: 4, y: 86, w: 18, h: 10 },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function rectFromPercent(rect: Rect, width: number, height: number) {
  return {
    x: Math.round(width * rect.x / 100),
    y: Math.round(height * rect.y / 100),
    w: Math.max(2, Math.round(width * rect.w / 100)),
    h: Math.max(2, Math.round(height * rect.h / 100)),
  };
}

function patchCanvas(source: HTMLCanvasElement, rect: Rect) {
  const ctx = source.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const x = clamp(Math.round(rect.x), 0, source.width - 1);
  const y = clamp(Math.round(rect.y), 0, source.height - 1);
  const w = clamp(Math.round(rect.w), 2, source.width - x);
  const h = clamp(Math.round(rect.h), 2, source.height - y);
  const pad = Math.max(3, Math.round(Math.min(w, h) * 0.18));
  const sx = Math.max(0, x - pad);
  const sy = Math.max(0, y - pad);
  const ex = Math.min(source.width, x + w + pad);
  const ey = Math.min(source.height, y + h + pad);
  const sw = ex - sx;
  const sh = ey - sy;
  const data = ctx.getImageData(sx, sy, sw, sh);
  const original = new Uint8ClampedArray(data.data);
  const targetLeft = x - sx;
  const targetTop = y - sy;
  const targetRight = targetLeft + w - 1;
  const targetBottom = targetTop + h - 1;

  // Multi-direction inpainting. Unlike the old hard left/right split, each
  // target pixel receives samples from several nearby directions, reducing
  // visible seams and making gradients/textured backgrounds less blocky.
  const sample = (px: number, py: number) => {
    const cx = clamp(px, 0, sw - 1);
    const cy = clamp(py, 0, sh - 1);
    const i = (cy * sw + cx) * 4;
    return [original[i], original[i + 1], original[i + 2], original[i + 3]] as const;
  };

  for (let yy = targetTop; yy <= targetBottom; yy += 1) {
    for (let xx = targetLeft; xx <= targetRight; xx += 1) {
      const dl = Math.max(1, xx - targetLeft + 1);
      const dr = Math.max(1, targetRight - xx + 1);
      const dt = Math.max(1, yy - targetTop + 1);
      const db = Math.max(1, targetBottom - yy + 1);
      const candidates: Array<{ rgb: readonly [number, number, number, number]; weight: number }> = [];
      const add = (rgb: readonly [number, number, number, number], weight: number) => candidates.push({ rgb, weight });

      add(sample(targetLeft - Math.min(pad, dl), yy), 1 / dl);
      add(sample(targetRight + Math.min(pad, dr), yy), 1 / dr);
      add(sample(xx, targetTop - Math.min(pad, dt)), 1 / dt);
      add(sample(xx, targetBottom + Math.min(pad, db)), 1 / db);
      add(sample(targetLeft - Math.min(pad, dl), targetTop - Math.min(pad, dt)), .45 / Math.hypot(dl, dt));
      add(sample(targetRight + Math.min(pad, dr), targetTop - Math.min(pad, dt)), .45 / Math.hypot(dr, dt));
      add(sample(targetLeft - Math.min(pad, dl), targetBottom + Math.min(pad, db)), .45 / Math.hypot(dl, db));
      add(sample(targetRight + Math.min(pad, dr), targetBottom + Math.min(pad, db)), .45 / Math.hypot(dr, db));

      let weightTotal = 0;
      let r = 0; let g = 0; let b = 0; let a = 0;
      for (const candidate of candidates) {
        weightTotal += candidate.weight;
        r += candidate.rgb[0] * candidate.weight;
        g += candidate.rgb[1] * candidate.weight;
        b += candidate.rgb[2] * candidate.weight;
        a += candidate.rgb[3] * candidate.weight;
      }
      const i = (yy * sw + xx) * 4;
      data.data[i] = Math.round(r / weightTotal);
      data.data[i + 1] = Math.round(g / weightTotal);
      data.data[i + 2] = Math.round(b / weightTotal);
      data.data[i + 3] = Math.round(a / weightTotal);
    }
  }
  ctx.putImageData(data, sx, sy);
}

function detectWatermark(source: HTMLCanvasElement): Rect | null {
  const maxEdge = 900;
  const scale = Math.min(1, maxEdge / Math.max(source.width, source.height));
  const width = Math.max(32, Math.round(source.width * scale));
  const height = Math.max(32, Math.round(source.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, width, height);
  const pixels = ctx.getImageData(0, 0, width, height).data;

  // Search edge/corner bands where generated-media watermarks commonly live.
  // The detector looks for a compact, high-contrast overlay rather than using
  // a fixed provider-specific corner. The returned region is only a candidate;
  // the user can inspect and change it before exporting.
  const candidates: Rect[] = [];
  const widths = [14, 18, 22];
  const heights = [7, 10, 13];
  for (const w of widths) {
    for (const h of heights) {
      const positions = [
        [2, 2], [50 - w / 2, 2], [98 - w, 2],
        [2, 50 - h / 2], [98 - w, 50 - h / 2],
        [2, 98 - h], [50 - w / 2, 98 - h], [98 - w, 98 - h],
      ];
      for (const [x, y] of positions) candidates.push({ x, y, w, h });
    }
  }

  let best: { rect: Rect; score: number } | null = null;
  for (const rect of candidates) {
    const x0 = Math.round(width * rect.x / 100);
    const y0 = Math.round(height * rect.y / 100);
    const x1 = Math.min(width - 2, Math.round(width * (rect.x + rect.w) / 100));
    const y1 = Math.min(height - 2, Math.round(height * (rect.y + rect.h) / 100));
    let energy = 0;
    let samples = 0;
    let variance = 0;
    let mean = 0;
    for (let y = y0 + 1; y < y1 - 1; y += 2) {
      for (let x = x0 + 1; x < x1 - 1; x += 2) {
        const i = (y * width + x) * 4;
        const l = pixels[i] * .2126 + pixels[i + 1] * .7152 + pixels[i + 2] * .0722;
        const right = (pixels[i + 4] * .2126 + pixels[i + 5] * .7152 + pixels[i + 6] * .0722);
        const downI = ((y + 1) * width + x) * 4;
        const down = pixels[downI] * .2126 + pixels[downI + 1] * .7152 + pixels[downI + 2] * .0722;
        energy += Math.abs(l - right) + Math.abs(l - down);
        mean += l;
        samples += 1;
      }
    }
    if (!samples) continue;
    mean /= samples;
    for (let y = y0; y < y1; y += 3) {
      for (let x = x0; x < x1; x += 3) {
        const i = (y * width + x) * 4;
        const l = pixels[i] * .2126 + pixels[i + 1] * .7152 + pixels[i + 2] * .0722;
        variance += Math.abs(l - mean);
      }
    }
    variance /= Math.max(1, Math.ceil((y1 - y0) / 3) * Math.ceil((x1 - x0) / 3));
    const edgeBonus = (rect.x < 4 || rect.x + rect.w > 96 ? 1.12 : 1) * (rect.y < 4 || rect.y + rect.h > 96 ? 1.12 : 1);
    const score = (energy / samples) * (1 + Math.min(variance, 80) / 160) * edgeBonus;
    if (!best || score > best.score) best = { rect, score };
  }

  canvas.width = canvas.height = 1;
  return best && best.score > 8 ? best.rect : null;
}

function rectToPreset(rect: Rect) {
  return { id: "auto", label: "Auto-detected", ...rect };
}

export function WatermarkRemover() {
  const [kind, setKind] = useState<MediaKind>("image");
  const [provider, setProvider] = useState<Provider>("Gemini");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [preset, setPreset] = useState(presets[0]);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [autoDetected, setAutoDetected] = useState(false);
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
    setMessage("Media loaded. Run Auto-detect or choose the watermark location.");
    setAutoDetected(false);
  }

  function autoDetect() {
    const source = imageRef.current;
    const canvas = canvasRef.current;
    if (!source || !canvas) return;
    canvas.width = source.naturalWidth || source.width;
    canvas.height = source.naturalHeight || source.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
    const detected = detectWatermark(canvas);
    if (!detected) {
      setMessage("No strong watermark candidate was found. Choose a corner manually and inspect the mask before export.");
      return;
    }
    setPreset(rectToPreset(detected));
    setAutoDetected(true);
    setMessage("Watermark candidate found automatically. Inspect the highlighted area before exporting.");
  }

  function prepareCanvas(video: HTMLVideoElement, canvas: HTMLCanvasElement) {
    const scale = Math.min(1, 1920 / Math.max(video.videoWidth, video.videoHeight));
    canvas.width = Math.max(1, Math.round(video.videoWidth * scale));
    canvas.height = Math.max(1, Math.round(video.videoHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot create a video canvas.");
    return ctx;
  }

  async function processImage() {
    const img = imageRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    setBusy(true);
    setMessage("Reconstructing the selected watermark area locally…");
    canvas.width = Math.max(1, img.naturalWidth);
    canvas.height = Math.max(1, img.naturalHeight);
    const max = 2400;
    if (Math.max(canvas.width, canvas.height) > max) {
      const scale = max / Math.max(canvas.width, canvas.height);
      canvas.width = Math.round(canvas.width * scale);
      canvas.height = Math.round(canvas.height * scale);
    }
    const ctx = canvas.getContext("2d");
    if (!ctx) { setBusy(false); return; }
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    patchCanvas(canvas, rectFromPercent(preset, canvas.width, canvas.height));
    canvas.toBlob((blob) => {
      if (!blob) { setBusy(false); setMessage("Could not create the result."); return; }
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `flythebg-${provider.toLowerCase().replaceAll(" ", "-")}-watermark-clean.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
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
    setMessage("Cleaning the video frame-by-frame in your browser. Keep this tab open…");
    try {
      video.pause();
      video.currentTime = 0;
      await new Promise<void>((resolve, reject) => {
        if (video.readyState >= 2) resolve();
        else {
          video.addEventListener("loadeddata", () => resolve(), { once: true });
          video.addEventListener("error", () => reject(new Error("Video could not be decoded.")), { once: true });
        }
      });
      const ctx = prepareCanvas(video, canvas);
      const fps = 30;
      const output = canvas.captureStream(fps);
      const sourceStream = (video as HTMLVideoElement & { captureStream?: () => MediaStream }).captureStream?.();
      sourceStream?.getAudioTracks().forEach((track) => output.addTrack(track));
      const mimeTypes = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
      const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
      if (!mimeType) throw new Error("This browser cannot export a local WebM video.");
      const recorder = new MediaRecorder(output, { mimeType, videoBitsPerSecond: 8_000_000 });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunks.push(event.data); };
      const stopped = new Promise<void>((resolve) => { recorder.addEventListener("stop", () => resolve(), { once: true }); });
      recorder.start(1000);
      await video.play();
      const watermarkRect = rectFromPercent(preset, canvas.width, canvas.height);
      let frameCount = 0;
      const drawFrame = () => {
        if (video.ended || video.paused && video.currentTime > 0) return;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        patchCanvas(canvas, watermarkRect);
        frameCount += 1;
        if (frameCount % 30 === 0) setMessage(`Cleaning video locally… ${Math.min(99, Math.round((video.currentTime / Math.max(video.duration, .01)) * 100))}%`);
      };
      const requestFrame = (video as HTMLVideoElement & { requestVideoFrameCallback?: (callback: (now: number, metadata: unknown) => void) => number }).requestVideoFrameCallback;
      if (requestFrame) {
        await new Promise<void>((resolve) => {
          const tick = () => {
            if (video.ended || video.currentTime >= video.duration - 0.02) { resolve(); return; }
            drawFrame();
            requestFrame.call(video, () => tick());
          };
          requestFrame.call(video, () => tick());
        });
      } else {
        await new Promise<void>((resolve) => {
          const tick = () => {
            if (video.ended || video.currentTime >= video.duration - 0.02) { resolve(); return; }
            drawFrame();
            requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
      }
      video.pause();
      recorder.stop();
      await stopped;
      output.getTracks().forEach((track) => track.stop());
      const blob = new Blob(chunks, { type: mimeType });
      if (blob.size < 1024) throw new Error("The cleaned video export was empty.");
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = `flythebg-${provider.toLowerCase().replaceAll(" ", "-")}-watermark-clean.webm`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(href), 4000);
      setMessage("Done. Full video was cleaned frame-by-frame and exported as WebM locally. Inspect it before publishing.");
    } catch (reason) {
      setMessage(reason instanceof Error ? reason.message : "Video processing could not finish in this browser.");
    } finally {
      setBusy(false);
      if (video) video.pause();
    }
  }

  function runAutoDetectionForCurrentMedia() {
    if (kind === "image") autoDetect();
    else {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !video.videoWidth) return;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const detected = detectWatermark(canvas);
      if (detected) {
        setPreset(rectToPreset(detected));
        setAutoDetected(true);
        setMessage("Watermark candidate found from the current video frame. The same fixed region will be applied to every frame.");
      } else setMessage("No strong watermark candidate was found. Choose the fixed watermark location manually.");
    }
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
        {kind === "image" ? <img ref={imageRef} src={url} alt="Selected image" onLoad={() => setMessage("Media ready. Use Auto-detect watermark or choose a location.")} /> : <video ref={videoRef} src={url} muted controls preload="metadata" onLoadedData={() => setMessage("Video ready. Auto-detect checks the current frame for a fixed watermark candidate.")} />}
        <div className="wmMask" style={{ left: `${preset.x}%`, top: `${preset.y}%`, width: `${preset.w}%`, height: `${preset.h}%` }} aria-hidden="true"><span>{autoDetected ? "auto-detected watermark" : "watermark area"}</span></div>
      </div>}
      <div className="wmPresets"><span>Watermark location</span><button className="active" onClick={runAutoDetectionForCurrentMedia}>✦ Auto-detect</button>{presets.map((item) => <button key={item.id} className={preset.id === item.id ? "active" : ""} onClick={() => { setPreset(item); setAutoDetected(false); setMessage("Manual watermark area selected. Inspect the highlighted region before export."); }}>{item.label}</button>)}</div>
      <div className="wmActions"><button className="wmPrimary" disabled={!file || busy} onClick={kind === "image" ? processImage : processVideo}>{busy ? "Working…" : kind === "image" ? "Remove & Export Image" : "Remove & Export Video"}</button><span>{message}</span></div>
      {kind === "video" && <p className="wmVideoNote">Video export is frame-by-frame and stays in this browser. The output is WebM and may take longer for long/high-resolution clips. The watermark region is fixed across the clip, which is best for non-moving overlays.</p>}
      <canvas ref={canvasRef} className="wmHiddenCanvas" aria-hidden="true" />
      <p className="wmDisclaimer"><strong>Important:</strong> Gemini, Meta AI, Google, and Meta are trademarks and properties of their respective owners. This independent FlytheBG utility is not affiliated with or endorsed by them. Auto-detection is a local candidate finder, not a guarantee; always inspect the highlighted region and exported result. Only edit media you are allowed to edit.</p>
    </div>
  );
}
