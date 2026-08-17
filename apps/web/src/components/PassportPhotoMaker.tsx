"use client";

import { ChangeEvent, PointerEvent, WheelEvent, useEffect, useMemo, useRef, useState } from "react";
import { removeBackgroundWithFallback } from "@/lib/browser-background-removal";
import { validateUploadBasics } from "@/lib/image-validation";

type Unit = "cm" | "mm" | "in";
type SourceMode = "direct" | "remove";
type PaperPreset = "a4" | "4x6" | "letter" | "custom";
type Position = { xMm: number; yMm: number };

type PreparedPhoto = { url: string; width: number; height: number; label: string };

const MAX_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || "12") || 12;
const MAX_EXPORT_PIXELS = 20_000_000;
const MAX_EXPORT_EDGE = 7000;
const unitToMm: Record<Unit, number> = { cm: 10, mm: 1, in: 25.4 };
const presets: Record<Exclude<PaperPreset, "custom">, { widthMm: number; heightMm: number; label: string }> = {
  a4: { widthMm: 210, heightMm: 297, label: "A4 · 210 × 297 mm" },
  "4x6": { widthMm: 101.6, heightMm: 152.4, label: "4 × 6 in photo paper" },
  letter: { widthMm: 215.9, heightMm: 279.4, label: "US Letter · 8.5 × 11 in" },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const mmToPx = (mm: number, dpi: number) => Math.max(1, Math.round((mm / 25.4) * dpi));

function safeDpi(widthMm: number, heightMm: number, requested: number) {
  const widthIn = Math.max(.1, widthMm / 25.4);
  const heightIn = Math.max(.1, heightMm / 25.4);
  const byPixels = Math.floor(Math.sqrt(MAX_EXPORT_PIXELS / (widthIn * heightIn)));
  const byEdge = Math.floor(Math.min(MAX_EXPORT_EDGE / widthIn, MAX_EXPORT_EDGE / heightIn));
  return Math.max(150, Math.min(requested, byPixels, byEdge));
}

async function preparePhoto(blob: Blob, label: string): Promise<PreparedPhoto> {
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`${label} could not be decoded.`));
      image.src = url;
    });
    await image.decode().catch(() => undefined);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) throw new Error(`${label} has invalid dimensions.`);
    return { url, width, height, label };
  } catch (reason) {
    URL.revokeObjectURL(url);
    throw reason;
  } finally {
    image.src = "";
  }
}

function buildLayout(pageWidthMm: number, pageHeightMm: number, photoWidthMm: number, photoHeightMm: number, marginMm: number, gapMm: number, copies: number) {
  const usableWidth = pageWidthMm - marginMm * 2;
  const usableHeight = pageHeightMm - marginMm * 2;
  if (photoWidthMm <= 0 || photoHeightMm <= 0 || usableWidth < photoWidthMm || usableHeight < photoHeightMm) return [] as Position[];
  const cols = Math.max(1, Math.floor((usableWidth + gapMm) / (photoWidthMm + gapMm)));
  const rows = Math.max(1, Math.floor((usableHeight + gapMm) / (photoHeightMm + gapMm)));
  const total = Math.min(copies, cols * rows);
  return Array.from({ length: total }, (_, index) => ({
    xMm: marginMm + (index % cols) * (photoWidthMm + gapMm),
    yMm: marginMm + Math.floor(index / cols) * (photoHeightMm + gapMm),
  }));
}

function drawCell(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number, zoom: number, shiftX: number, shiftY: number, background: string) {
  if (!image.naturalWidth || !image.naturalHeight) return;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = background;
  ctx.fillRect(x, y, width, height);
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();
  const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
  const drawWidth = image.naturalWidth * cover;
  const drawHeight = image.naturalHeight * cover;
  const dx = x + (width - drawWidth) / 2 + shiftX * Math.max(0, drawWidth - width) * .5;
  const dy = y + (height - drawHeight) / 2 + shiftY * Math.max(0, drawHeight - height) * .5;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  ctx.restore();
}

