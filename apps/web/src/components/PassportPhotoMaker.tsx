"use client";

import { ChangeEvent, PointerEvent, WheelEvent, useEffect, useMemo, useRef, useState } from "react";
import { validateUploadBasics } from "@/lib/image-validation";

type Unit = "cm" | "mm" | "in";
type SourceMode = "direct" | "remove";
type LayoutMode = "auto" | "manual";
type PaperPreset = "a4" | "4x6" | "letter" | "custom";
type Position = { xMm: number; yMm: number };

type PreparedWorkingPhoto = {
  url: string;
  width: number;
  height: number;
  foregroundCoverage: number;
};

const MAX_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || "12") || 12;
const EMPTY_FOREGROUND_THRESHOLD = 0.0015;
const PREPARE_MAX_EDGE = 512;
const MAX_EXPORT_PIXELS = 20_000_000;
const MAX_EXPORT_EDGE = 7000;
const mmPerUnit: Record<Unit, number> = { mm: 1, cm: 10, in: 25.4 };
const presets: Record<Exclude<PaperPreset, "custom">, { widthMm: number; heightMm: number; label: string }> = {
  a4: { widthMm: 210, heightMm: 297, label: "A4 · 210 × 297 mm" },
  "4x6": { widthMm: 101.6, heightMm: 152.4, label: "4 × 6 in photo paper" },
  letter: { widthMm: 215.9, heightMm: 279.4, label: "US Letter · 8.5 × 11 in" },
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const mmToPx = (mm: number, dpi: number) => Math.max(1, Math.round((mm / 25.4) * dpi));

function memorySafeDpi(widthMm: number, heightMm: number, requestedDpi: number) {
  const widthIn = Math.max(0.1, widthMm / 25.4);
  const heightIn = Math.max(0.1, heightMm / 25.4);
  const byPixels = Math.floor(Math.sqrt(MAX_EXPORT_PIXELS / (widthIn * heightIn)));
  const byEdge = Math.floor(Math.min(MAX_EXPORT_EDGE / widthIn, MAX_EXPORT_EDGE / heightIn));
  return Math.max(150, Math.min(requestedDpi, byPixels, byEdge));
}

async function prepareWorkingPhoto(blob: Blob, label: string, requireForeground: boolean): Promise<PreparedWorkingPhoto> {
  if (!blob || blob.size < 32) throw new Error(`${label} returned an empty image.`);
  if (blob.type && !blob.type.startsWith("image/")) throw new Error(`${label} returned an unsupported file type.`);

  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`${label} could not be decoded by this browser.`));
      image.src = url;
    });

    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) throw new Error(`${label} has invalid dimensions.`);

    const scale = Math.min(1, PREPARE_MAX_EDGE / Math.max(width, height));
    const sampleWidth = Math.max(1, Math.round(width * scale));
    const sampleHeight = Math.max(1, Math.round(height * scale));
    const sample = document.createElement("canvas");
    sample.width = sampleWidth;
    sample.height = sampleHeight;
    const ctx = sample.getContext("2d", { willReadFrequently: requireForeground });
    if (!ctx) throw new Error("This browser cannot prepare the passport photo.");

    ctx.clearRect(0, 0, sampleWidth, sampleHeight);
    ctx.drawImage(image, 0, 0, sampleWidth, sampleHeight);

    let foregroundCoverage = 1;
    if (requireForeground) {
      const pixels = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
      let foregroundPixels = 0;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] >= 18) foregroundPixels += 1;
      }
      foregroundCoverage = foregroundPixels / Math.max(1, sampleWidth * sampleHeight);
      if (foregroundCoverage < EMPTY_FOREGROUND_THRESHOLD) {
        throw new Error("Background removal produced an empty cutout. The blank result was rejected so a color-only passport sheet is not created. Try a clearer photo.");
      }
    }

    sample.width = 1;
    sample.height = 1;
    return { url, width, height, foregroundCoverage };
  } catch (reason) {
    URL.revokeObjectURL(url);
    throw reason;
  }
}

