"use client";

export type BrowserBackgroundModel = "isnet_quint8" | "isnet_fp16";
export type BrowserBackgroundResult = {
  blob: Blob;
  model: BrowserBackgroundModel;
  modelLabel: "quantized" | "FP16";
  edgeRefined: boolean;
  optimizedForMemory: boolean;
  restoredResolution: boolean;
};

type ProgressHandler = (message: string) => void;
type InferenceDevice = "gpu" | "cpu";
type Runtime = {
  removeBackground: (input: Blob, config?: Record<string, unknown>) => Promise<Blob>;
  applySegmentationMask?: (image: Blob, mask: Blob, config?: Record<string, unknown>) => Promise<Blob>;
};
type LoadedImage = { image: HTMLImageElement; url: string; width: number; height: number };
type PreparedInput = {
  blob: Blob;
  optimizedForMemory: boolean;
  sourceWidth: number;
  sourceHeight: number;
};

const MODEL_TIMEOUT_MS = 180_000;
const SAMPLE_EDGE = 320;
const MIN_FOREGROUND = 0.0015;
const MIN_TRANSPARENCY = 0.002;
const EDGE_REFINEMENT_MAX_PIXELS = 4_500_000;
const SMALL_MODEL: BrowserBackgroundModel = "isnet_quint8";
const QUALITY_MODEL: BrowserBackgroundModel = "isnet_fp16";
const IMGLY_ASSET_PATH = "https://staticimgly.com/@imgly/background-removal-data/1.7.0/dist/";
const IMGLY_ESM_URL = "https://esm.sh/@imgly/background-removal@1.7.0";
const DIRECT_MODEL_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);

let bundledRuntimePromise: Promise<Runtime> | null = null;
let cdnRuntimePromise: Promise<Runtime> | null = null;

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
  if (lower.includes("webassembly") || lower.includes("wasm") || lower.includes("backend") || lower.includes("webgpu") || lower.includes("relativeurl")) {
    return `${label} could not start its local AI runtime. Reload in a current Chrome, Edge, Firefox, or Safari build and try again.`;
  }
  if (lower.includes("fetch") || lower.includes("network") || lower.includes("load") || lower.includes("download")) {
    return `${label} could not download its browser model/runtime assets. Check the connection, disable restrictive blockers for this page, and retry.`;
  }
  if (lower.includes("memory") || lower.includes("allocation") || lower.includes("out of bounds")) {
    return `${label} ran out of browser memory. FlytheBG automatically uses a smaller working image on constrained devices; closing other heavy tabs can also help.`;
  }
  return `${label} failed: ${message}`;
}

async function loadBundledRuntime(): Promise<Runtime> {
  bundledRuntimePromise ??= import("@imgly/background-removal").then((module) => ({
    removeBackground: module.removeBackground as Runtime["removeBackground"],
    applySegmentationMask: module.applySegmentationMask as Runtime["applySegmentationMask"],
  }));
  return bundledRuntimePromise;
}

async function loadCdnRuntime(): Promise<Runtime> {
  if (!cdnRuntimePromise) {
    const importFromUrl = new Function("url", "return import(url)") as (url: string) => Promise<{
      removeBackground: Runtime["removeBackground"];
      applySegmentationMask?: Runtime["applySegmentationMask"];
    }>;
    cdnRuntimePromise = importFromUrl(IMGLY_ESM_URL).then((module) => ({
      removeBackground: module.removeBackground,
      applySegmentationMask: module.applySegmentationMask,
    }));
  }
  return cdnRuntimePromise;
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

function deviceMemoryGb() {
  return (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
}

function lowMemoryTargetEdge() {
  const memory = deviceMemoryGb();
  if (memory <= 2) return 1400;
  if (memory <= 4) return 1800;
  if (memory <= 6) return 2400;
  return Infinity;
}

function sourceRestorePixelLimit() {
  const memory = deviceMemoryGb();
  if (memory <= 4) return 0;
  if (memory <= 6) return 10_000_000;
  if (memory <= 8) return 18_000_000;
  return 24_000_000;
}

async function normalizeInputForModel(file: File, onProgress?: ProgressHandler): Promise<PreparedInput> {
  const loaded = await loadImage(file, "Selected image");
  const targetEdge = lowMemoryTargetEdge();
  const needsFormatConversion = !DIRECT_MODEL_MIME.has(file.type);
  const needsMemoryResize = Math.max(loaded.width, loaded.height) > targetEdge;
  const sourceWidth = loaded.width;
  const sourceHeight = loaded.height;

  if (!needsFormatConversion && !needsMemoryResize) {
    releaseImage(loaded);
    return { blob: file, optimizedForMemory: false, sourceWidth, sourceHeight };
  }

  if (needsMemoryResize) onProgress?.(`Low-memory guard: using a ${targetEdge}px working copy for AI inference…`);
  else onProgress?.("Preparing this image format for browser AI…");

  const scale = needsMemoryResize ? Math.min(1, targetEdge / Math.max(loaded.width, loaded.height)) : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(loaded.width * scale));
  canvas.height = Math.max(1, Math.round(loaded.height * scale));

  try {
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) throw new Error("This browser cannot prepare the selected image format.");
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(loaded.image, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((value) => value ? resolve(value) : reject(new Error("The selected image could not be converted for browser AI.")), "image/png", 1);
    });
    return { blob, optimizedForMemory: needsMemoryResize, sourceWidth, sourceHeight };
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
    if (foreground / total < MIN_FOREGROUND) throw new Error(`${label} produced an empty transparent cutout.`);
    if (transparent / total < MIN_TRANSPARENCY) throw new Error(`${label} did not remove a meaningful amount of background.`);
  } finally {
    releaseImage(loaded);
  }
}