export function PassportPhotoMaker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const portraitCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const dragRef = useRef<{ x: number; y: number; shiftX: number; shiftY: number } | null>(null);

  const [sourceMode, setSourceMode] = useState<SourceMode>("remove");
  const [source, setSource] = useState<PreparedPhoto | null>(null);
  const [fileName, setFileName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [cleanup, setCleanup] = useState("");
  const [unit, setUnit] = useState<Unit>("cm");
  const [photoWidth, setPhotoWidth] = useState(3.5);
  const [photoHeight, setPhotoHeight] = useState(4.5);
  const [dpi, setDpi] = useState(300);
  const [paperPreset, setPaperPreset] = useState<PaperPreset>("a4");
  const [customWidthMm, setCustomWidthMm] = useState(210);
  const [customHeightMm, setCustomHeightMm] = useState(297);
  const [copies, setCopies] = useState(8);
  const [marginMm, setMarginMm] = useState(8);
  const [gapMm, setGapMm] = useState(3);
  const [zoom, setZoom] = useState(1.05);
  const [shiftX, setShiftX] = useState(0);
  const [shiftY, setShiftY] = useState(0);
  const [background, setBackground] = useState("#ffffff");

  const photoWidthMm = Math.max(1, photoWidth * unitToMm[unit]);
  const photoHeightMm = Math.max(1, photoHeight * unitToMm[unit]);
  const paper = paperPreset === "custom" ? { widthMm: customWidthMm, heightMm: customHeightMm } : presets[paperPreset];
  const exportDpi = safeDpi(paper.widthMm, paper.heightMm, dpi);
  const capacity = useMemo(() => buildLayout(paper.widthMm, paper.heightMm, photoWidthMm, photoHeightMm, marginMm, gapMm, 200).length, [paper.widthMm, paper.heightMm, photoWidthMm, photoHeightMm, marginMm, gapMm]);
  const positions = useMemo(() => buildLayout(paper.widthMm, paper.heightMm, photoWidthMm, photoHeightMm, marginMm, gapMm, Math.min(copies, Math.max(1, capacity))), [paper.widthMm, paper.heightMm, photoWidthMm, photoHeightMm, marginMm, gapMm, copies, capacity]);

  useEffect(() => {
    if (capacity > 0 && copies > capacity) setCopies(capacity);
  }, [capacity, copies]);

  useEffect(() => {
    if (!source) {
      sourceImageRef.current = null;
      return;
    }
    let active = true;
    const image = new Image();
    image.decoding = "async";
    image.onload = () => {
      if (!active) return;
      sourceImageRef.current = image;
      setError("");
      requestAnimationFrame(drawPreviews);
    };
    image.onerror = () => {
      if (!active) return;
      setError("The prepared photo could not be loaded. Choose it again.");
      sourceImageRef.current = null;
    };
    image.src = source.url;
    return () => { active = false; image.src = ""; sourceImageRef.current = null; };
  }, [source?.url]);

  useEffect(() => { drawPreviews(); }, [photoWidthMm, photoHeightMm, paper.widthMm, paper.heightMm, positions, zoom, shiftX, shiftY, background]);

  function releaseWorkingPhoto(notice = "Working image cleared from this tab.") {
    if (source) URL.revokeObjectURL(source.url);
    setSource(null);
    setFileName("");
    sourceImageRef.current = null;
    setProgress("");
    setZoom(1.05);
    setShiftX(0);
    setShiftY(0);
    if (portraitCanvasRef.current) { portraitCanvasRef.current.width = 1; portraitCanvasRef.current.height = 1; }
    if (sheetCanvasRef.current) { sheetCanvasRef.current.width = 1; sheetCanvasRef.current.height = 1; }
    if (inputRef.current) inputRef.current.value = "";
    setCleanup(notice);
  }

  function drawPreviews() {
    const image = sourceImageRef.current;
    const portrait = portraitCanvasRef.current;
    const sheet = sheetCanvasRef.current;
    if (!image || !portrait || !sheet || !image.naturalWidth || !image.naturalHeight) return;

    portrait.width = 340;
    portrait.height = Math.min(520, Math.max(250, Math.round(340 * photoHeightMm / photoWidthMm)));
    const portraitCtx = portrait.getContext("2d");
    if (portraitCtx) {
      portraitCtx.clearRect(0, 0, portrait.width, portrait.height);
      drawCell(portraitCtx, image, 0, 0, portrait.width, portrait.height, zoom, shiftX, shiftY, background);
    }

    const scale = Math.min(760 / paper.widthMm, 620 / paper.heightMm);
    sheet.width = Math.max(240, Math.round(paper.widthMm * scale));
    sheet.height = Math.max(280, Math.round(paper.heightMm * scale));
    const ctx = sheet.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, sheet.width, sheet.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, sheet.width, sheet.height);
    const sx = sheet.width / paper.widthMm;
    const sy = sheet.height / paper.heightMm;
    positions.forEach((position) => {
      const x = position.xMm * sx;
      const y = position.yMm * sy;
      const w = photoWidthMm * sx;
      const h = photoHeightMm * sy;
      drawCell(ctx, image, x, y, w, h, zoom, shiftX, shiftY, background);
      ctx.strokeStyle = "rgba(10,20,35,.25)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
    });
  }

  async function handleFile(file: File) {
    const problem = validateUploadBasics(file, MAX_MB);
    if (problem) { setError(problem); return; }
    setProcessing(true);
    setError("");
    setCleanup("");
    setProgress(sourceMode === "remove" ? "Starting browser background removal…" : "Preparing photo…");
    try {
      if (source) URL.revokeObjectURL(source.url);
      const prepared = sourceMode === "remove"
        ? await removeBackgroundWithFallback(file, setProgress).then((result) => preparePhoto(result.blob, `IMG.LY ${result.modelLabel}`))
        : await preparePhoto(file, "Original photo");
      setSource(prepared);
      setFileName(file.name);
      setZoom(1.05);
      setShiftX(0);
      setShiftY(0);
      setProgress("");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not prepare the passport photo.");
      setProgress("");
    } finally {
      setProcessing(false);
    }
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) void handleFile(file);
  }

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { x: event.clientX, y: event.clientY, shiftX, shiftY };
  }
  function onPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const start = dragRef.current;
    if (!start) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setShiftX(clamp(start.shiftX + (event.clientX - start.x) / Math.max(1, rect.width) * 2.5, -1, 1));
    setShiftY(clamp(start.shiftY + (event.clientY - start.y) / Math.max(1, rect.height) * 2.5, -1, 1));
  }
  function onPointerUp(event: PointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }
  function onWheel(event: WheelEvent<HTMLCanvasElement>) {
    event.preventDefault();
    setZoom((current) => clamp(current + (event.deltaY > 0 ? -.05 : .05), 1, 3));
  }

  async function createSheetBlob() {
    const image = sourceImageRef.current;
    if (!image || !positions.length) throw new Error("Upload a photo and choose a sheet layout first.");
    const canvas = document.createElement("canvas");
    canvas.width = mmToPx(paper.widthMm, exportDpi);
    canvas.height = mmToPx(paper.heightMm, exportDpi);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot create the print sheet.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    positions.forEach((position) => drawCell(
      ctx,
      image,
      mmToPx(position.xMm, exportDpi),
      mmToPx(position.yMm, exportDpi),
      mmToPx(photoWidthMm, exportDpi),
      mmToPx(photoHeightMm, exportDpi),
      zoom,
      shiftX,
      shiftY,
      background,
    ));
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("PNG export failed.")), "image/png");
    });
    canvas.width = 1;
    canvas.height = 1;
    return blob;
  }

  async function downloadSheet() {
    setError("");
    try {
      const blob = await createSheetBlob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const base = fileName.replace(/\.[^.]+$/, "") || "passport-photo";
      link.href = href;
      link.download = `${base}-passport-sheet-${exportDpi}dpi.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => {
        URL.revokeObjectURL(href);
        releaseWorkingPhoto("Download started. The source, cutout, previews, and generated sheet were released from this tab memory. Your downloaded file remains on your device.");
      }, 1400);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Export failed.");
    }
  }

  return (
    <div className="passportMaker passportRedesign">
      <section className="passportHeroCard">
        <div>
          <span className="eyebrow"><i/> Passport Photo Maker</span>
          <h1>Cut out. Frame. Fill the sheet.</h1>
          <p>Everything happens in your browser. If you remove the background, IMG.LY quantized runs first and FP16 is the automatic fallback. Your image is not sent to FlytheBG or stored in a database.</p>
        </div>
        <div className="passportTrustGrid"><div><b>Browser</b><span>image processing</span></div><div><b>300 DPI</b><span>safe default</span></div><div><b>0</b><span>image database uploads</span></div></div>
      </section>

      <section className="passportStartCard">
        <div className="sourceModeCards">
          <button className={sourceMode === "remove" ? "active" : ""} onClick={() => { if (source) releaseWorkingPhoto(); setSourceMode("remove"); }}><b>01</b><strong>Remove background</strong><span>IMG.LY quantized → FP16 fallback.</span></button>
          <button className={sourceMode === "direct" ? "active" : ""} onClick={() => { if (source) releaseWorkingPhoto(); setSourceMode("direct"); }}><b>02</b><strong>Keep original</strong><span>Skip background removal and build the sheet.</span></button>
        </div>
        <input ref={inputRef} className="srOnly" type="file" accept="image/png,image/jpeg,image/webp" onChange={onInput} />
        <button className="primaryButton passportUpload" disabled={processing} onClick={() => inputRef.current?.click()}>{processing ? "Preparing photo…" : source ? "Choose another photo" : "Choose photo"} <span>↗</span></button>
        {progress && <div className="passportProcessing"><span className="liveDot"/><strong>{progress}</strong></div>}
        {error && <div className="errorBox"><strong>Passport maker</strong><span>{error}</span></div>}
        {cleanup && !source && <div className="passportMemoryNotice"><strong>Working image cleared</strong><span>{cleanup}</span></div>}
      </section>

      {source && <>
        <div className="passportEngineBar"><div><span>Working image</span><strong>{source.label}</strong></div><div><span>Source</span><strong>{source.width} × {source.height}px</strong></div><div><span>Privacy</span><strong>browser-only image flow</strong></div></div>

        <div className="passportWorkspace">
          <section className="passportPanel">
            <span className="toolKicker">1 · Size</span>
            <div className="measurementRow"><label>Width<input type="number" min="0.1" step="0.1" value={photoWidth} onChange={(e) => setPhotoWidth(Math.max(.1, Number(e.target.value) || .1))}/></label><label>Height<input type="number" min="0.1" step="0.1" value={photoHeight} onChange={(e) => setPhotoHeight(Math.max(.1, Number(e.target.value) || .1))}/></label><label>Unit<select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}><option value="cm">cm</option><option value="mm">mm</option><option value="in">inch</option></select></label></div>
            <div className="dpiButtons"><button className={dpi === 300 ? "active" : ""} onClick={() => setDpi(300)}>300 DPI</button><button className={dpi === 600 ? "active" : ""} onClick={() => setDpi(600)}>600 DPI</button></div>
            {exportDpi < dpi && <p className="memoryGuard">Memory guard changed the export to {exportDpi} DPI so the browser does not create an oversized canvas.</p>}
          </section>

          <section className="passportPanel portraitPanel">
            <div className="panelTitleRow"><span className="toolKicker">2 · Frame</span><button className="miniButton" onClick={() => { setZoom(1.05); setShiftX(0); setShiftY(0); }}>Reset</button></div>
            <div className="portraitEditor"><canvas ref={portraitCanvasRef} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onWheel={onWheel}/></div>
            <p className="panelHint">Drag the person to reposition. Scroll or use the slider to zoom.</p>
            <label className="zoomControl">Zoom <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))}/><span>{zoom.toFixed(2)}×</span></label>
            <label className="colorControl">Photo background <input type="color" value={background} onChange={(e) => setBackground(e.target.value)}/><span>{background.toUpperCase()}</span></label>
            <p className="panelHint">The selected color fills each photo rectangle only. The paper stays white.</p>
          </section>

          <section className="passportPanel">
            <span className="toolKicker">3 · Sheet</span>
            <label>Paper<select value={paperPreset} onChange={(e) => setPaperPreset(e.target.value as PaperPreset)}><option value="a4">{presets.a4.label}</option><option value="4x6">{presets["4x6"].label}</option><option value="letter">{presets.letter.label}</option><option value="custom">Custom</option></select></label>
            {paperPreset === "custom" && <div className="measurementRow two"><label>Width mm<input type="number" min="20" value={customWidthMm} onChange={(e) => setCustomWidthMm(Math.max(20, Number(e.target.value) || 20))}/></label><label>Height mm<input type="number" min="20" value={customHeightMm} onChange={(e) => setCustomHeightMm(Math.max(20, Number(e.target.value) || 20))}/></label></div>}
            <div className="measurementRow three"><label>Copies<input type="number" min="1" max={Math.max(1, capacity)} value={copies} onChange={(e) => setCopies(clamp(Number(e.target.value) || 1, 1, Math.max(1, capacity)))}/></label><label>Margin mm<input type="number" min="0" step="0.5" value={marginMm} onChange={(e) => setMarginMm(Math.max(0, Number(e.target.value) || 0))}/></label><label>Gap mm<input type="number" min="0" step="0.5" value={gapMm} onChange={(e) => setGapMm(Math.max(0, Number(e.target.value) || 0))}/></label></div>
            <div className="capacityRow"><span>Capacity</span><strong>{capacity} photos</strong><button className="miniButton" disabled={capacity < 1} onClick={() => setCopies(capacity)}>Fill sheet</button></div>
            {capacity < 1 && <p className="memoryGuard">No photo fits. Reduce photo dimensions or margins.</p>}
          </section>
        </div>

        <section className="sheetSection">
          <div className="sheetHeading"><div><span className="toolKicker">4 · Preview</span><h2>{positions.length} photos ready to print</h2><p>Selected photo background stays inside each photo. The surrounding print sheet is always white.</p></div><div className="sheetMeta"><b>{mmToPx(paper.widthMm, exportDpi)} × {mmToPx(paper.heightMm, exportDpi)} px</b><span>{exportDpi} DPI PNG</span></div></div>
          <div className="sheetCanvasShell"><canvas ref={sheetCanvasRef}/></div>
          <div className="sheetActions"><button className="primaryButton" disabled={!positions.length} onClick={() => void downloadSheet()}>Download print sheet & clear <span>↓</span></button></div>
          <p className="sheetPrivacyNote">Print using Actual Size / 100%. After download starts, FlytheBG releases the working source, cutout, previews, and generated sheet from this tab memory.</p>
        </section>
      </>}
    </div>
  );
}