function drawPhotoCell(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  zoom: number,
  shiftX: number,
  shiftY: number,
  background: string,
) {
  if (!image.naturalWidth || !image.naturalHeight || width <= 0 || height <= 0) return;

  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";

  // The selected color belongs only to each passport-photo cell. The paper stays white.
  ctx.fillStyle = background;
  ctx.fillRect(x, y, width, height);

  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
  const drawWidth = image.naturalWidth * cover;
  const drawHeight = image.naturalHeight * cover;
  const availableX = Math.max(0, drawWidth - width);
  const availableY = Math.max(0, drawHeight - height);
  const dx = x + (width - drawWidth) / 2 + shiftX * availableX * 0.5;
  const dy = y + (height - drawHeight) / 2 + shiftY * availableY * 0.5;

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  ctx.restore();
}

function autoLayout(pageWidthMm: number, pageHeightMm: number, photoWidthMm: number, photoHeightMm: number, copies: number, marginMm: number, gapMm: number): Position[] {
  const positions: Position[] = [];
  const usableWidth = Math.max(photoWidthMm, pageWidthMm - marginMm * 2);
  const columns = Math.max(1, Math.floor((usableWidth + gapMm) / (photoWidthMm + gapMm)));
  for (let index = 0; index < copies; index += 1) {
    const col = index % columns;
    const row = Math.floor(index / columns);
    const xMm = marginMm + col * (photoWidthMm + gapMm);
    const yMm = marginMm + row * (photoHeightMm + gapMm);
    if (xMm + photoWidthMm <= pageWidthMm - marginMm + 0.01 && yMm + photoHeightMm <= pageHeightMm - marginMm + 0.01) positions.push({ xMm, yMm });
  }
  return positions;
}

