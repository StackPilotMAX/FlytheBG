"use client";

import { ChangeEvent, DragEvent, PointerEvent, useEffect, useId, useMemo, useRef, useState } from "react";
import { removeBackgroundWithFallback } from "@/lib/browser-background-removal";
import { validateUploadBasics } from "@/lib/image-validation";

type Unit = "cm" | "mm" | "in";
type SourceMode = "remove" | "direct";
type PaperPreset = "a4" | "4x6" | "letter" | "custom";
type Position = { xMm: number; yMm: number };
type PreparedPhoto = { url: string; width: number; height: number; label: string };
type Frame = { zoom: number; shiftX: number; shiftY: number };
type DragState = { mode: "master"; x: number; y: number; shiftX: number; shiftY: number };

const MAX_MB = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_MB || "12") || 12;
const MAX_EXPORT_PIXELS = 20_000_000;
const MAX_EXPORT_EDGE = 7000;
const unitToMm: Record<Unit, number> = { cm: 10, mm: 1, in: 25.4 };
const paperPresets: Record<Exclude<PaperPreset, "custom">, { widthMm: number; heightMm: number; label: string }> = {
  a4: { widthMm: 210, heightMm: 297, label: "A4 · 210 × 297 mm" },
  "4x6": { widthMm: 101.6, heightMm: 152.4, label: "4 × 6 inch photo paper" },
  letter: { widthMm: 215.9, heightMm: 279.4, label: "US Letter · 8.5 × 11 inch" },
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
      image.onerror = () => reject(new Error(`${label} could not be decoded by this browser.`));
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

function buildLayout(pageWidthMm: number, pageHeightMm: number, photoWidthMm: number, photoHeightMm: number, marginMm: number, gapMm: number, copies: number): Position[] {
  const usableWidth = pageWidthMm - marginMm * 2;
  const usableHeight = pageHeightMm - marginMm * 2;
  if (photoWidthMm <= 0 || photoHeightMm <= 0 || usableWidth < photoWidthMm || usableHeight < photoHeightMm) return [];
  const columns = Math.max(1, Math.floor((usableWidth + gapMm) / (photoWidthMm + gapMm)));
  const rows = Math.max(1, Math.floor((usableHeight + gapMm) / (photoHeightMm + gapMm)));
  const total = Math.min(copies, columns * rows);
  return Array.from({ length: total }, (_, index) => ({
    xMm: marginMm + (index % columns) * (photoWidthMm + gapMm),
    yMm: marginMm + Math.floor(index / columns) * (photoHeightMm + gapMm),
  }));
}

/**
 * Frame semantics: shiftX/shiftY move the crop frame over a stationary photo.
 * The inverse sign when drawing is intentional: moving the frame right means
 * the fixed output viewport samples farther right from the source image.
 */
function drawCell(ctx: CanvasRenderingContext2D, image: HTMLImageElement, x: number, y: number, width: number, height: number, frame: Frame, background: string) {
  if (!image.naturalWidth || !image.naturalHeight || width <= 0 || height <= 0) return;
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = background;
  ctx.fillRect(x, y, width, height);
  ctx.beginPath();
  ctx.rect(x, y, width, height);
  ctx.clip();

  const cover = Math.max(width / image.naturalWidth, height / image.naturalHeight) * frame.zoom;
  const drawWidth = image.naturalWidth * cover;
  const drawHeight = image.naturalHeight * cover;
  const dx = x + (width - drawWidth) / 2 - frame.shiftX * Math.max(0, drawWidth - width) * .5;
  const dy = y + (height - drawHeight) / 2 - frame.shiftY * Math.max(0, drawHeight - height) * .5;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(image, dx, dy, drawWidth, drawHeight);
  ctx.restore();
}

export function PassportPhotoMaker() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const sourceImageRef = useRef<HTMLImageElement | null>(null);
  const cropPreviewCanvasRef = useRef<HTMLCanvasElement>(null);
  const sheetCanvasRef = useRef<HTMLCanvasElement>(null);
  const frameStageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  const [sourceMode, setSourceMode] = useState<SourceMode>("remove");
  const [source, setSource] = useState<PreparedPhoto | null>(null);
  const [fileName, setFileName] = useState("");
  const [processing, setProcessing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [cleanup, setCleanup] = useState("");
  const [exportNotice, setExportNotice] = useState("");

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
  const [selectedCopy, setSelectedCopy] = useState(0);
  const [individualFrames, setIndividualFrames] = useState<Record<number, Frame>>({});

  const photoWidthMm = Math.max(1, photoWidth * unitToMm[unit]);
  const photoHeightMm = Math.max(1, photoHeight * unitToMm[unit]);
  const paper = paperPreset === "custom" ? { widthMm: customWidthMm, heightMm: customHeightMm } : paperPresets[paperPreset];
  const exportDpi = safeDpi(paper.widthMm, paper.heightMm, dpi);
  const capacity = useMemo(() => buildLayout(paper.widthMm, paper.heightMm, photoWidthMm, photoHeightMm, marginMm, gapMm, 200).length, [paper.widthMm, paper.heightMm, photoWidthMm, photoHeightMm, marginMm, gapMm]);
  const positions = useMemo(() => buildLayout(paper.widthMm, paper.heightMm, photoWidthMm, photoHeightMm, marginMm, gapMm, Math.min(copies, Math.max(1, capacity))), [paper.widthMm, paper.heightMm, photoWidthMm, photoHeightMm, marginMm, gapMm, copies, capacity]);
  const masterFrame: Frame = { zoom, shiftX, shiftY };
  const frameWidthPercent = clamp(69 / Math.sqrt(zoom), 38, 72);
  const frameLeftPercent = 50 + shiftX * 12;
  const frameTopPercent = 50 + shiftY * 12;

  function frameFor(index: number): Frame {
    return individualFrames[index] ?? masterFrame;
  }

  useEffect(() => {
    if (capacity > 0 && copies > capacity) setCopies(capacity);
  }, [capacity, copies]);

  useEffect(() => {
    setSelectedCopy((current) => Math.min(current, Math.max(0, positions.length - 1)));
    setIndividualFrames((current) => {
      let changed = false;
      const next: Record<number, Frame> = {};
      Object.entries(current).forEach(([key, value]) => {
        const index = Number(key);
        if (index < positions.length) next[index] = value;
        else changed = true;
      });
      return changed ? next : current;
    });
  }, [positions.length]);

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
      window.requestAnimationFrame(drawPreviews);
    };
    image.onerror = () => {
      if (!active) return;
      sourceImageRef.current = null;
      setError("The prepared photo could not be loaded. Choose the image again.");
    };
    image.src = source.url;
    return () => { active = false; image.src = ""; sourceImageRef.current = null; };
  }, [source?.url]);

  useEffect(() => {
    drawPreviews();
  }, [photoWidthMm, photoHeightMm, paper.widthMm, paper.heightMm, positions, zoom, shiftX, shiftY, background, individualFrames, selectedCopy]);

  function releaseWorkingPhoto(notice = "Working image cleared from this tab.") {
    if (source) URL.revokeObjectURL(source.url);
    setSource(null);
    setFileName("");
    sourceImageRef.current = null;
    setProgress("");
    setError("");
    setExportNotice("");
    setZoom(1.05);
    setShiftX(0);
    setShiftY(0);
    setSelectedCopy(0);
    setIndividualFrames({});
    if (cropPreviewCanvasRef.current) { cropPreviewCanvasRef.current.width = 1; cropPreviewCanvasRef.current.height = 1; }
    if (sheetCanvasRef.current) { sheetCanvasRef.current.width = 1; sheetCanvasRef.current.height = 1; }
    if (inputRef.current) inputRef.current.value = "";
    setCleanup(notice);
  }

  function changeMode(mode: SourceMode) {
    if (mode === sourceMode) return;
    if (source) releaseWorkingPhoto("Photo cleared because the source mode changed.");
    setSourceMode(mode);
    setError("");
  }

  function setPhotoPreset(width: number, height: number, nextUnit: Unit) {
    setUnit(nextUnit);
    setPhotoWidth(width);
    setPhotoHeight(height);
    setIndividualFrames({});
    setSelectedCopy(0);
  }

  function drawPreviews() {
    const image = sourceImageRef.current;
    const cropPreview = cropPreviewCanvasRef.current;
    const sheet = sheetCanvasRef.current;
    if (!image || !cropPreview || !sheet || !image.naturalWidth || !image.naturalHeight) return;

    cropPreview.width = 300;
    cropPreview.height = Math.min(440, Math.max(220, Math.round(300 * photoHeightMm / photoWidthMm)));
    const cropCtx = cropPreview.getContext("2d");
    if (cropCtx) {
      cropCtx.clearRect(0, 0, cropPreview.width, cropPreview.height);
      drawCell(cropCtx, image, 0, 0, cropPreview.width, cropPreview.height, masterFrame, background);
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
    positions.forEach((position, index) => {
      const x = position.xMm * sx;
      const y = position.yMm * sy;
      const width = photoWidthMm * sx;
      const height = photoHeightMm * sy;
      drawCell(ctx, image, x, y, width, height, frameFor(index), background);
      ctx.strokeStyle = index === selectedCopy ? "#8a70dd" : "rgba(88,66,112,.24)";
      ctx.lineWidth = index === selectedCopy ? 3 : 1;
      ctx.strokeRect(x + .5, y + .5, Math.max(0, width - 1), Math.max(0, height - 1));
      if (index === selectedCopy) {
        ctx.fillStyle = "#8a70dd";
        ctx.font = "700 11px system-ui";
        ctx.fillText(`Photo ${index + 1}`, x + 5, Math.max(12, y - 5));
      }
    });
  }

  async function handleFile(file: File) {
    if (processing) return;
    const problem = validateUploadBasics(file, MAX_MB);
    if (problem) { setError(problem); return; }

    setProcessing(true);
    setError("");
    setCleanup("");
    setExportNotice("");
    setProgress(sourceMode === "remove" ? "Starting local background removal…" : "Preparing photo in this browser…");
    try {
      if (source) URL.revokeObjectURL(source.url);
      const prepared = sourceMode === "remove"
        ? await removeBackgroundWithFallback(file, setProgress).then((result) => preparePhoto(result.blob, `IMG.LY ${result.modelLabel} cutout`))
        : await preparePhoto(file, "Original photo");
      setSource(prepared);
      setFileName(file.name);
      setZoom(1.05);
      setShiftX(0);
      setShiftY(0);
      setIndividualFrames({});
      setSelectedCopy(0);
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

  function onDrop(event: DragEvent<HTMLElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) void handleFile(file);
  }

  function onMasterFramePointerDown(event: PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { mode: "master", x: event.clientX, y: event.clientY, shiftX, shiftY };
  }

  function onMasterFramePointerMove(event: PointerEvent<HTMLDivElement>) {
    const start = dragRef.current;
    if (!start || start.mode !== "master") return;
    const rect = frameStageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setShiftX(clamp(start.shiftX + (event.clientX - start.x) / Math.max(1, rect.width) * 3, -1, 1));
    setShiftY(clamp(start.shiftY + (event.clientY - start.y) / Math.max(1, rect.height) * 3, -1, 1));
  }

  function onMasterFramePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
  }

  function findSheetCopy(event: PointerEvent<HTMLCanvasElement>) {
    const sheet = sheetCanvasRef.current;
    if (!sheet || !positions.length) return -1;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) * sheet.width / Math.max(1, rect.width);
    const py = (event.clientY - rect.top) * sheet.height / Math.max(1, rect.height);
    const sx = sheet.width / paper.widthMm;
    const sy = sheet.height / paper.heightMm;
    return positions.findIndex((position) => {
      const x = position.xMm * sx;
      const y = position.yMm * sy;
      return px >= x && px <= x + photoWidthMm * sx && py >= y && py <= y + photoHeightMm * sy;
    });
  }

  function onSheetPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    const index = findSheetCopy(event);
    if (index >= 0) setSelectedCopy(index);
  }

  function nudgeMasterFrame(dx: number, dy: number) {
    setShiftX((current) => clamp(current + dx, -1, 1));
    setShiftY((current) => clamp(current + dy, -1, 1));
  }

  function centerMasterFrame() {
    setShiftX(0);
    setShiftY(0);
  }

  function resetMasterFrame() {
    setZoom(1.05);
    setShiftX(0);
    setShiftY(0);
    setIndividualFrames({});
  }

  function resetSelectedCopy() {
    setIndividualFrames((current) => {
      const next = { ...current };
      delete next[selectedCopy];
      return next;
    });
  }

  function useMasterForSelected() {
    setIndividualFrames((current) => ({ ...current, [selectedCopy]: { ...masterFrame } }));
  }

  function updateSelectedFrame(patch: Partial<Frame>) {
    if (!positions.length) return;
    setIndividualFrames((current) => {
      const base = current[selectedCopy] ?? masterFrame;
      return { ...current, [selectedCopy]: { ...base, ...patch } };
    });
  }

  function nudgeSelectedFrame(dx: number, dy: number) {
    const base = frameFor(selectedCopy);
    updateSelectedFrame({ shiftX: clamp(base.shiftX + dx, -1, 1), shiftY: clamp(base.shiftY + dy, -1, 1) });
  }

  async function createSheetBlob() {
    const image = sourceImageRef.current;
    if (!image) throw new Error("The working photo is not ready yet.");
    if (!positions.length) throw new Error("No photos fit on the selected paper. Reduce the photo size or margins.");

    const canvas = document.createElement("canvas");
    canvas.width = mmToPx(paper.widthMm, exportDpi);
    canvas.height = mmToPx(paper.heightMm, exportDpi);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot create the print sheet.");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    positions.forEach((position, index) => drawCell(
      ctx,
      image,
      mmToPx(position.xMm, exportDpi),
      mmToPx(position.yMm, exportDpi),
      mmToPx(photoWidthMm, exportDpi),
      mmToPx(photoHeightMm, exportDpi),
      frameFor(index),
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
    setExportNotice("");
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
      window.setTimeout(() => URL.revokeObjectURL(href), 1200);
      setExportNotice("PNG downloaded. Your crop-frame adjustments remain available so you can keep editing or print next.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Export failed.");
    }
  }

  async function printSheet() {
    const popup = window.open("", "_blank", "noopener,noreferrer");
    if (!popup) {
      setError("Allow pop-ups for FlytheBG to open the print dialog.");
      return;
    }
    popup.document.write("<p style='font:16px system-ui;padding:24px'>Preparing print sheet…</p>");
    try {
      const blob = await createSheetBlob();
      const href = URL.createObjectURL(blob);
      popup.document.open();
      popup.document.write(`<!doctype html><html><head><title>FlytheBG Passport Print</title><style>@page{size:${paper.widthMm}mm ${paper.heightMm}mm;margin:0}html,body{margin:0;background:#fff}img{display:block;width:${paper.widthMm}mm;height:${paper.heightMm}mm}</style></head><body><img src="${href}" onload="setTimeout(()=>window.print(),250)" /></body></html>`);
      popup.document.close();
      setExportNotice("Print dialog opened. Use Actual Size / 100% and disable Fit to Page.");
      window.setTimeout(() => URL.revokeObjectURL(href), 60_000);
    } catch (reason) {
      popup.close();
      setError(reason instanceof Error ? reason.message : "Print preparation failed.");
    }
  }

  const selectedFrame = positions.length ? frameFor(selectedCopy) : masterFrame;

  return (
    <div className="passportMaker">
      <section className="passportIntroCard">
        <div><span className="eyebrow"><i/> Passport Photo Maker</span><h1>One photo. Exact size. Move the crop frame.</h1><p>The source photo stays still. Position a movable passport crop frame over the photo, adjust the crop size, then build a print-ready sheet.</p></div>
        <div className="passportStats"><span><strong>300 DPI</strong><small>safe default</small></span><span><strong>Movable frame</strong><small>photo stays stationary</small></span><span><strong>0</strong><small>image DB uploads</small></span></div>
      </section>

      <section className="passportUploadCard">
        <div className="modeTabs" role="group" aria-label="Photo preparation mode">
          <button className={sourceMode === "remove" ? "active" : ""} type="button" onClick={() => changeMode("remove")}><span>01</span><strong>Remove background</strong><small>Local browser AI</small></button>
          <button className={sourceMode === "direct" ? "active" : ""} type="button" onClick={() => changeMode("direct")}><span>02</span><strong>Keep original</strong><small>Skip AI and build the sheet</small></button>
        </div>

        <input ref={inputRef} id={inputId} className="srOnly" type="file" accept="image/*" onChange={onInput} disabled={processing}/>
        <label htmlFor={inputId} className={`passportDropZone ${dragging ? "dragging" : ""} ${processing ? "busy" : ""}`} onDragEnter={(event) => { event.preventDefault(); if (!processing) setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={onDrop}>
          {processing ? <><span className="spinner"/><strong>Preparing photo…</strong><p>{progress}</p></> : <><span className="uploadGlyph">↑</span><strong>{source ? "Choose another image" : "Choose an image"}</strong><p>Click or drag & drop · browser-decodable raster images · up to {MAX_MB} MB</p></>}
        </label>
        {error && <div className="errorNotice"><div><strong>Passport Photo Maker</strong><p>{error}</p></div></div>}
        {cleanup && !source && <div className="successNotice"><strong>Working image cleared.</strong><span>{cleanup}</span></div>}
      </section>

      {source && <>
        <div className="workingImageBar"><span><small>Working image</small><strong>{source.label}</strong></span><span><small>Source size</small><strong>{source.width} × {source.height}px</strong></span><span><small>Privacy</small><strong>Browser-only flow</strong></span></div>

        <div className="passportSteps">
          <section className="passportPanel">
            <div className="panelHeading"><span className="stepNumber">1</span><div><h2>Printed photo size</h2><p>Choose the physical dimensions of the crop frame and final printed passport photo.</p></div></div>
            <div className="presetButtons"><button type="button" onClick={() => setPhotoPreset(3.5, 4.5, "cm")}>35 × 45 mm</button><button type="button" onClick={() => setPhotoPreset(2, 2, "in")}>2 × 2 inch</button></div>
            <div className="formGrid three"><label>Width<input type="number" min="0.1" step="0.1" value={photoWidth} onChange={(event) => { setPhotoWidth(Math.max(.1, Number(event.target.value) || .1)); setIndividualFrames({}); }}/></label><label>Height<input type="number" min="0.1" step="0.1" value={photoHeight} onChange={(event) => { setPhotoHeight(Math.max(.1, Number(event.target.value) || .1)); setIndividualFrames({}); }}/></label><label>Unit<select value={unit} onChange={(event) => { setUnit(event.target.value as Unit); setIndividualFrames({}); }}><option value="cm">cm</option><option value="mm">mm</option><option value="in">inch</option></select></label></div>
            <div className="segmented"><button className={dpi === 300 ? "active" : ""} type="button" onClick={() => setDpi(300)}>300 DPI</button><button className={dpi === 600 ? "active" : ""} type="button" onClick={() => setDpi(600)}>600 DPI</button></div>
            {exportDpi < dpi && <p className="warningText">Memory guard: this sheet exports at {exportDpi} DPI to prevent an oversized browser canvas.</p>}
          </section>

          <section className="passportPanel framePositionPanel">
            <div className="panelHeading"><span className="stepNumber">2</span><div><h2>Move the frame over the photo</h2><p>The photo stays stationary. Drag the outlined crop frame, use the arrow pad, or adjust the frame X/Y sliders.</p></div></div>
            <div className="movableFrameNote"><strong>Movable crop frame</strong><span>{photoWidthMm.toFixed(1)} × {photoHeightMm.toFixed(1)} mm output ratio · the source photo does not move</span></div>

            <div className="frameWorkspace">
              <div ref={frameStageRef} className="framePhotoStage" style={{ aspectRatio: `${source.width} / ${source.height}` }}>
                <img src={source.url} alt="Stationary source for passport crop" draggable={false}/>
                <div
                  className="movableCropFrame"
                  role="slider"
                  tabIndex={0}
                  aria-label="Movable passport crop frame"
                  aria-valuetext={`Frame ${Math.round(shiftX * 100)} percent horizontal, ${Math.round(shiftY * 100)} percent vertical, ${zoom.toFixed(2)} crop zoom`}
                  style={{ left: `${frameLeftPercent}%`, top: `${frameTopPercent}%`, width: `${frameWidthPercent}%`, aspectRatio: `${photoWidthMm} / ${photoHeightMm}` }}
                  onPointerDown={onMasterFramePointerDown}
                  onPointerMove={onMasterFramePointerMove}
                  onPointerUp={onMasterFramePointerUp}
                  onPointerCancel={onMasterFramePointerUp}
                ><span>Crop frame</span></div>
              </div>
              <div className="cropResultPreview"><span>Crop result preview</span><canvas ref={cropPreviewCanvasRef}/></div>
            </div>

            <div className="frameManualControls" aria-label="Manual crop frame controls">
              <div className="frameMoveBlock">
                <span className="manualControlLabel">Move frame</span>
                <div className="frameMovePad" role="group" aria-label="Move main passport crop frame">
                  <button type="button" aria-label="Move frame up" onClick={() => nudgeMasterFrame(0, -.08)}>↑</button>
                  <button type="button" aria-label="Move frame left" onClick={() => nudgeMasterFrame(-.08, 0)}>←</button>
                  <button type="button" className="frameCenterButton" aria-label="Center frame" onClick={centerMasterFrame}>●</button>
                  <button type="button" aria-label="Move frame right" onClick={() => nudgeMasterFrame(.08, 0)}>→</button>
                  <button type="button" aria-label="Move frame down" onClick={() => nudgeMasterFrame(0, .08)}>↓</button>
                </div>
              </div>

              <div className="framePositionSliders">
                <label className="frameSliderRow"><span>Frame left / right</span><input aria-label="Frame horizontal position" type="range" min="-1" max="1" step="0.01" value={shiftX} onChange={(event) => setShiftX(Number(event.target.value))}/><strong>{Math.round(shiftX * 100)}%</strong></label>
                <label className="frameSliderRow"><span>Frame up / down</span><input aria-label="Frame vertical position" type="range" min="-1" max="1" step="0.01" value={shiftY} onChange={(event) => setShiftY(Number(event.target.value))}/><strong>{Math.round(shiftY * 100)}%</strong></label>
                <label className="frameSliderRow"><span>Crop zoom / frame size</span><input aria-label="Crop frame zoom" type="range" min="1" max="3" step="0.01" value={zoom} onChange={(event) => setZoom(Number(event.target.value))}/><strong>{zoom.toFixed(2)}×</strong></label>
              </div>
            </div>

            <div className="frameControlActions"><button className="buttonSecondary small" type="button" onClick={centerMasterFrame}>Center frame</button><button className="buttonGhost small" type="button" onClick={resetMasterFrame}>Reset crop frame</button></div>
            <div className="inlineControl"><label>Photo background<input type="color" value={background} onChange={(event) => setBackground(event.target.value)}/></label><span>{background.toUpperCase()}</span></div>
            <p className="helperText">This crop frame becomes the default crop for every printed copy. The source photo itself stays stationary.</p>
          </section>

          <section className="passportPanel">
            <div className="panelHeading"><span className="stepNumber">3</span><div><h2>Build the sheet</h2><p>Set paper, copies, margins, and gap.</p></div></div>
            <label className="fieldFull">Paper<select value={paperPreset} onChange={(event) => { setPaperPreset(event.target.value as PaperPreset); setIndividualFrames({}); setSelectedCopy(0); }}><option value="a4">{paperPresets.a4.label}</option><option value="4x6">{paperPresets["4x6"].label}</option><option value="letter">{paperPresets.letter.label}</option><option value="custom">Custom paper</option></select></label>
            {paperPreset === "custom" && <div className="formGrid two"><label>Width mm<input type="number" min="20" value={customWidthMm} onChange={(event) => { setCustomWidthMm(Math.max(20, Number(event.target.value) || 20)); setIndividualFrames({}); }}/></label><label>Height mm<input type="number" min="20" value={customHeightMm} onChange={(event) => { setCustomHeightMm(Math.max(20, Number(event.target.value) || 20)); setIndividualFrames({}); }}/></label></div>}
            <div className="formGrid three"><label>Copies<input type="number" min="1" max={Math.max(1, capacity)} value={copies} onChange={(event) => setCopies(clamp(Number(event.target.value) || 1, 1, Math.max(1, capacity)))}/></label><label>Margin mm<input type="number" min="0" step="0.5" value={marginMm} onChange={(event) => { setMarginMm(Math.max(0, Number(event.target.value) || 0)); setIndividualFrames({}); }}/></label><label>Gap mm<input type="number" min="0" step="0.5" value={gapMm} onChange={(event) => { setGapMm(Math.max(0, Number(event.target.value) || 0)); setIndividualFrames({}); }}/></label></div>
            <div className="capacityBar"><span>Sheet capacity</span><strong>{capacity} photos</strong><button className="buttonSecondary small" type="button" disabled={capacity < 1} onClick={() => setCopies(capacity)}>Fill sheet</button></div>
            {capacity < 1 && <p className="warningText">No photo fits. Reduce photo dimensions or margins.</p>}
          </section>
        </div>

        <section className="sheetPreviewSection">
          <div className="sheetHeading"><div><span className="kicker">4 · Interactive print preview</span><h2>{positions.length} photos ready</h2><p>Click a copy to select it. You can then move that copy&apos;s crop frame with the controls below without moving the source photo.</p></div><div className="sheetMeta"><strong>{mmToPx(paper.widthMm, exportDpi)} × {mmToPx(paper.heightMm, exportDpi)} px</strong><span>{exportDpi} DPI PNG</span></div></div>

          <div className="perPhotoEditor" aria-live="polite">
            <div><span>Selected crop</span><strong>{positions.length ? `Photo ${selectedCopy + 1} of ${positions.length}` : "No photo"}</strong><small>{individualFrames[selectedCopy] ? "Custom crop frame" : "Using main crop frame"}</small></div>
            <div className="perPhotoNudges" aria-label="Move selected crop frame"><button type="button" aria-label="Move selected frame left" onClick={() => nudgeSelectedFrame(-.08, 0)}>←</button><button type="button" aria-label="Move selected frame up" onClick={() => nudgeSelectedFrame(0, -.08)}>↑</button><button type="button" aria-label="Move selected frame down" onClick={() => nudgeSelectedFrame(0, .08)}>↓</button><button type="button" aria-label="Move selected frame right" onClick={() => nudgeSelectedFrame(.08, 0)}>→</button></div>
            <div className="perPhotoActions"><button className="buttonGhost small" type="button" onClick={useMasterForSelected}>Use main crop frame</button><button className="buttonSecondary small" type="button" onClick={resetSelectedCopy}>Reset selected crop</button></div>
            <span className="perPhotoZoom">{selectedFrame.zoom.toFixed(2)}× crop zoom</span>
          </div>

          {positions.length > 0 && <div className="selectedFrameManual" aria-label="Selected crop frame controls">
            <label className="frameSliderRow"><span>Selected frame left / right</span><input aria-label="Selected frame horizontal position" type="range" min="-1" max="1" step="0.01" value={selectedFrame.shiftX} onChange={(event) => updateSelectedFrame({ shiftX: Number(event.target.value) })}/><strong>{Math.round(selectedFrame.shiftX * 100)}%</strong></label>
            <label className="frameSliderRow"><span>Selected frame up / down</span><input aria-label="Selected frame vertical position" type="range" min="-1" max="1" step="0.01" value={selectedFrame.shiftY} onChange={(event) => updateSelectedFrame({ shiftY: Number(event.target.value) })}/><strong>{Math.round(selectedFrame.shiftY * 100)}%</strong></label>
            <label className="frameSliderRow"><span>Selected crop zoom</span><input aria-label="Selected crop frame zoom" type="range" min="1" max="3" step="0.01" value={selectedFrame.zoom} onChange={(event) => updateSelectedFrame({ zoom: Number(event.target.value) })}/><strong>{selectedFrame.zoom.toFixed(2)}×</strong></label>
          </div>}

          <div className="sheetCanvasShell interactiveSheet"><canvas aria-label="Passport print sheet. Click a copy to select its crop frame." ref={sheetCanvasRef} onPointerDown={onSheetPointerDown}/></div>
          <div className="sheetActions"><button className="buttonSecondary" type="button" disabled={!positions.length} onClick={() => void printSheet()}>Print directly at 100%</button><button className="buttonPrimary" type="button" disabled={!positions.length} onClick={() => void downloadSheet()}>Download PNG <span>↓</span></button></div>
          {exportNotice && <div className="successNotice exportNotice"><strong>Ready.</strong><span>{exportNotice}</span></div>}
          <p className="helperText centered">Use Actual Size / 100% in the print dialog. Crop-frame positions and crop zoom are included in both Print and PNG export.</p>
        </section>
      </>}
    </div>
  );
}
