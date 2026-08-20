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
type LoadedImage = { image: HTMLImageElement; url: string; width: number; height: number };
type InferenceProfile = { name: string; maxEdge: number; maxPixels: number; recoveryEdge: number; recoveryPixels: number; maxOutputPixels: number; maxOutputEdge: number };

const MODEL_TIMEOUT_MS = 180_000;
const SAMPLE_EDGE = 320;
const MIN_FOREGROUND = 0.001;
const MIN_TRANSPARENCY = 0.0002;
const DEFAULT_MODEL: BrowserBackgroundModel = "isnet_quint8";
const DIRECT_MODEL_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

function withTimeout<T>(promise: Promise<T>, milliseconds: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(`${label} timed out. Check the connection and try again.`)), milliseconds);
    promise.then((value) => { window.clearTimeout(timer); resolve(value); }, (error) => { window.clearTimeout(timer); reject(error); });
  });
}

function friendlyError(reason: unknown, label: string) {
  const message = reason instanceof Error ? reason.message : String(reason || "Unknown browser AI error");
  const lower = message.toLowerCase();
  if (lower.includes("memory") || lower.includes("allocation") || lower.includes("out of bounds")) return `${label} ran out of browser memory. Close memory-heavy tabs and retry. FlytheBG will automatically use a lighter local inference copy on the next fallback.`;
  if (lower.includes("webassembly") || lower.includes("wasm") || lower.includes("backend") || lower.includes("webgpu")) return `${label} could not start its local AI runtime. Reload FlytheBG in a current Chrome, Edge, Firefox, or Safari build and try again.`;
  if (lower.includes("fetch") || lower.includes("network") || lower.includes("load") || lower.includes("download")) return `${label} could not download its local AI model/runtime files. Check the connection, allow staticimgly.com for this page, and retry.`;
  return `${label} failed: ${message}`;
}

function browserProfile(): InferenceProfile {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const memory = nav.deviceMemory || 4;
  const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
  if (memory <= 2) return { name: "ultra-light", maxEdge: 768, maxPixels: 520_000, recoveryEdge: 640, recoveryPixels: 350_000, maxOutputPixels: 16_000_000, maxOutputEdge: 9000 };
  if (memory <= 4 || coarse) return { name: "mobile-light", maxEdge: 1024, maxPixels: 900_000, recoveryEdge: 768, recoveryPixels: 520_000, maxOutputPixels: 24_000_000, maxOutputEdge: 10_000 };
  return { name: "balanced", maxEdge: 1408, maxPixels: 1_650_000, recoveryEdge: 1024, recoveryPixels: 900_000, maxOutputPixels: 32_000_000, maxOutputEdge: 12_000 };
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

function scaleForInference(width: number, height: number, maxEdge: number, maxPixels: number) {
  const edgeScale = Math.min(1, maxEdge / Math.max(width, height));
  const pixelScale = Math.min(1, Math.sqrt(maxPixels / Math.max(1, width * height)));
  return Math.min(edgeScale, pixelScale);
}

async function canvasToPng(canvas: HTMLCanvasElement, label: string): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => canvas.toBlob((value) => value ? resolve(value) : reject(new Error(`${label} could not be encoded as PNG.`)), "image/png", 1));
}