export function PassportPhotoMaker() {
  const inputRef = useRef<HTMLInputElement>(null);
  const portraitCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const dragPortraitRef = useRef<{ x: number; y: number; shiftX: number; shiftY: number } | null>(null);
  const dragCopyRef = useRef<{ index: number; x: number; y: number; start: Position } | null>(null);

  const [sourceMode, setSourceMode] = useState<SourceMode>("direct");
  const [fileName, setFileName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [releaseNotice, setReleaseNotice] = useState("");
  const [foregroundCoverage, setForegroundCoverage] = useState(1);
  const [unit, setUnit] = useState<Unit>("cm");
  const [photoWidth, setPhotoWidth] = useState(3.5);
  const [photoHeight, setPhotoHeight] = useState(4.5);
  const [dpi, setDpi] = useState(300);
  const [paperPreset, setPaperPreset] = useState<PaperPreset>("a4");
  const [customPaperWidthMm, setCustomPaperWidthMm] = useState(210);
  const [customPaperHeightMm, setCustomPaperHeightMm] = useState(297);
  const [copies, setCopies] = useState(8);
  const [marginMm, setMarginMm] = useState(8);
  const [gapMm, setGapMm] = useState(3);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("auto");
  const [positions, setPositions] = useState<Position[]>([]);
  const [zoom, setZoom] = useState(1.05);
  const [shiftX, setShiftX] = useState(0);
  const [shiftY, setShiftY] = useState(0);
  const [background, setBackground] = useState("#ffffff");

  const photoWidthMm = Math.max(1, photoWidth * mmPerUnit[unit]);
  const photoHeightMm = Math.max(1, photoHeight * mmPerUnit[unit]);
  const paper = paperPreset === "custom" ? { widthMm: customPaperWidthMm, heightMm: customPaperHeightMm } : presets[paperPreset];
  const exportDpi = memorySafeDpi(paper.widthMm, paper.heightMm, dpi);

  const autoPositions = useMemo(
    () => autoLayout(paper.widthMm, paper.heightMm, photoWidthMm, photoHeightMm, copies, marginMm, gapMm),
    [paper.widthMm, paper.heightMm, photoWidthMm, photoHeightMm, copies, marginMm, gapMm],
  );

  useEffect(() => {
    if (layoutMode === "auto" || positions.length !== copies) setPositions(autoPositions);
  }, [autoPositions, copies, layoutMode]);

  useEffect(() => () => {
    if (sourceUrl) URL.revokeObjectURL(sourceUrl);
  }, [sourceUrl]);

  useEffect(() => {
    if (!sourceUrl) {
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
      drawPreviews();
    };
    image.onerror = () => {
      if (!active) return;
      sourceImageRef.current = null;
      setError("The prepared photo could not be loaded. Please choose the image again.");
    };
    image.src = sourceUrl;

    return () => {
      active = false;
      image.src = "";
      sourceImageRef.current = null;
    };
  }, [sourceUrl]);

  useEffect(() => {
    drawPreviews();
  }, [photoWidthMm, photoHeightMm, paper.widthMm, paper.heightMm, positions, zoom, shiftX, shiftY, background]);

  function clearCanvas(canvas: HTMLCanvasElement | null) {
    if (!canvas) return;
    canvas.width = 1;
    canvas.height = 1;
  }

  function releasePhotoMemory(message = "Working photo cleared from this tab memory.") {
    sourceImageRef.current = null;
    setSourceUrl("");
    setFileName("");
    setPositions([]);
    setForegroundCoverage(1);
    setZoom(1.05);
    setShiftX(0);
    setShiftY(0);
    clearCanvas(portraitCanvasRef.current);
    clearCanvas(sheetCanvasRef.current);
    if (inputRef.current) inputRef.current.value = "";
    setReleaseNotice(message);
  }

  function drawPreviews() {
    const image = sourceImageRef.current;
    const portrait = portraitCanvasRef.current;
    const sheet = sheetCanvasRef.current;
    if (!image || !portrait || !sheet || !image.naturalWidth || !image.naturalHeight) return;

    const portraitWidth = 320;
    const portraitHeight = Math.round((portraitWidth * photoHeightMm) / photoWidthMm);
    portrait.width = portraitWidth;
    portrait.height = Math.min(520, Math.max(220, portraitHeight));
    const portraitCtx = portrait.getContext("2d");
    if (portraitCtx) {
      portraitCtx.clearRect(0, 0, portrait.width, portrait.height);
      drawPhotoCell(portraitCtx, image, 0, 0, portrait.width, portrait.height, zoom, shiftX, shiftY, background);
    }

    const maxPreviewWidth = 760;
    const scale = Math.min(maxPreviewWidth / paper.widthMm, 620 / paper.heightMm);
    sheet.width = Math.max(240, Math.round(paper.widthMm * scale));
    sheet.height = Math.max(280, Math.round(paper.heightMm * scale));
    const ctx = sheet.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, sheet.width, sheet.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, sheet.width, sheet.height);

    const sx = sheet.width / paper.widthMm;
    const sy = sheet.height / paper.heightMm;
    positions.forEach((position, index) => {
      const x = position.xMm * sx;
      const y = position.yMm * sy;
      const w = photoWidthMm * sx;
      const h = photoHeightMm * sy;
      drawPhotoCell(ctx, image, x, y, w, h, zoom, shiftX, shiftY, background);
      ctx.strokeStyle = layoutMode === "manual" ? "rgba(14,165,233,.85)" : "rgba(20,20,20,.22)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);
      if (layoutMode === "manual") {
        ctx.fillStyle = "rgba(2,6,23,.72)";
        ctx.fillRect(x + 4, y + 4, 22, 18);
        ctx.fillStyle = "white";
        ctx.font = "11px Arial";
        ctx.fillText(String(index + 1), x + 10, y + 17);
      }
    });
  }

  async function handleFile(nextFile: File) {
    const problem = validateUploadBasics(nextFile, MAX_MB);
    if (problem) {
      setError(problem);
      return;
    }

    setProcessing(true);
    setError("");
    setReleaseNotice("");

    try {
      let blob: Blob = nextFile;
      if (sourceMode === "remove") {
        const form = new FormData();
        form.append("image", nextFile);
        const response = await fetch("/api/remove-background", { method: "POST", body: form, cache: "no-store" });
        if (!response.ok) {
          const body = await response.json().catch(() => ({ error: "Background removal failed." }));
          throw new Error(body.error || "Background removal failed.");
        }
        blob = await response.blob();
      }

      const prepared = await prepareWorkingPhoto(blob, sourceMode === "remove" ? "Background removal" : "Photo", sourceMode === "remove");
      setFileName(nextFile.name);
      setForegroundCoverage(prepared.foregroundCoverage);
      setSourceUrl(prepared.url);
      setZoom(1.05);
      setShiftX(0);
      setShiftY(0);
      setLayoutMode("auto");
      setPositions(autoPositions);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not prepare the photo.");
    } finally {
      setProcessing(false);
    }
  }

  function onInput(event: ChangeEvent<HTMLInputElement>) {
    const next = event.target.files?.[0];
    if (next) void handleFile(next);
  }

  function onPortraitDown(event: PointerEvent<HTMLCanvasElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragPortraitRef.current = { x: event.clientX, y: event.clientY, shiftX, shiftY };
  }

  function onPortraitMove(event: PointerEvent<HTMLCanvasElement>) {
    const start = dragPortraitRef.current;
    if (!start) return;
    const rect = event.currentTarget.getBoundingClientRect();
    setShiftX(clamp(start.shiftX + ((event.clientX - start.x) / Math.max(1, rect.width)) * 2.5, -1, 1));
    setShiftY(clamp(start.shiftY + ((event.clientY - start.y) / Math.max(1, rect.height)) * 2.5, -1, 1));
  }

  function onPortraitUp(event: PointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragPortraitRef.current = null;
  }

  function onPortraitWheel(event: WheelEvent<HTMLCanvasElement>) {
    event.preventDefault();
    setZoom((current) => clamp(current + (event.deltaY > 0 ? -0.05 : 0.05), 1, 3));
  }

  function onSheetDown(event: PointerEvent<HTMLCanvasElement>) {
    if (layoutMode !== "manual") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const xMm = ((event.clientX - rect.left) / Math.max(1, rect.width)) * paper.widthMm;
    const yMm = ((event.clientY - rect.top) / Math.max(1, rect.height)) * paper.heightMm;
    const index = positions.findIndex((position) => xMm >= position.xMm && xMm <= position.xMm + photoWidthMm && yMm >= position.yMm && yMm <= position.yMm + photoHeightMm);
    if (index < 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragCopyRef.current = { index, x: xMm, y: yMm, start: positions[index] };
  }

  function onSheetMove(event: PointerEvent<HTMLCanvasElement>) {
    const drag = dragCopyRef.current;
    if (!drag || layoutMode !== "manual") return;
    const rect = event.currentTarget.getBoundingClientRect();
    const xMm = ((event.clientX - rect.left) / Math.max(1, rect.width)) * paper.widthMm;
    const yMm = ((event.clientY - rect.top) / Math.max(1, rect.height)) * paper.heightMm;
    setPositions((current) => current.map((position, index) => index === drag.index ? {
      xMm: clamp(drag.start.xMm + xMm - drag.x, 0, Math.max(0, paper.widthMm - photoWidthMm)),
      yMm: clamp(drag.start.yMm + yMm - drag.y, 0, Math.max(0, paper.heightMm - photoHeightMm)),
    } : position));
  }

  function onSheetUp(event: PointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragCopyRef.current = null;
  }

  async function createPrintBlob() {
    const image = sourceImageRef.current;
    if (!image || !image.naturalWidth || !image.naturalHeight) throw new Error("Upload a valid photo first.");
    if (!positions.length) throw new Error("No passport photos fit on the selected paper. Reduce photo size, margins, or copy count.");

    const canvas = document.createElement("canvas");
    canvas.width = mmToPx(paper.widthMm, exportDpi);
    canvas.height = mmToPx(paper.heightMm, exportDpi);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas unavailable.");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    positions.forEach((position) => {
      drawPhotoCell(
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
      );
    });

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Could not encode print sheet.")), "image/png");
    });

    // Explicitly shrink the temporary high-resolution canvas so its backing buffer can be reclaimed quickly.
    canvas.width = 1;
    canvas.height = 1;
    return blob;
  }

  async function downloadSheet() {
    setError("");
    try {
      const blob = await createPrintBlob();
      const href = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const base = fileName.replace(/\.[^.]+$/, "") || "passport-photo";
      link.href = href;
      link.download = `${base}-print-sheet-${exportDpi}dpi.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();

      window.setTimeout(() => {
        URL.revokeObjectURL(href);
        releasePhotoMemory("Download started successfully. The working photo, cutout, previews, and generated sheet were released from this tab memory. Your downloaded file remains on your device.");
      }, 1500);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Export failed.");
    }
  }

  async function printSheet() {
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) {
      setError("Allow pop-ups to use the browser print dialog.");
      return;
    }

    popup.document.write("<p style='font-family:Arial;padding:24px'>Preparing print-quality sheet…</p>");
    try {
      const blob = await createPrintBlob();
      const href = URL.createObjectURL(blob);
      popup.document.open();
      popup.document.write(`<!doctype html><html><head><title>FlytheBG Passport Print</title><style>@page{size:${paper.widthMm}mm ${paper.heightMm}mm;margin:0}html,body{margin:0;padding:0;background:#fff}img{display:block;width:${paper.widthMm}mm;height:${paper.heightMm}mm;object-fit:contain}</style></head><body><img src="${href}" onload="setTimeout(()=>window.print(),250)" /></body></html>`);
      popup.document.close();
      window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
    } catch (reason) {
      popup.close();
      setError(reason instanceof Error ? reason.message : "Print preparation failed.");
    }
  }

  const maxCopies = autoLayout(paper.widthMm, paper.heightMm, photoWidthMm, photoHeightMm, 200, marginMm, gapMm).length;

  return (
    <div className="passportMaker">
      <div className="passportStart">
        <div>
          <span className="eyebrow"><i/> Passport Photo Maker</span>
          <h1>Exact print size. Memory-safe export.</h1>
          <p>Use an existing photo as-is, or remove its background first. FlytheBG validates the cutout before it can reach the sheet, so an empty transparent result cannot silently become a color-only page.</p>
        </div>

        <div className="sourceModeCards">
          <button className={sourceMode === "direct" ? "active" : ""} onClick={() => setSourceMode("direct")}><b>01</b><strong>Use my photo</strong><span>Keep the existing background.</span></button>
          <button className={sourceMode === "remove" ? "active" : ""} onClick={() => setSourceMode("remove")}><b>02</b><strong>Remove background first</strong><span>Run FlytheBG Precision, validate the person, then create the sheet.</span></button>
        </div>

        <input ref={inputRef} className="srOnly" type="file" accept="image/png,image/jpeg,image/webp" onChange={onInput} />
        <button className="primaryButton passportUpload" disabled={processing} onClick={() => inputRef.current?.click()}>
          {processing ? "Preparing photo…" : sourceUrl ? "Choose another photo" : "Choose photo"} <span>↗</span>
        </button>
        {error && <div className="errorBox"><strong>Passport maker</strong><span>{error}</span></div>}
        {releaseNotice && !sourceUrl && <div className="passportMemoryNotice"><strong>Privacy cleanup complete</strong><span>{releaseNotice}</span></div>}
      </div>

      {sourceUrl && <>
        <div className="passportWorkspace">
          <section className="passportPanel">
            <span className="toolKicker">1 · Printed photo size</span>
            <div className="measurementRow">
              <label>Width<input type="number" min="0.1" step="0.1" value={photoWidth} onChange={(e) => setPhotoWidth(Math.max(.1, Number(e.target.value) || .1))}/></label>
              <label>Height<input type="number" min="0.1" step="0.1" value={photoHeight} onChange={(e) => setPhotoHeight(Math.max(.1, Number(e.target.value) || .1))}/></label>
              <label>Unit<select value={unit} onChange={(e) => setUnit(e.target.value as Unit)}><option value="cm">cm</option><option value="mm">mm</option><option value="in">inch</option></select></label>
            </div>
            <p className="panelHint">These are physical dimensions after printing, not CSS or screen dimensions.</p>
            <div className="dpiButtons">
              <button className={dpi === 300 ? "active" : ""} onClick={() => setDpi(300)}>300 DPI · Recommended</button>
              <button className={dpi === 600 ? "active" : ""} onClick={() => setDpi(600)}>600 DPI · If memory allows</button>
            </div>
            {exportDpi < dpi && <p className="memoryGuard">Memory guard active: this paper size will export at {exportDpi} DPI instead of {dpi} DPI to avoid an oversized browser canvas.</p>}
          </section>

          <section className="passportPanel portraitPanel">
            <span className="toolKicker">2 · Frame the person</span>
            <div className="portraitEditor"><canvas ref={portraitCanvasRef} onPointerDown={onPortraitDown} onPointerMove={onPortraitMove} onPointerUp={onPortraitUp} onPointerCancel={onPortraitUp} onWheel={onPortraitWheel}/></div>
            <p className="panelHint">Drag to reposition. Scroll over the photo or use the slider to resize the person inside the frame.</p>
            <label className="zoomControl">Zoom <input type="range" min="1" max="3" step="0.01" value={zoom} onChange={(e) => setZoom(Number(e.target.value))}/><span>{zoom.toFixed(2)}×</span></label>
            <label className="colorControl">Photo background only <input type="color" value={background} onChange={(e) => setBackground(e.target.value)}/><span>{background.toUpperCase()}</span></label>
            <p className="panelHint">The selected color is painted behind each passport photo only. The paper itself always stays white.</p>
            {sourceMode === "remove" && <p className="cutoutVerified">✓ Cutout verified · visible foreground {(foregroundCoverage * 100).toFixed(foregroundCoverage < .1 ? 1 : 0)}%</p>}
          </section>

          <section className="passportPanel">
            <span className="toolKicker">3 · Sheet</span>
            <label>Paper<select value={paperPreset} onChange={(e) => setPaperPreset(e.target.value as PaperPreset)}><option value="a4">{presets.a4.label}</option><option value="4x6">{presets["4x6"].label}</option><option value="letter">{presets.letter.label}</option><option value="custom">Custom paper</option></select></label>
            {paperPreset === "custom" && <div className="measurementRow two"><label>Width mm<input type="number" min="20" value={customPaperWidthMm} onChange={(e) => setCustomPaperWidthMm(Math.max(20, Number(e.target.value) || 20))}/></label><label>Height mm<input type="number" min="20" value={customPaperHeightMm} onChange={(e) => setCustomPaperHeightMm(Math.max(20, Number(e.target.value) || 20))}/></label></div>}
            <div className="measurementRow three"><label>Copies<input type="number" min="1" max="200" value={copies} onChange={(e) => setCopies(clamp(Number(e.target.value) || 1, 1, 200))}/></label><label>Margin mm<input type="number" min="0" step="0.5" value={marginMm} onChange={(e) => setMarginMm(Math.max(0, Number(e.target.value) || 0))}/></label><label>Gap mm<input type="number" min="0" step="0.5" value={gapMm} onChange={(e) => setGapMm(Math.max(0, Number(e.target.value) || 0))}/></label></div>
            <p className="panelHint">Current automatic capacity: {maxCopies} copies. If you request more than fit, only copies inside the sheet are exported.</p>
            <div className="dpiButtons"><button className={layoutMode === "auto" ? "active" : ""} onClick={() => { setLayoutMode("auto"); setPositions(autoPositions); }}>Auto grid</button><button className={layoutMode === "manual" ? "active" : ""} onClick={() => { setLayoutMode("manual"); setPositions(autoPositions); }}>Manual placement</button></div>
          </section>
        </div>

        <section className="sheetSection">
          <div className="sheetHeading">
            <div><span className="toolKicker">4 · Print preview</span><h2>{positions.length} photos on {paperPreset === "custom" ? "custom paper" : presets[paperPreset].label}</h2><p>{layoutMode === "manual" ? "Drag any numbered photo to relocate it on the sheet." : "Switch to Manual placement if you want to relocate individual photos with the cursor."}</p></div>
            <div className="sheetMeta"><b>{mmToPx(paper.widthMm, exportDpi)} × {mmToPx(paper.heightMm, exportDpi)} px</b><span>{exportDpi} DPI export</span></div>
          </div>
          <div className="sheetCanvasShell"><canvas ref={sheetCanvasRef} onPointerDown={onSheetDown} onPointerMove={onSheetMove} onPointerUp={onSheetUp} onPointerCancel={onSheetUp}/></div>
          <div className="sheetActions"><button className="secondaryButton" onClick={() => void printSheet()}>Print sheet</button><button className="primaryButton" onClick={() => void downloadSheet()}>Download PNG & clear working photo <span>↓</span></button></div>
          <p className="sheetPrivacyNote">After the browser download starts, FlytheBG releases the working source, cutout, previews, and generated sheet from this tab memory. The downloaded file on your device is not deleted.</p>
        </section>
      </>}
    </div>
  );
}