/**
 * Lightweight matte cleanup. It preserves fine semi-transparent pixels while
 * reducing isolated low-alpha noise and slightly increasing boundary contrast.
 * This is intentionally skipped on very large canvases to protect mobile RAM.
 */
async function refineCutoutEdges(blob: Blob, onProgress?: ProgressHandler): Promise<{ blob: Blob; refined: boolean }> {
  const loaded = await loadImage(blob, "Background removed image");
  const pixels = loaded.width * loaded.height;
  if (pixels > EDGE_REFINEMENT_MAX_PIXELS) {
    releaseImage(loaded);
    return { blob, refined: false };
  }

  const canvas = document.createElement("canvas");
  canvas.width = loaded.width;
  canvas.height = loaded.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    canvas.width = 1;
    canvas.height = 1;
    releaseImage(loaded);
    return { blob, refined: false };
  }

  onProgress?.("Refining transparency edges locally…");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(loaded.image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;
  const alpha = new Uint8ClampedArray(pixels);

  for (let pixel = 0, index = 3; pixel < pixels; pixel += 1, index += 4) alpha[pixel] = data[index];

  for (let y = 1; y < height - 1; y += 1) {
    const row = y * width;
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = row + x;
      const a = alpha[pixel];
      const dataIndex = pixel * 4 + 3;
      if (a <= 3) { data[dataIndex] = 0; continue; }
      if (a >= 252) { data[dataIndex] = 255; continue; }

      const t = a / 255;
      const smooth = t * t * (3 - 2 * t);
      let refined = t * 0.78 + smooth * 0.22;
      const neighborAverage = (alpha[pixel - 1] + alpha[pixel + 1] + alpha[pixel - width] + alpha[pixel + width]) / 4;

      // Remove faint isolated background speckles without erasing connected hair/fur.
      if (a < 72 && neighborAverage < 18) refined *= 0.35;
      // Fill tiny pinholes inside strongly opaque foreground regions.
      if (a > 178 && neighborAverage > 238) refined += (1 - refined) * 0.28;

      data[dataIndex] = Math.max(0, Math.min(255, Math.round(refined * 255)));
    }
  }

  ctx.putImageData(imageData, 0, 0);
  const refinedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Edge refinement could not encode the PNG.")), "image/png", 1);
  });

  alpha.fill(0);
  imageData.data.fill(0);
  canvas.width = 1;
  canvas.height = 1;
  releaseImage(loaded);
  return { blob: refinedBlob, refined: true };
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

function shouldRetryWithCdn(reason: unknown) {
  const message = reason instanceof Error ? reason.message.toLowerCase() : String(reason || "").toLowerCase();
  return ["relativeurl", "wasm", "webassembly", "worker", "import.meta", "module script", "backend"].some((token) => message.includes(token));
}

async function runModel(input: Blob, model: BrowserBackgroundModel, device: InferenceDevice, runtime: Runtime, onProgress?: ProgressHandler) {
  const modelLabel = model === "isnet_fp16" ? "FP16" : "quantized";
  const deviceLabel = device === "gpu" ? "WebGPU" : "CPU/WASM";
  const label = `IMG.LY ${modelLabel} (${deviceLabel})`;
  onProgress?.(`Starting ${modelLabel} model on ${deviceLabel}…`);
  return withTimeout(runtime.removeBackground(input, {
    publicPath: IMGLY_ASSET_PATH,
    debug: false,
    device,
    proxyToWorker: device === "gpu",
    model,
    rescale: true,
    output: { format: "image/png", quality: 1 },
    progress: (key: string, current: number, total: number) => {
      const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
      onProgress?.(key.startsWith("fetch:")
        ? `Downloading model/runtime assets · ${percentage}%`
        : `Removing background on ${deviceLabel} · ${percentage}%`);
    },
  }), MODEL_TIMEOUT_MS, label);
}

