"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createWatermarkEngine, type WatermarkPosition } from "@pilio/gemini-watermark-remover/browser";

type Rect = { x: number; y: number; w: number; h: number };

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const NOISE_FLOOR = 3 / 255;
const ALPHA_THRESHOLD = 0.002;
const MAX_ALPHA = 0.99;

function toRect(position: WatermarkPosition): Rect {
  return { x: position.x, y: position.y, w: position.width, h: position.height };
}

function scaledRect(base: Rect, mediaW: number, mediaH: number, scale: number, ox: number, oy: number): Rect {
  const w = Math.max(8, Math.round(base.w * scale));
  const h = w;
  const x = clamp(Math.round(base.x + (base.w - w) / 2 + ox), 0, Math.max(0, mediaW - w));
  const y = clamp(Math.round(base.y + (base.h - h) / 2 + oy), 0, Math.max(0, mediaH - h));
  return { x, y, w, h };
}

function drawImageToCanvas(image: HTMLImageElement, canvas: HTMLCanvasElement) {
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("Canvas is not available in this browser.");
  ctx.drawImage(image, 0, 0);
}

function restoreRegion(source: HTMLCanvasElement, target: HTMLCanvasElement, rect: Rect) {
  const sx = clamp(Math.floor(rect.x), 0, source.width);
  const sy = clamp(Math.floor(rect.y), 0, source.height);
  const sw = clamp(Math.floor(rect.w), 0, source.width - sx);
  const sh = clamp(Math.floor(rect.h), 0, source.height - sy);
  if (!sw || !sh) return;
  target.getContext("2d")!.drawImage(source, sx, sy, sw, sh, sx, sy, sw, sh);
}

function applyReverseAlpha(canvas: HTMLCanvasElement, rect: Rect, alpha: Float32Array, gain: number) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;
  const pixels = ctx.getImageData(rect.x, rect.y, rect.w, rect.h);
  const alphaSize = Math.max(1, Math.round(Math.sqrt(alpha.length)));

  for (let y = 0; y < rect.h; y++) {
    for (let x = 0; x < rect.w; x++) {
      const mapX = clamp(Math.floor((x / Math.max(1, rect.w)) * alphaSize), 0, alphaSize - 1);
      const mapY = clamp(Math.floor((y / Math.max(1, rect.h)) * alphaSize), 0, alphaSize - 1);
      const raw = alpha[mapY * alphaSize + mapX] || 0;
      const magnitude = Math.abs(raw);
      const signal = Math.max(0, magnitude - NOISE_FLOOR) * gain;
      if (signal < ALPHA_THRESHOLD) continue;

      const a = Math.min(magnitude * gain, MAX_ALPHA);
      const logo = raw < 0 ? 0 : 255;
      const inverse = 1 - a;
      const i = (y * rect.w + x) * 4;
      for (let c = 0; c < 3; c++) {
        const watermarked = pixels.data[i + c];
        const restored = (watermarked - a * logo) / inverse;
        pixels.data[i + c] = clamp(Math.round(restored), 0, 255);
      }
    }
  }
  ctx.putImageData(pixels, rect.x, rect.y);
}

