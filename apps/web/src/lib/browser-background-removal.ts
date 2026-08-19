"use client";

export type BrowserBackgroundModel = "isnet_quint8" | "isnet_fp16";
export type BrowserBackgroundResult = {
  blob: Blob;
  model: BrowserBackgroundModel;
  modelLabel: "quantized" | "FP16";
  edgeRefined: boolean;
};

type ProgressHandler = (message: string) => void;
type InferenceDevice = "gpu" | "cpu";

type LoadedImage = {
  image: HTMLImageElement;
  url: string;
  width: number;
  height: number;
};

const MODEL_TIMEOUT_MS = 180_000;
const SAMPLE_EDGE = 320;
const MIN_FOREGROUND = 0.0015;
const MIN_TRANSPARENCY = 0.002;
const DEFAULT_MODEL: BrowserBackgroundModel = "isnet_quint8";
const DIRECT_MODEL_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

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
  if (lower.includes("webassembly") || lower.includes("wasm") || lower.includes("backend") || lower.includes("webgpu")) {
    return `${label} could not start its browser AI runtime. Reload the page in a current Chrome, Edge, Firefox, or Safari build and try again.`;
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

async function normalizeInputForModel(file: File, onProgress?: ProgressHandler): Promise<Blob> {
  if (DIRECT_MODEL_MIME.has(file.type)) return file;

  onProgress?.("Preparing this image format for browser AI…");
  const loaded = await loadImage(file, "Selected image");
  const canvas = document.createElement("canvas");
  canvas.width = loaded.width;
  canvas.height = loaded.height;

  try {
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("This browser cannot prepare the selected image format.");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loaded.image, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (value) => value ? resolve(value) : reject(new Error("The selected image could not be converted for browser AI.")),
        "image/png",
      );
    });
  } finally {
    canvas.width = 1;
    canvas.height = 1;
    releaseImage(loaded);
  }
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
    if (transparencyCoverage < MIN_TRANSPARENCY) throw new Error(`${label} did not remove a meaningful amount of background.`);
  } finally {
    releaseImage(loaded);
  }
}

function canUseWebGpu() {
  if (typeof navigator === "undefined" || !window.isSecureContext) return false;
  return Boolean((navigator as Navigator & { gpu?: unknown }).gpu);
}

function shouldRetryOnCpu(reason: unknown) {
  const message = reason instanceof Error ? reason.message.toLowerCase() : String(reason || "").toLowerCase();
  if (message.includes("fetch") || message.includes("network") || message.includes("download") || message.includes("timed out")) return false;
  if (message.includes("empty transparent cutout") || message.includes("meaningful amount of background")) return false;
  return true;
}

async function runModel(
  input: Blob,
  model: BrowserBackgroundModel,
  device: InferenceDevice,
  onProgress?: ProgressHandler,
) {
  const modelLabel = model === "isnet_fp16" ? "FP16" : "quantized";
  const deviceLabel = device === "gpu" ? "WebGPU" : "CPU";
  const label = `IMG.LY ${modelLabel} (${deviceLabel})`;
  const { removeBackground } = await import("@imgly/background-removal");

  onProgress?.(`Starting ${modelLabel} model on ${deviceLabel}…`);
  return withTimeout(removeBackground(input, {
    debug: false,
    device,
    proxyToWorker: true,
    model,
    rescale: true,
    output: { format: "image/png", quality: 1 },
    progress: (key: string, current: number, total: number) => {
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
      onProgress?.(key.startsWith("fetch:")
        ? `Downloading small model/runtime assets · ${percentage}%`
        : `Removing background on ${deviceLabel} · ${percentage}%`);
    },
  }), MODEL_TIMEOUT_MS, label);
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
  const input = await normalizeInputForModel(file, onProgress);
  let cutout: Blob;

  try {
    if (canUseWebGpu()) {
      try {
        cutout = await runModel(input, model, "gpu", onProgress);
      } catch (reason) {
        if (!shouldRetryOnCpu(reason)) throw reason;
        onProgress?.("WebGPU could not finish. Retrying the same small model on CPU…");
        cutout = await runModel(input, model, "cpu", onProgress);
      }
    } else {
      cutout = await runModel(input, model, "cpu", onProgress);
    }

    // Return IMG.LY's cutout directly. The previous full-resolution edge expansion
    // added extra latency and could reintroduce source-background pixels at edges.
    await inspectCutout(cutout, `IMG.LY ${modelLabel}`);
    return { blob: cutout, model, modelLabel, edgeRefined: false };
  } catch (reason) {
    throw new Error(friendlyError(reason, `IMG.LY ${modelLabel}`));
  }
}

/**
 * Fast browser path used by both FlytheBG tools. The quantized IS-Net model is
 * the only automatic model download. WebGPU is preferred when available and the
 * same small model retries on CPU if the GPU backend cannot initialize.
 */
export async function removeBackgroundWithFallback(
  file: File,
  onProgress?: ProgressHandler,
): Promise<BrowserBackgroundResult> {
  onProgress?.("Starting fast browser background removal…");
  try {
    const result = await removeBackgroundInBrowser(file, DEFAULT_MODEL, onProgress);
    onProgress?.("Complete · small IMG.LY model · transparent PNG ready");
    return result;
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "IMG.LY quantized model failed.";
    throw new Error(`Browser background removal could not finish. ${message}`);
  }
}
