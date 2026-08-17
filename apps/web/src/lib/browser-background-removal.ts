"use client";

export type BrowserBackgroundModel = "isnet_quint8" | "isnet_fp16";
export type BrowserBackgroundResult = {
  blob: Blob;
  model: BrowserBackgroundModel;
  modelLabel: "quantized" | "FP16";
};

type ProgressHandler = (message: string) => void;

const PUBLIC_PATH = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";
const MODEL_TIMEOUT_MS = 180_000;
const SAMPLE_EDGE = 320;
const MIN_FOREGROUND = 0.0015;
const MIN_TRANSPARENCY = 0.0025;

function withTimeout<T>(promise: Promise<T>, milliseconds: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label} timed out.`)), milliseconds);
    promise.then(
      (value) => { window.clearTimeout(timer); resolve(value); },
      (error) => { window.clearTimeout(timer); reject(error); },
    );
  });
}

async function inspectCutout(blob: Blob, label: string) {
  if (!blob || blob.size < 32) throw new Error(`${label} returned an empty image.`);
  const url = URL.createObjectURL(blob);
  const image = new Image();
  image.decoding = "async";
  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error(`${label} returned an image this browser could not decode.`));
      image.src = url;
    });
    await image.decode().catch(() => undefined);
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) throw new Error(`${label} returned invalid dimensions.`);

    const scale = Math.min(1, SAMPLE_EDGE / Math.max(width, height));
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("This browser cannot validate the cutout.");
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(image, 0, 0, w, h);
    const data = ctx.getImageData(0, 0, w, h).data;
    let foreground = 0;
    let transparent = 0;
    const total = Math.max(1, w * h);
    for (let i = 3; i < data.length; i += 4) {
      const alpha = data[i];
      if (alpha >= 18) foreground += 1;
      if (alpha <= 245) transparent += 1;
    }
    canvas.width = 1;
    canvas.height = 1;
    const foregroundCoverage = foreground / total;
    const transparencyCoverage = transparent / total;
    if (foregroundCoverage < MIN_FOREGROUND) throw new Error(`${label} produced an empty transparent cutout.`);
    if (transparencyCoverage < MIN_TRANSPARENCY) throw new Error(`${label} did not remove a visible background.`);
    return { foregroundCoverage, transparencyCoverage };
  } finally {
    image.src = "";
    URL.revokeObjectURL(url);
  }
}

/**
 * Runs IMG.LY entirely in the visitor's browser. The source image is never sent
 * to FlytheBG, Supabase, Render, or an image database by this function.
 */
export async function removeBackgroundInBrowser(
  file: File,
  model: BrowserBackgroundModel,
  onProgress?: ProgressHandler,
): Promise<BrowserBackgroundResult> {
  if (typeof window === "undefined") throw new Error("Browser AI is only available in the browser.");

  const { removeBackground } = await import("@imgly/background-removal");
  const modelLabel = model === "isnet_fp16" ? "FP16" : "quantized";
  const label = `IMG.LY ${modelLabel}`;
  onProgress?.(`Loading ${label} browser model…`);

  const blob = await withTimeout(removeBackground(file, {
    publicPath: PUBLIC_PATH,
    proxyToWorker: false,
    debug: false,
    device: "cpu",
    model,
    rescale: true,
    fetchArgs: { cache: "force-cache" },
    output: { format: "image/png", quality: 1 },
    progress: (key: string, current: number, total: number) => {
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
      onProgress?.(key.startsWith("fetch:")
        ? `Downloading ${label} ${percentage}%`
        : `${label} ${percentage}%`);
    },
  }), MODEL_TIMEOUT_MS, label);

  await inspectCutout(blob, label);
  return { blob, model, modelLabel };
}

export async function removeBackgroundWithFallback(
  file: File,
  onProgress?: ProgressHandler,
): Promise<BrowserBackgroundResult> {
  let firstError = "";
  try {
    const result = await removeBackgroundInBrowser(file, "isnet_quint8", onProgress);
    onProgress?.("Complete · IMG.LY quantized · processed on this device");
    return result;
  } catch (reason) {
    firstError = reason instanceof Error ? reason.message : "Quantized model failed.";
    onProgress?.(`${firstError} Retrying with IMG.LY FP16…`);
  }

  try {
    const result = await removeBackgroundInBrowser(file, "isnet_fp16", onProgress);
    onProgress?.("Complete · IMG.LY FP16 fallback · processed on this device");
    return result;
  } catch (reason) {
    const secondError = reason instanceof Error ? reason.message : "FP16 model failed.";
    throw new Error(`Browser background removal failed. Quantized: ${firstError} FP16: ${secondError}`);
  }
}