export function WatermarkRemoverManual() {
  const [file, setFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [base, setBase] = useState<Rect | null>(null);
  const [mediaSize, setMediaSize] = useState({ w: 0, h: 0 });
  const [strength, setStrength] = useState(0.6);
  const [scale, setScale] = useState(1);
  const [ox, setOx] = useState(0);
  const [oy, setOy] = useState(0);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [message, setMessage] = useState("Upload a Gemini image. Then adjust the watermark box yourself.");

  const sourceCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const outputVisibleRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const engineRef = useRef<Awaited<ReturnType<typeof createWatermarkEngine>> | null>(null);
  const previousRectRef = useRef<Rect | null>(null);
  const processTimerRef = useRef<number | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; startOx: number; startOy: number } | null>(null);

  const active = base ? scaledRect(base, mediaSize.w, mediaSize.h, scale, ox, oy) : null;

  const drawVisibleOutput = useCallback(() => {
    const source = outputCanvasRef.current;
    const visible = outputVisibleRef.current;
    if (!source || !visible || !source.width || !source.height) return;
    visible.width = source.width;
    visible.height = source.height;
    visible.getContext("2d")!.drawImage(source, 0, 0);
  }, []);

  const process = useCallback(async (rectOverride?: Rect) => {
    const source = sourceCanvasRef.current;
    const output = outputCanvasRef.current;
    if (!source || !output || !base || !mediaSize.w || !mediaSize.h) return;

    setBusy(true);
    const started = performance.now();
    try {
      const rect = rectOverride || scaledRect(base, mediaSize.w, mediaSize.h, scale, ox, oy);
      const previous = previousRectRef.current;
      if (previous) restoreRegion(source, output, previous);
      restoreRegion(source, output, rect);

      const engine = engineRef.current || await createWatermarkEngine();
      engineRef.current = engine;
      const alphaSize = Math.max(8, rect.w);
      const alpha = await engine.getAlphaMap(alphaSize);
      applyReverseAlpha(output, rect, alpha, strength);
      previousRectRef.current = rect;
      drawVisibleOutput();
      setElapsed((performance.now() - started) / 1000);
      setReady(true);
      setMessage("Live preview updated. Drag the box or use the four controls below.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Watermark preview failed.");
    } finally {
      setBusy(false);
    }
  }, [base, mediaSize, scale, ox, oy, strength, drawVisibleOutput]);

  const scheduleProcess = useCallback(() => {
    if (processTimerRef.current) window.clearTimeout(processTimerRef.current);
    processTimerRef.current = window.setTimeout(() => void process(), 60);
  }, [process]);

  useEffect(() => () => {
    if (processTimerRef.current) window.clearTimeout(processTimerRef.current);
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  useEffect(() => {
    if (base && mediaSize.w && mediaSize.h) scheduleProcess();
  }, [base, mediaSize, scale, ox, oy, strength, scheduleProcess]);

  const loadImage = (next: File) => {
    const url = URL.createObjectURL(next);
    const image = new Image();
    image.onload = async () => {
      try {
        setFile(next);
        setSourceUrl(url);
        setMediaSize({ w: image.naturalWidth, h: image.naturalHeight });
        const source = document.createElement("canvas");
        const output = document.createElement("canvas");
        drawImageToCanvas(image, source);
        drawImageToCanvas(image, output);
        sourceCanvasRef.current = source;
        outputCanvasRef.current = output;
        previousRectRef.current = null;
        engineRef.current = engineRef.current || await createWatermarkEngine();
        const info = engineRef.current.getWatermarkInfo(image.naturalWidth, image.naturalHeight);
        setBase(toRect(info.position));
        setStrength(0.6);
        setScale(1);
        setOx(0);
        setOy(0);
        setReady(false);
        setMessage(`Ready — ${info.size}px Gemini watermark template. No automatic image scanning.`);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Could not prepare the image.");
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      setMessage("The image could not be decoded.");
    };
    image.src = url;
  };

  const selectFile = (next: File | null) => {
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setMessage("This fast manual editor currently accepts PNG, JPG and WebP images.");
      return;
    }
    loadImage(next);
  };

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!active || !imageRef.current) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { startX: event.clientX, startY: event.clientY, startOx: ox, startOy: oy };
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || !imageRef.current || !base) return;
    const bounds = imageRef.current.getBoundingClientRect();
    const scaleX = mediaSize.w / Math.max(1, bounds.width);
    const scaleY = mediaSize.h / Math.max(1, bounds.height);
    setOx(clamp(Math.round(drag.startOx + (event.clientX - drag.startX) * scaleX), -512, 512));
    setOy(clamp(Math.round(drag.startOy + (event.clientY - drag.startY) * scaleY), -512, 512));
  };

  const onPointerUp = () => { dragRef.current = null; };

  const reset = () => {
    setStrength(0.6);
    setScale(1);
    setOx(0);
    setOy(0);
  };

  const exportImage = async () => {
    const canvas = outputCanvasRef.current;
    if (!canvas || !ready) return;
    setBusy(true);
    try {
      const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not encode image.")), "image/png"));
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "flythebg-gemini-clean.png";
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      setMessage("Clean PNG exported.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setBusy(false);
    }
  };

  const zoomStyle = active ? {
    width: "100%",
    height: "100%",
    objectFit: "cover" as const,
    objectPosition: `${((active.x + active.w / 2) / Math.max(1, mediaSize.w)) * 100}% ${((active.y + active.h / 2) / Math.max(1, mediaSize.h)) * 100}%`,
    transform: `scale(${Math.max(2.5, 180 / Math.max(12, active.w))})`,
    transformOrigin: "center",
  } : undefined;

  const cropBox = active ? {
    left: `${active.x / Math.max(1, mediaSize.w) * 100}%`,
    top: `${active.y / Math.max(1, mediaSize.h) * 100}%`,
    width: `${active.w / Math.max(1, mediaSize.w) * 100}%`,
    height: `${active.h / Math.max(1, mediaSize.h) * 100}%`,
  } : null;

  return (
    <div style={{ maxWidth: 980, margin: "0 auto", borderRadius: 18, background: "#f7f7fb", border: "1px solid #e8e8ef", padding: 18, color: "#1f1f28", fontFamily: "Inter, system-ui, sans-serif" }}>
      <style>{`@media(max-width:760px){.wm-grid{grid-template-columns:1fr!important}.wm-controls{grid-template-columns:1fr 1fr!important}.wm-upload{padding:28px 16px!important}}`}</style>
      <div className="wm-upload" style={{ border: "2px dashed #c9c9d8", borderRadius: 14, padding: "34px 24px", textAlign: "center", background: "white", cursor: "pointer" }} onClick={() => document.getElementById("wm-manual-input")?.click()}>
        <input id="wm-manual-input" type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={(e) => selectFile(e.target.files?.[0] || null)} />
        <div style={{ fontSize: 16, fontWeight: 700 }}>Upload Gemini image</div>
        <div style={{ marginTop: 7, color: "#747482", fontSize: 13 }}>Drop a PNG, JPG or WebP here, or tap to choose one</div>
      </div>

      {file && base && (
        <>
          <div style={{ marginTop: 16, textAlign: "center", fontSize: 13, fontWeight: 700, color: busy ? "#6756e8" : "#4b43b9" }}>{busy ? "Updating live preview…" : message}</div>
          <div className="wm-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 185px", gap: 16, marginTop: 12 }}>
            <div style={{ background: "white", borderRadius: 10, padding: 10, overflow: "hidden", minHeight: 240 }}>
              <div style={{ fontSize: 11, color: "#858592", marginBottom: 7, textAlign: "center", fontWeight: 700 }}>PREVIEW (FULL FRAME)</div>
              <div ref={(node) => { if (node) node.style.touchAction = "none"; }} style={{ position: "relative", maxWidth: "100%", margin: "0 auto", width: "fit-content", touchAction: "none" }} onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
                <img ref={imageRef} src={sourceUrl} alt="Original Gemini image" style={{ display: "block", maxWidth: "100%", maxHeight: 410, borderRadius: 7 }} draggable={false} />
                {cropBox && <div onPointerDown={onPointerDown} style={{ position: "absolute", border: "2px solid #5147d9", boxShadow: "0 0 0 9999px rgba(81,71,217,.04)", cursor: "grab", touchAction: "none", ...cropBox }} title="Drag to move watermark position" />}
              </div>
            </div>
            <div style={{ display: "grid", gap: 14, alignContent: "start" }}>
              <div style={{ background: "white", borderRadius: 10, padding: 8, overflow: "hidden", border: "1px solid #e5e5eb" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#70707c", textAlign: "center", marginBottom: 7 }}>⌕ ZOOMED ORIGINAL</div>
                <div style={{ height: 150, borderRadius: 7, overflow: "hidden", background: "#ddd" }}>{active && <img src={sourceUrl} alt="Zoomed original" style={{ ...zoomStyle }} />}</div>
              </div>
              <div style={{ background: "white", borderRadius: 10, padding: 8, overflow: "hidden", border: "1px solid #e5e5eb" }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: "#15966f", textAlign: "center", marginBottom: 7 }}>✓ ZOOMED CLEANED</div>
                <div style={{ height: 150, borderRadius: 7, overflow: "hidden", background: "#ddd" }}>{active && <canvas ref={outputVisibleRef} style={{ ...zoomStyle }} />}</div>
              </div>
            </div>
          </div>

          <div className="wm-controls" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginTop: 16, padding: "12px 12px 10px", background: "white", borderRadius: 10, border: "1px solid #e5e5eb" }}>
            <label style={{ fontSize: 10, fontWeight: 800, color: "#70707c" }}>Strength (Gain)<span style={{ float: "right", color: "#4b43b9" }}>{strength.toFixed(2)}x</span><input type="range" min="0.15" max="1.25" step="0.01" value={strength} onChange={(e) => setStrength(Number(e.target.value))} style={{ width: "100%", accentColor: "#5147d9" }} /></label>
            <label style={{ fontSize: 10, fontWeight: 800, color: "#70707c" }}>Size Scale<span style={{ float: "right", color: "#4b43b9" }}>{scale.toFixed(2)}x</span><input type="range" min="0.5" max="1.5" step="0.01" value={scale} onChange={(e) => setScale(Number(e.target.value))} style={{ width: "100%", accentColor: "#5147d9" }} /></label>
            <label style={{ fontSize: 10, fontWeight: 800, color: "#70707c" }}>Position X<span style={{ float: "right", color: "#4b43b9" }}>{ox}px</span><input type="range" min="-512" max="512" step="1" value={ox} onChange={(e) => setOx(Number(e.target.value))} style={{ width: "100%", accentColor: "#5147d9" }} /></label>
            <label style={{ fontSize: 10, fontWeight: 800, color: "#70707c" }}>Position Y<span style={{ float: "right", color: "#4b43b9" }}>{oy}px</span><input type="range" min="-512" max="512" step="1" value={oy} onChange={(e) => setOy(Number(e.target.value))} style={{ width: "100%", accentColor: "#5147d9" }} /></label>
          </div>
          <div style={{ textAlign: "center", marginTop: 7, color: "#777", fontSize: 11 }}>Tip: drag the blue box directly on the image — X/Y sliders are optional.</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
            <button onClick={reset} style={{ border: "1px solid #e0e0e8", background: "white", borderRadius: 9, padding: "9px 18px", cursor: "pointer", fontWeight: 700 }}>↶ Reset Sliders</button>
            <button onClick={exportImage} disabled={!ready || busy} style={{ border: 0, background: "linear-gradient(90deg,#6255df,#493bd0)", color: "white", borderRadius: 9, padding: "9px 20px", cursor: ready && !busy ? "pointer" : "not-allowed", fontWeight: 800, opacity: ready && !busy ? 1 : .55 }}>✎ Remove &amp; Export Image</button>
          </div>
          <div style={{ textAlign: "center", marginTop: 8, color: "#8a8a95", fontSize: 10 }}>{ready ? `Live reconstruction • ${elapsed.toFixed(2)}s last update • local browser processing` : "Preparing preview…"}</div>
        </>
      )}
    </div>
  );
}
