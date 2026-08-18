"use client";

export type BrowserBackgroundModel = "isnet_quint8" | "isnet_fp16";
export type BrowserBackgroundResult = {
  blob: Blob;
  model: BrowserBackgroundModel;
  modelLabel: "quantized" | "FP16";
};

type ProgressHandler = (message: string) => void;

const MODEL_TIMEOUT_MS = 180_000;
const SAMPLE_EDGE = 320;
const MIN_FOREGROUND = 0.0015;
const MIN_TRANSPARENCY = 0.00025;

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

async function inspectCutout(blob: Blob, label: string) {
  if (!blob || blob.size < 32) throw new Error(`${label} returned an empty image.`);
  if (blob.type && !blob.type.startsWith("image/")) throw new Error(`${label} returned an unsupported result type.`);

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
    const sampleWidth = Math.max(1, Math.round(width * scale));
    const sampleHeight = Math.max(1, Math.round(height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = sampleWidth;
    canvas.height = sampleHeight;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) throw new Error("This browser cannot validate the generated cutout.");

    ctx.clearRect(0, 0, sampleWidth, sampleHeight);
    ctx.drawImage(image, 0, 0, sampleWidth, sampleHeight);
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
    image.src = "";
    URL.revokeObjectURL(url);
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
    const blob = await withTimeout(removeBackground(file, {
      debug: false,
      device: "cpu",
      model,
      rescale: true,
      output: { format: "image/png", quality: 1, type: "foreground" },
      progress: (key: string, current: number, total: number) => {
        const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
        onProgress?.(key.startsWith("fetch:")
          ? `Downloading ${label} assets · ${percentage}%`
          : `${label} processing · ${percentage}%`);
      },
    }), MODEL_TIMEOUT_MS, label);

    await inspectCutout(blob, label);
    return { blob, model, modelLabel };
  } catch (reason) {
    throw new Error(friendlyError(reason, label));
  }
}

export async function removeBackgroundWithFallback(
  file: File,
  onProgress?: ProgressHandler,
): Promise<BrowserBackgroundResult> {
  let quantizedError = "";
  try {
    const result = await removeBackgroundInBrowser(file, "isnet_quint8", onProgress);
    onProgress?.("Complete · IMG.LY quantized · processed on this device");
    return result;
  } catch (reason) {
    quantizedError = reason instanceof Error ? reason.message : "IMG.LY quantized failed.";
    onProgress?.("The fast model could not finish. Retrying with IMG.LY FP16…");
  }

  try {
    const result = await removeBackgroundInBrowser(file, "isnet_fp16", onProgress);
    onProgress?.("Complete · IMG.LY FP16 fallback · processed on this device");
    return result;
  } catch (reason) {
    const fp16Error = reason instanceof Error ? reason.message : "IMG.LY FP16 failed.";
    throw new Error(`Browser background removal could not finish. Fast model: ${quantizedError} Fallback: ${fp16Error}`);
  }
}