async function executeModel(input: Blob, model: BrowserBackgroundModel, onProgress?: ProgressHandler) {
  let runtime = await loadBundledRuntime();
  const runWithDeviceFallback = async () => {
    if (canUseWebGpu()) {
      try {
        return await runModel(input, model, "gpu", runtime, onProgress);
      } catch (reason) {
        if (!shouldRetryOnCpu(reason)) throw reason;
        onProgress?.("WebGPU could not finish. Retrying locally on CPU/WASM…");
        return runModel(input, model, "cpu", runtime, onProgress);
      }
    }
    return runModel(input, model, "cpu", runtime, onProgress);
  };

  try {
    return await runWithDeviceFallback();
  } catch (reason) {
    if (!shouldRetryWithCdn(reason)) throw reason;
    onProgress?.("Bundled runtime could not initialize. Switching to the browser-safe ESM runtime…");
    runtime = await loadCdnRuntime();
    return canUseWebGpu()
      ? runModel(input, model, "gpu", runtime, onProgress).catch(() => runModel(input, model, "cpu", runtime, onProgress))
      : runModel(input, model, "cpu", runtime, onProgress);
  }
}

async function restoreOriginalResolution(
  source: File,
  maskCutout: Blob,
  prepared: PreparedInput,
  onProgress?: ProgressHandler,
): Promise<{ blob: Blob; restored: boolean }> {
  if (!prepared.optimizedForMemory) return { blob: maskCutout, restored: false };
  const pixels = prepared.sourceWidth * prepared.sourceHeight;
  const limit = sourceRestorePixelLimit();
  if (!limit || pixels > limit) return { blob: maskCutout, restored: false };

  try {
    const runtime = await loadBundledRuntime();
    if (!runtime.applySegmentationMask) return { blob: maskCutout, restored: false };
    onProgress?.("Restoring original image detail with the refined local mask…");
    const restored = await runtime.applySegmentationMask(source, maskCutout, {
      publicPath: IMGLY_ASSET_PATH,
      debug: false,
      rescale: true,
      output: { format: "image/png", quality: 1 },
    });
    return { blob: restored, restored: true };
  } catch {
    // Accuracy enhancement is optional; never fail an otherwise valid cutout.
    return { blob: maskCutout, restored: false };
  }
}

export async function removeBackgroundInBrowser(file: File, model: BrowserBackgroundModel, onProgress?: ProgressHandler): Promise<BrowserBackgroundResult> {
  if (typeof window === "undefined") throw new Error("Browser AI is only available in a browser.");
  if (typeof WebAssembly !== "object") throw new Error("This browser does not provide WebAssembly, which browser AI requires.");

  const modelLabel = model === "isnet_fp16" ? "FP16" : "quantized";
  const prepared = await normalizeInputForModel(file, onProgress);
  try {
    const modelCutout = await executeModel(prepared.blob, model, onProgress);
    await inspectCutout(modelCutout, `IMG.LY ${modelLabel}`);
    const refinement = await refineCutoutEdges(modelCutout, onProgress);
    const restoration = await restoreOriginalResolution(file, refinement.blob, prepared, onProgress);
    await inspectCutout(restoration.blob, `IMG.LY ${modelLabel} refined result`);
    return {
      blob: restoration.blob,
      model,
      modelLabel,
      edgeRefined: refinement.refined,
      optimizedForMemory: prepared.optimizedForMemory,
      restoredResolution: restoration.restored,
    };
  } catch (reason) {
    throw new Error(friendlyError(reason, `IMG.LY ${modelLabel}`));
  }
}

/**
 * Smart browser-only path: low-memory/mobile devices use the ~42 MB quantized
 * model; powerful WebGPU devices can use FP16 for a higher-quality mask. Every
 * successful result can receive lightweight alpha-matte cleanup, and resized
 * inference masks are reapplied to the source resolution when memory allows.
 */
export async function removeBackgroundWithFallback(file: File, onProgress?: ProgressHandler): Promise<BrowserBackgroundResult> {
  const memory = deviceMemoryGb();
  const preferQuality = memory >= 8 && canUseWebGpu();
  const preferredModel = preferQuality ? QUALITY_MODEL : SMALL_MODEL;
  onProgress?.(preferQuality ? "Starting HD local background removal…" : "Starting lightweight local background removal…");

  try {
    const result = await removeBackgroundInBrowser(file, preferredModel, onProgress);
    onProgress?.(`Complete · ${result.modelLabel} model${result.edgeRefined ? " · refined edges" : ""}${result.restoredResolution ? " · source detail restored" : ""}`);
    return result;
  } catch (reason) {
    if (preferredModel === QUALITY_MODEL) {
      onProgress?.("HD model could not finish. Retrying with the smaller low-memory model…");
      const result = await removeBackgroundInBrowser(file, SMALL_MODEL, onProgress);
      onProgress?.(`Complete · quantized model${result.edgeRefined ? " · refined edges" : ""}${result.restoredResolution ? " · source detail restored" : ""}`);
      return result;
    }
    const message = reason instanceof Error ? reason.message : "IMG.LY browser model failed.";
    throw new Error(`Browser background removal could not finish. ${message}`);
  }
}
