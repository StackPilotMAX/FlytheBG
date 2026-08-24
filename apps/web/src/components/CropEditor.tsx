"use client";

import { PointerEvent, useEffect, useMemo, useRef, useState } from "react";

type CropRect = { x: number; y: number; width: number; height: number };
type CropMode = "free" | "ratio" | "pixels";
type DragState =
  | { kind: "create"; start: { x: number; y: number } }
  | { kind: "move"; offsetX: number; offsetY: number };

const RATIOS = [
  { label: "1:1", value: 1 },
  { label: "4:5", value: 4 / 5 },
  { label: "3:2", value: 3 / 2 },
  { label: "16:9", value: 16 / 9 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizedRect(a: { x: number; y: number }, b: { x: number; y: number }, ratio?: number): CropRect {
  let x1 = Math.min(a.x, b.x);
  let y1 = Math.min(a.y, b.y);
  let width = Math.abs(b.x - a.x);
  let height = Math.abs(b.y - a.y);
  if (ratio && width > 0 && height > 0) {
    if (width / height > ratio) width = height * ratio;
    else height = width / ratio;
    x1 = b.x >= a.x ? a.x : a.x - width;
    y1 = b.y >= a.y ? a.y : a.y - height;
  }
  return { x: x1, y: y1, width, height };
}

function pointInsideRect(point: { x: number; y: number }, rect: CropRect) {
  return point.x >= rect.x && point.x <= rect.x + rect.width && point.y >= rect.y && point.y <= rect.y + rect.height;
}

export function CropEditor({
  sourceBlob,
  fileName,
  label,
  onClose,
}: {
  sourceBlob: Blob;
  fileName: string;
  label: string;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1, height: 1 });
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 1, height: 1 });
  const [mode, setMode] = useState<CropMode>("free");
  const [ratio, setRatio] = useState(1);
  const [loadError, setLoadError] = useState("");
  const [movingSelection, setMovingSelection] = useState(false);

  useEffect(() => {
    const sourceUrl = URL.createObjectURL(sourceBlob);
    const image = new Image();
    setLoadError("");
    image.onload = () => {
      imageRef.current = image;
      const next = { width: image.naturalWidth || image.width, height: image.naturalHeight || image.height };
      if (!next.width || !next.height) {
        setLoadError("The selected result has invalid image dimensions.");
        return;
      }
      setDimensions(next);
      setCrop({ x: 0, y: 0, width: next.width, height: next.height });
    };
    image.onerror = () => setLoadError("The selected result could not be decoded for cropping.");
    image.src = sourceUrl;
    return () => {
      imageRef.current = null;
      URL.revokeObjectURL(sourceUrl);
    };
  }, [sourceBlob]);

  const previewSize = useMemo(() => {
    const maxWidth = 900;
    const scale = Math.min(1, maxWidth / Math.max(1, dimensions.width));
    return {
      width: Math.max(1, Math.round(dimensions.width * scale)),
      height: Math.max(1, Math.round(dimensions.height * scale)),
    };
  }, [dimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const image = imageRef.current;
    if (!canvas || !image || loadError) return;

    canvas.width = previewSize.width;
    canvas.height = previewSize.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    const sx = canvas.width / dimensions.width;
    const sy = canvas.height / dimensions.height;
    const x = crop.x * sx;
    const y = crop.y * sy;
    const width = crop.width * sx;
    const height = crop.height * sy;

    ctx.save();
    ctx.fillStyle = "rgba(5, 7, 11, .54)";
    ctx.fillRect(0, 0, canvas.width, y);
    ctx.fillRect(0, y + height, canvas.width, Math.max(0, canvas.height - y - height));
    ctx.fillRect(0, y, x, height);
    ctx.fillRect(x + width, y, Math.max(0, canvas.width - x - width), height);

    ctx.shadowColor = "rgba(116, 216, 255, .35)";
    ctx.shadowBlur = 14;
    ctx.strokeStyle = "#74d8ff";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, Math.max(0, width - 2), Math.max(0, height - 2));
    ctx.shadowBlur = 0;

    if (width > 20 && height > 20) {
      ctx.setLineDash([6, 5]);
      ctx.strokeStyle = "rgba(255,255,255,.58)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + width / 3, y);
      ctx.lineTo(x + width / 3, y + height);
      ctx.moveTo(x + (width * 2) / 3, y);
      ctx.lineTo(x + (width * 2) / 3, y + height);
      ctx.moveTo(x, y + height / 3);
      ctx.lineTo(x + width, y + height / 3);
      ctx.moveTo(x, y + (height * 2) / 3);
      ctx.lineTo(x + width, y + (height * 2) / 3);
      ctx.stroke();
    }

    ctx.restore();
  }, [crop, dimensions, previewSize, loadError]);

  function pointerToImage(event: PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const px = (event.clientX - rect.left) / Math.max(rect.width, 1);
    const py = (event.clientY - rect.top) / Math.max(rect.height, 1);
    return {
      x: clamp(px * dimensions.width, 0, dimensions.width),
      y: clamp(py * dimensions.height, 0, dimensions.height),
    };
  }

  function onPointerDown(event: PointerEvent<HTMLCanvasElement>) {
    if (loadError) return;
    const point = pointerToImage(event);
    event.currentTarget.setPointerCapture(event.pointerId);

    if (crop.width > 1 && crop.height > 1 && pointInsideRect(point, crop)) {
      dragRef.current = {
        kind: "move",
        offsetX: point.x - crop.x,
        offsetY: point.y - crop.y,
      };
      setMovingSelection(true);
      return;
    }

    dragRef.current = { kind: "create", start: point };
    setMovingSelection(false);
    setMode(mode === "pixels" ? "free" : mode);
  }

  function onPointerMove(event: PointerEvent<HTMLCanvasElement>) {
    const drag = dragRef.current;
    if (!drag) return;
    const point = pointerToImage(event);

    if (drag.kind === "move") {
      setCrop((current) => ({
        ...current,
        x: clamp(point.x - drag.offsetX, 0, Math.max(0, dimensions.width - current.width)),
        y: clamp(point.y - drag.offsetY, 0, Math.max(0, dimensions.height - current.height)),
      }));
      return;
    }

    let next = normalizedRect(drag.start, point, mode === "ratio" ? ratio : undefined);
    next = {
      x: clamp(next.x, 0, dimensions.width - 1),
      y: clamp(next.y, 0, dimensions.height - 1),
      width: clamp(next.width, 1, dimensions.width),
      height: clamp(next.height, 1, dimensions.height),
    };
    if (next.x + next.width > dimensions.width) next.width = dimensions.width - next.x;
    if (next.y + next.height > dimensions.height) next.height = dimensions.height - next.y;
    setCrop(next);
  }

  function onPointerUp(event: PointerEvent<HTMLCanvasElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    setMovingSelection(false);
  }

  function applyRatio(nextRatio: number) {
    setMode("ratio");
    setRatio(nextRatio);
    let width = dimensions.width;
    let height = width / nextRatio;
    if (height > dimensions.height) {
      height = dimensions.height;
      width = height * nextRatio;
    }
    setCrop({
      x: Math.round((dimensions.width - width) / 2),
      y: Math.round((dimensions.height - height) / 2),
      width: Math.round(width),
      height: Math.round(height),
    });
  }

  function updatePixel(key: keyof CropRect, raw: number) {
    setMode("pixels");
    setCrop((current) => {
      const next = { ...current, [key]: Number.isFinite(raw) ? Math.round(raw) : 0 };
      next.x = clamp(next.x, 0, Math.max(0, dimensions.width - 1));
      next.y = clamp(next.y, 0, Math.max(0, dimensions.height - 1));
      next.width = clamp(next.width, 1, Math.max(1, dimensions.width - next.x));
      next.height = clamp(next.height, 1, Math.max(1, dimensions.height - next.y));
      return next;
    });
  }

  async function downloadCrop() {
    const image = imageRef.current;
    if (!image || loadError) return;
    const x = Math.round(clamp(crop.x, 0, dimensions.width - 1));
    const y = Math.round(clamp(crop.y, 0, dimensions.height - 1));
    const width = Math.round(clamp(crop.width, 1, dimensions.width - x));
    const height = Math.round(clamp(crop.height, 1, dimensions.height - y));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(image, x, y, width, height, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const base = fileName.replace(/\.[^.]+$/, "") || "image";
    link.href = href;
    link.download = `${base}-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-crop-${width}x${height}.png`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(href), 1500);
  }

  return (
    <div className="cropEditor" aria-label={`Crop ${label} result`}>
      <div className="cropHeader">
        <div>
          <span className="toolKicker">Crop editor</span>
          <h3>{label}</h3>
          <p className="cropHint">Drag inside the selected area to move it. Drag outside to create a new selection.</p>
        </div>
        <button className="textButton" type="button" onClick={onClose}>Close</button>
      </div>

      {loadError ? (
        <div className="modelError"><div><strong>Crop preview unavailable</strong><span>{loadError}</span></div></div>
      ) : (
        <div className="cropCanvasWrap">
          <canvas
            ref={canvasRef}
            className={`cropCanvas${movingSelection ? " isMoving" : ""}`}
            aria-label="Crop preview"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        </div>
      )}

      <div className="cropControls">
        <div className="cropControlGroup">
          <span className="controlLabel">By cursor</span>
          <button className={`miniButton ${mode === "free" ? "active" : ""}`} type="button" onClick={() => setMode("free")}>Free drag</button>
          <p>Draw a new area outside the current selection, or drag inside it to reposition.</p>
        </div>
        <div className="cropControlGroup">
          <span className="controlLabel">By ratio</span>
          <div className="ratioButtons">{RATIOS.map((item) => (
            <button key={item.label} className={`miniButton ${mode === "ratio" && ratio === item.value ? "active" : ""}`} type="button" onClick={() => applyRatio(item.value)}>{item.label}</button>
          ))}</div>
        </div>
        <div className="cropControlGroup pixelGroup">
          <span className="controlLabel">By pixels</span>
          <div className="pixelInputs">
            <label>X<input type="number" min={0} max={dimensions.width - 1} value={Math.round(crop.x)} onChange={(e) => updatePixel("x", Number(e.target.value))} /></label>
            <label>Y<input type="number" min={0} max={dimensions.height - 1} value={Math.round(crop.y)} onChange={(e) => updatePixel("y", Number(e.target.value))} /></label>
            <label>W<input type="number" min={1} max={dimensions.width} value={Math.round(crop.width)} onChange={(e) => updatePixel("width", Number(e.target.value))} /></label>
            <label>H<input type="number" min={1} max={dimensions.height} value={Math.round(crop.height)} onChange={(e) => updatePixel("height", Number(e.target.value))} /></label>
          </div>
        </div>
      </div>

      <div className="cropFooter">
        <span>{Math.round(crop.width)} × {Math.round(crop.height)} px</span>
        <button className="primaryButton" type="button" disabled={Boolean(loadError)} onClick={() => void downloadCrop()}>Download cropped PNG <span>↓</span></button>
      </div>
    </div>
  );
}