async function createInferenceCopy(source: LoadedImage, original: Blob, maxEdge: number, maxPixels: number, onProgress?: ProgressHandler) {
  const scale = scaleForInference(source.width, source.height, maxEdge, maxPixels);
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  if (scale >= 0.999 && DIRECT_MODEL_MIME.has(original.type.toLowerCase())) return { blob: original, width, height, scaled: false };

  onProgress?.(scale < 0.999 ? `Optimizing locally for this device · ${width} × ${height}px inference copy…` : "Preparing this image format for local AI…");
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  try {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("This browser cannot prepare the image for local AI.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, width, height);
    ctx.drawImage(source.image, 0, 0, width, height);
    return { blob: await canvasToPng(canvas, "Inference image"), width, height, scaled: true };
  } finally {
    canvas.width = 1;
    canvas.height = 1;
  }
}

async function inspectCutout(blob: Blob, label: string) {
  if (!blob || blob.size < 32) throw new Error(`${label} returned an empty image.`);
  if (blob.type && !blob.type.startsWith("image/")) throw new Error(`${label} returned an unsupported result type.`);
  const loaded = await loadImage(blob, label);
  try {
    const scale = Math.min(1, SAMPLE_EDGE / Math.max(loaded.width, loaded.height));
    const width = Math.max(1, Math.round(loaded.width * scale));
    const height = Math.max(1, Math.round(loaded.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    try {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) throw new Error("This browser cannot validate the generated cutout.");
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(loaded.image, 0, 0, width, height);
      const data = ctx.getImageData(0, 0, width, height).data;
      let foreground = 0;
      let transparent = 0;
      const total = Math.max(1, width * height);
      for (let index = 3; index < data.length; index += 4) {
        const alpha = data[index];
        if (alpha >= 18) foreground += 1;
        if (alpha <= 250) transparent += 1;
      }
      if (foreground / total < MIN_FOREGROUND) throw new Error(`${label} produced an empty transparent cutout.`);
      if (transparent / total < MIN_TRANSPARENCY) throw new Error(`${label} returned an almost fully opaque image.`);
    } finally {
      canvas.width = 1;
      canvas.height = 1;
    }
  } finally {
    releaseImage(loaded);
  }
}

function canUseWebGpu() {
  if (typeof navigator === "undefined" || !window.isSecureContext) return false;
  return Boolean((navigator as Navigator & { gpu?: unknown }).gpu);
}

function isNetworkFailure(reason: unknown) {
  const message = reason instanceof Error ? reason.message.toLowerCase() : String(reason || "").toLowerCase();
  return message.includes("fetch") || message.includes("network") || message.includes("download");
}

async function runModel(input: Blob, model: BrowserBackgroundModel, device: InferenceDevice, onProgress?: ProgressHandler) {
  const modelLabel = model === "isnet_fp16" ? "FP16" : "quantized";
  const deviceLabel = device === "gpu" ? "WebGPU" : "CPU/WASM";
  const label = `IMG.LY ${modelLabel} (${deviceLabel})`;
  const { removeBackground } = await import("@imgly/background-removal");
  onProgress?.(`Starting the small ${modelLabel} model on ${deviceLabel}…`);
  const cutout = await withTimeout(removeBackground(input, {
    debug: false,
    device,
    proxyToWorker: false,
    model,
    rescale: true,
    output: { format: "image/png", quality: 1, type: "foreground" },
    progress: (key: string, current: number, total: number) => {
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
      onProgress?.(key.startsWith("fetch:") ? `Downloading local AI files · ${percentage}%` : `Separating foreground on ${deviceLabel} · ${percentage}%`);
    },
  }), MODEL_TIMEOUT_MS, label);
  await inspectCutout(cutout, label);
  return cutout;
}

async function refineMaskForUpscale(cutout: Blob) {
  const loaded = await loadImage(cutout, "AI mask");
  try {
    const canvas = document.createElement("canvas");
    canvas.width = loaded.width;
    canvas.height = loaded.height;
    try {
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return cutout;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(loaded.image, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let i = 3; i < data.length; i += 4) {
        const a = data[i];
        if (a <= 7) data[i] = 0;
        else if (a >= 248) data[i] = 255;
        else {
          const t = a / 255;
          const smooth = t * t * (3 - 2 * t);
          data[i] = Math.round(255 * (0.35 * t + 0.65 * smooth));
        }
      }
      ctx.putImageData(imageData, 0, 0);
      return await canvasToPng(canvas, "Refined alpha mask");
    } finally {
      canvas.width = 1;
      canvas.height = 1;
    }
  } finally {
    releaseImage(loaded);
  }
}

async function rebuildAtSourceResolution(source: LoadedImage, cutout: Blob, onProgress?: ProgressHandler) {
  const refinedBlob = await refineMaskForUpscale(cutout);
  const mask = await loadImage(refinedBlob, "Background-removal mask");
  try {
    if (mask.width === source.width && mask.height === source.height) return refinedBlob;
    onProgress?.(`Restoring clean source pixels to ${source.width} × ${source.height}px…`);
    const canvas = document.createElement("canvas");
    canvas.width = source.width;
    canvas.height = source.height;
    try {
      const ctx = canvas.getContext("2d", { alpha: true });
      if (!ctx) throw new Error("This browser cannot rebuild the full-size transparent PNG.");
      ctx.clearRect(0, 0, source.width, source.height);
      ctx.drawImage(source.image, 0, 0, source.width, source.height);
      ctx.globalCompositeOperation = "destination-in";
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(mask.image, 0, 0, source.width, source.height);
      ctx.globalCompositeOperation = "source-over";
      return await canvasToPng(canvas, "Full-size cutout");
    } finally {
      canvas.width = 1;
      canvas.height = 1;
    }
  } finally {
    releaseImage(mask);
  }
}

async function runReliableSmallModel(source: LoadedImage, original: Blob, model: BrowserBackgroundModel, profile: InferenceProfile, onProgress?: ProgressHandler) {
  const normal = await createInferenceCopy(source, original, profile.maxEdge, profile.maxPixels, onProgress);
  if (canUseWebGpu()) {
    try {
      return await runModel(normal.blob, model, "gpu", onProgress);
    } catch (reason) {
      if (isNetworkFailure(reason)) throw reason;
      onProgress?.("WebGPU did not finish cleanly. Retrying the same small model on CPU/WASM…");
    }
  }

  try {
    return await runModel(normal.blob, model, "cpu", onProgress);
  } catch (reason) {
    if (isNetworkFailure(reason)) throw reason;
    onProgress?.("Using the low-memory recovery path…");
    const recovery = await createInferenceCopy(source, original, profile.recoveryEdge, profile.recoveryPixels, onProgress);
    return runModel(recovery.blob, model, "cpu", onProgress);
  }
}

export async function removeBackgroundInBrowser(file: File, model: BrowserBackgroundModel, onProgress?: ProgressHandler): Promise<BrowserBackgroundResult> {
  if (typeof window === "undefined") throw new Error("Browser AI is only available in a browser.");
  if (typeof WebAssembly !== "object") throw new Error("This browser does not provide WebAssembly, which local AI requires.");
  const modelLabel = model === "isnet_fp16" ? "FP16" : "quantized";
  const source = await loadImage(file, "Selected image");
  const profile = browserProfile();
  try {
    const pixels = source.width * source.height;
    if (pixels > profile.maxOutputPixels || Math.max(source.width, source.height) > profile.maxOutputEdge) {
      throw new Error(`This image is ${source.width} × ${source.height}px and exceeds the safe browser-memory limit for this device. Reduce the source dimensions and retry.`);
    }
    onProgress?.(`Local device profile: ${profile.name} · preserving ${source.width}:${source.height} aspect ratio…`);
    const cutout = await runReliableSmallModel(source, file, model, profile, onProgress);
    const finalBlob = await rebuildAtSourceResolution(source, cutout, onProgress);
    await inspectCutout(finalBlob, `IMG.LY ${modelLabel} final output`);
    return { blob: finalBlob, model, modelLabel, edgeRefined: true };
  } catch (reason) {
    throw new Error(friendlyError(reason, `IMG.LY ${modelLabel}`));
  } finally {
    releaseImage(source);
  }
}

export async function removeBackgroundWithFallback(file: File, onProgress?: ProgressHandler): Promise<BrowserBackgroundResult> {
  onProgress?.("Preparing low-memory browser background removal…");
  try {
    const result = await removeBackgroundInBrowser(file, DEFAULT_MODEL, onProgress);
    onProgress?.("Complete · local AI · source-quality transparent PNG ready");
    return result;
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : "IMG.LY quantized model failed.";
    throw new Error(`Browser background removal could not finish. ${message}`);
  }
}
