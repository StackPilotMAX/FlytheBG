"use client";

export type BrowserBackgroundModel = "isnet_quint8" | "isnet_fp16";
export type BrowserBackgroundResult = {
  blob: Blob;
  model: BrowserBackgroundModel;
  modelLabel: "quantized" | "FP16";
  edgeRefined: boolean;
};

type ProgressHandler = (message: string) => void;

type LoadedImage = {
  image: HTMLImageElement;
  url: string;
  width: number;
  height: number;
};

const MODEL_TIMEOUT_MS = 180_000;
const SAMPLE_EDGE = 320;
const MIN_FOREGROUND = 0.0015;
const MIN_TRANSPARENCY = 0.00025;
const MAX_EDGE_REFINEMENT_PIXELS = 8_000_000;
const DEFAULT_MODEL: BrowserBackgroundModel = "isnet_quint8";

function withTimeout<T>(promise: Promise<T>, milliseconds: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label} timed out. Check the connection and try again.`)), milliseconds);
    promise.then(
      (value) => { window.clearTimeout(timer); resolve(value); },
      (error) => { window.clearTimeout(timer); reject(error); },
    );
  });
}

function friendlyError(reason: unknown, label: string) {
  const message = reason instanceof Error ? reason.message : String(reason || "Unknown browser AI error");
  const lower = message.toLowerCase();
  if (lower.includes("webassembly") || lower.includes("wasm") || lower.includes("backend")) {
    return `${label} could not start its browser AI runtime. Use a current Chrome, Edge, or Firefox build and reload the page.`;
  }
  if (lower.includes("fetch") || lower.includes("network") || lower.includes("load") || lower.includes("download")) {
    return `${label} could not download its browser model/runtime assets. Check the connection, disable restrictive blockers for this page, and retry.`;
  }
  return `${label} failed: ${message}`;
}

async function loadImage(blob: Blob, label: string): Promise<LoadedImage> {
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
    if (!width || !height) throw new Error(`${label} returned invalid dimensions.`);
    return { image, url, width, height };
  } catch (reason) {
    image.src = "";
    URL.revokeObjectURL(url);
    throw reason;
  }
}

function releaseImage(loaded: LoadedImage) {
  loaded.image.src = "";
  URL.revokeObjectURL(loaded.url);
}

async function inspectCutout(blob: Blob, label: string) {
  if (!blob || blob.size < 32) throw new Error(`${label} returned an empty image.`);
  if (blob.type && !blob.type.startsWith("image/")) throw new Error(`${label} returned an unsupported result type.`);

  const loaded = await loadImage(blob, label);
  try {
    const scale = Math.min(1, SAMPLE_EDGE / Math.max(loaded.width, loaded.height));
    const sampleWidth = Math.max(1, Math.round(loaded.width * scale));
    const sampleHeight = Math.max(1, Math.round(loaded.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("This browser cannot validate the generated cutout.");

    ctx.clearRect(0, 0, sampleWidth, sampleHeight);
    ctx.drawImage(loaded.image, 0, 0, sampleWidth, sampleHeight);
    const data = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
    let foreground = 0;
    let transparent = 0;
    const total = Math.max(1, sampleWidth * sampleHeight);
    for (let index = 3; index < data.length; index += 4) {
      const alpha = data[index];
      if (alpha >= 18) foreground += 1;
      if (alpha <= 245) transparent += 1;
    }
    canvas.width = 1;
    canvas.height = 1;

    const foregroundCoverage = foreground / total;
    const transparencyCoverage = transparent / total;
    if (foregroundCoverage < MIN_FOREGROUND) throw new Error(`${label} produced an empty transparent cutout.`);
    if (transparencyCoverage < MIN_TRANSPARENCY) throw new Error(`${label} did not produce a usable transparent edge.`);
  } finally {
    releaseImage(loaded);
  }
}

/**
 * Rebuilds RGB from the original photo while retaining the IMG.LY alpha mask.
 * A very small alpha expansion is used to be less aggressive around wispy hair,
 * sleeves, collars, and other fine foreground boundaries. Large images skip the
 * extra canvases to keep mobile memory use bounded.
 */
async function preserveFineEdges(source: Blob, cutout: Blob): Promise<{ blob: Blob; refined: boolean }> {
  const cutoutImage = await loadImage(cutout, "IMG.LY cutout");
  if (cutoutImage.width * cutoutImage.height > MAX_EDGE_REFINEMENT_PIXELS) {
    releaseImage(cutoutImage);
    return { blob: cutout, refined: false };
  }

  const sourceImage = await loadImage(source, "Source photo");
  const mask = document.createElement("canvas");
  const output = document.createElement("canvas");
  mask.width = cutoutImage.width;
  mask.height = cutoutImage.height;
  output.width = cutoutImage.width;
  output.height = cutoutImage.height;

  try {
    const maskCtx = mask.getContext("2d");
    const outputCtx = output.getContext("2d");
    if (!maskCtx || !outputCtx) return { blob: cutout, refined: false };

    const radius = Math.max(cutoutImage.width, cutoutImage.height) >= 3000 ? 2 : 1;
    const offsets = [
      [-radius, 0], [radius, 0], [0, -radius], [0, radius],
      [-radius, -radius], [radius, -radius], [-radius, radius], [radius, radius],
    ] as const;

    maskCtx.clearRect(0, 0, mask.width, mask.height);
    maskCtx.globalCompositeOperation = "source-over";
    maskCtx.globalAlpha = 0.18;
    for (const [dx, dy] of offsets) {
      maskCtx.drawImage(cutoutImage.image, dx, dy, mask.width, mask.height);
    }
    maskCtx.globalAlpha = 1;
    maskCtx.drawImage(cutoutImage.image, 0, 0, mask.width, mask.height);

    outputCtx.clearRect(0, 0, output.width, output.height);
    outputCtx.globalCompositeOperation = "source-over";
    outputCtx.drawImage(sourceImage.image, 0, 0, output.width, output.height);
    outputCtx.globalCompositeOperation = "destination-in";
    outputCtx.drawImage(mask, 0, 0);
    outputCtx.globalCompositeOperation = "source-over";

    const refinedBlob = await new Promise<Blob>((resolve, reject) => {
      output.toBlob((value) => value ? resolve(value) : reject(new Error("Edge-preserved PNG encoding failed.")), "image/png");
    });
    return { blob: refinedBlob, refined: true };
  } catch {
    return { blob: cutout, refined: false };
  } finally {
    mask.width = 1;
    mask.height = 1;
    output.width = 1;
    output.height = 1;
    releaseImage(sourceImage);
    releaseImage(cutoutImage);
  }
}

/** Runs IMG.LY locally in the visitor's browser. No FlytheBG image API is used. */
export async function removeBackgroundInBrowser(
  file: File,
  model: BrowserBackgroundModel,
  onProgress?: ProgressHandler,
): Promise<BrowserBackgroundResult> {
  if (typeof window === "undefined") throw new Error("Browser AI is only available in a browser.");
  if (typeof WebAssembly !== "object") throw new Error("This browser does not provide WebAssembly, which browser AI requires.");

  const modelLabel = model === "isnet_fp16" ? "FP16" : "quantized";
  const label = `IMG.LY ${modelLabel}`;
  onProgress?.(`Loading ${label}…`);

  try {
    const { removeBackground } = await import("@imgly/background-removal");
    const cutout = await withTimeout(removeBackground(file, {
      debug: false,
      device: "cpu",
      proxyToWorker: false,
      model,
      rescale: true,
      output: { format: "image/png", quality: 1 },
      progress: (key: string, current: number, total: number) => {
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        onProgress?.(key.startsWith("fetch:")
          ? `Downloading ${label} assets · ${percentage}%`
          : `${label} processing · ${percentage}%`);
      },
    }), MODEL_TIMEOUT_MS, label);

    // Validate the library output before any optional edge reconstruction.
    await inspectCutout(cutout, label);
    onProgress?.(`${label} finished · preserving fine foreground edges…`);
    const refined = await preserveFineEdges(file, cutout);
    await inspectCutout(refined.blob, label);
    return { blob: refined.blob, model, modelLabel, edgeRefined: refined.refined };
  } catch (reason) {
    throw new Error(friendlyError(reason, label));
  }
}

/**
 * Bandwidth-first browser path used by both FlytheBG tools.
 * The quantized IS-Net model is the only automatic download so visitors do not
 * have to fetch the much larger FP16 model before background removal can start.
 */
export async function removeBackgroundWithFallback(
  file: File,
  onProgress?: ProgressHandler,
): Promise<BrowserBackgroundResult> {
  onProgress?.("Starting the smaller IMG.LY quantized background-removal model…");
  try {
    const result = await removeBackgroundInBrowser(file, DEFAULT_MODEL, onProgress);
    onProgress?.("Complete · IMG.LY quantized model · processed on this device");
    return result;
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "IMG.LY quantized model failed.";
    throw new Error(`Browser background removal could not finish with the small model. ${message}`);
  }
}
