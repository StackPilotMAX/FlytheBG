"use client";

export type BrowserBackgroundModel = "isnet_quint8" | "isnet_fp16";
export type BrowserBackgroundResult = {
  blob: Blob;
  model: BrowserBackgroundModel;
  modelLabel: "quantized" | "FP16";
  edgeRefined: boolean;
  optimizedForMemory: boolean;
  restoredResolution: boolean;
  preservationRisk: boolean;
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
type PreservationRisk = { paleRisk: boolean; fineEdgeRisk: boolean; qualityRisk: boolean };

const MODEL_TIMEOUT_MS = 180_000;
const SAMPLE_EDGE = 288;
const MIN_FOREGROUND = 0.0015;
const MIN_TRANSPARENCY = 0.002;
const EDGE_REFINEMENT_MAX_PIXELS = 3_000_000;
const PALE_PROTECTION_MAX_PIXELS = 3_000_000;
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

function modelTargetEdge(model: BrowserBackgroundModel) {
  const memory = deviceMemoryGb();
  if (model === QUALITY_MODEL) {
    if (memory <= 2) return 1280;
    if (memory <= 4) return 1600;
    if (memory <= 6) return 1920;
    return 2304;
  }
  if (memory <= 2) return 1200;
  if (memory <= 4) return 1500;
  if (memory <= 6) return 1800;
  return 2048;
}

function sourceRestorePixelLimit() {
  const memory = deviceMemoryGb();
  if (memory <= 4) return 0;
  if (memory <= 6) return 10_000_000;
  if (memory <= 8) return 18_000_000;
  return 24_000_000;
}

async function normalizeInputForModel(file: File, model: BrowserBackgroundModel, onProgress?: ProgressHandler): Promise<PreparedInput> {
  const loaded = await loadImage(file, "Selected image");
  const targetEdge = modelTargetEdge(model);
  const needsFormatConversion = !DIRECT_MODEL_MIME.has(file.type);
  const needsInferenceResize = Math.max(loaded.width, loaded.height) > targetEdge;
  const sourceWidth = loaded.width;
  const sourceHeight = loaded.height;

  if (!needsFormatConversion && !needsInferenceResize) {
    releaseImage(loaded);
    return { blob: file, optimizedForMemory: false, sourceWidth, sourceHeight };
  }

  if (needsInferenceResize) onProgress?.(`Fast AI pass: using a ${targetEdge}px working copy, then restoring source detail…`);
  else onProgress?.("Preparing this image format for browser AI…");

  const scale = needsInferenceResize ? Math.min(1, targetEdge / Math.max(loaded.width, loaded.height)) : 1;
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
    return { blob, optimizedForMemory: needsInferenceResize, sourceWidth, sourceHeight };
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

async function detectPreservationRisk(source: File, cutout: Blob): Promise<PreservationRisk> {
  const [sourceLoaded, cutoutLoaded] = await Promise.all([
    loadImage(source, "Selected image"),
    loadImage(cutout, "Background removed image"),
  ]);

  const scale = Math.min(1, SAMPLE_EDGE / Math.max(cutoutLoaded.width, cutoutLoaded.height));
  const width = Math.max(3, Math.round(cutoutLoaded.width * scale));
  const height = Math.max(3, Math.round(cutoutLoaded.height * scale));
  const sourceCanvas = document.createElement("canvas");
  const cutoutCanvas = document.createElement("canvas");
  sourceCanvas.width = cutoutCanvas.width = width;
  sourceCanvas.height = cutoutCanvas.height = height;

  try {
    const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    const cutoutCtx = cutoutCanvas.getContext("2d", { willReadFrequently: true });
    if (!sourceCtx || !cutoutCtx) return { paleRisk: false, fineEdgeRisk: false, qualityRisk: false };
    sourceCtx.drawImage(sourceLoaded.image, 0, 0, width, height);
    cutoutCtx.drawImage(cutoutLoaded.image, 0, 0, width, height);
    const sourceData = sourceCtx.getImageData(0, 0, width, height).data;
    const cutoutData = cutoutCtx.getImageData(0, 0, width, height).data;
    let foreground = 0;
    let paleRiskPixels = 0;
    let fineEdgePixels = 0;

    const alphaAt = (x: number, y: number) => cutoutData[(y * width + x) * 4 + 3];
    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const index = (y * width + x) * 4;
        const alpha = cutoutData[index + 3];
        if (alpha >= 160) foreground += 1;
        const left = alphaAt(x - 1, y);
        const right = alphaAt(x + 1, y);
        const up = alphaAt(x, y - 1);
        const down = alphaAt(x, y + 1);
        const neighborAverage = (left + right + up + down) / 4;
        const neighborMax = Math.max(left, right, up, down);

        const r = sourceData[index];
        const g = sourceData[index + 1];
        const b = sourceData[index + 2];
        const hi = Math.max(r, g, b);
        const lo = Math.min(r, g, b);
        const luminance = r * .2126 + g * .7152 + b * .0722;
        const pale = luminance >= 198 && hi - lo <= 55;

        if (pale && alpha < 155 && neighborAverage > 145) paleRiskPixels += 1;
        if (alpha > 5 && alpha < 150 && neighborMax > 90) fineEdgePixels += 1;
      }
    }

    const total = width * height;
    const paleRisk = paleRiskPixels >= Math.max(6, total * .00035);
    const fineEdgeRisk = fineEdgePixels >= Math.max(34, foreground * .018);
    return { paleRisk, fineEdgeRisk, qualityRisk: paleRisk || fineEdgeRisk };
  } finally {
    sourceCanvas.width = sourceCanvas.height = 1;
    cutoutCanvas.width = cutoutCanvas.height = 1;
    releaseImage(sourceLoaded);
    releaseImage(cutoutLoaded);
  }
}

/**
 * Conservative alpha cleanup. Connected semi-transparent subject detail is
 * never deliberately thinned; this protects fine hair, fur and soft edges.
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
    canvas.width = canvas.height = 1;
    releaseImage(loaded);
    return { blob, refined: false };
  }

  onProgress?.("Protecting fine hair and transparency edges locally…");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(loaded.image, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;
  const alpha = new Uint8ClampedArray(pixels);
  let changed = false;

  for (let pixel = 0, index = 3; pixel < pixels; pixel += 1, index += 4) alpha[pixel] = data[index];

  for (let y = 1; y < height - 1; y += 1) {
    const row = y * width;
    for (let x = 1; x < width - 1; x += 1) {
      const pixel = row + x;
      const a = alpha[pixel];
      const dataIndex = pixel * 4 + 3;
      const left = alpha[pixel - 1];
      const right = alpha[pixel + 1];
      const up = alpha[pixel - width];
      const down = alpha[pixel + width];
      const neighborAverage = (left + right + up + down) / 4;
      const neighborMax = Math.max(left, right, up, down);
      let next = a;

      // Only erase essentially empty, disconnected mask noise.
      if (a <= 2 && neighborMax <= 3) next = 0;
      // Preserve connected low-alpha strands instead of thinning them.
      else if (a < 96 && neighborMax > 64) next = Math.max(a, Math.round(neighborAverage * .18));
      // Fill small pinholes when the pixel is surrounded by strong foreground.
      if (a < 205 && neighborAverage > 212) next = Math.max(next, Math.round(neighborAverage * .72));
      if (a >= 250) next = 255;

      if (next !== a) {
        data[dataIndex] = next;
        changed = true;
      }
    }
  }

  if (!changed) {
    alpha.fill(0);
    imageData.data.fill(0);
    canvas.width = canvas.height = 1;
    releaseImage(loaded);
    return { blob, refined: false };
  }

  ctx.putImageData(imageData, 0, 0);
  const refinedBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Edge refinement could not encode the PNG.")), "image/png", 1);
  });

  alpha.fill(0);
  imageData.data.fill(0);
  canvas.width = canvas.height = 1;
  releaseImage(loaded);
  return { blob: refinedBlob, refined: true };
}

/**
 * Recover pale pixels only when they are mostly surrounded by already-opaque
 * foreground. This targets white/light clothing pinholes without pulling a
 * white studio background back around the outside silhouette.
 */
async function protectPaleForeground(source: File, cutout: Blob, enabled: boolean, onProgress?: ProgressHandler): Promise<{ blob: Blob; protected: boolean }> {
  if (!enabled) return { blob: cutout, protected: false };
  const [sourceLoaded, cutoutLoaded] = await Promise.all([
    loadImage(source, "Selected image"),
    loadImage(cutout, "Background removed image"),
  ]);
  const pixels = cutoutLoaded.width * cutoutLoaded.height;
  if (pixels > PALE_PROTECTION_MAX_PIXELS) {
    releaseImage(sourceLoaded);
    releaseImage(cutoutLoaded);
    return { blob: cutout, protected: false };
  }

  const sourceCanvas = document.createElement("canvas");
  const cutoutCanvas = document.createElement("canvas");
  sourceCanvas.width = cutoutCanvas.width = cutoutLoaded.width;
  sourceCanvas.height = cutoutCanvas.height = cutoutLoaded.height;

  try {
    const sourceCtx = sourceCanvas.getContext("2d", { willReadFrequently: true });
    const cutoutCtx = cutoutCanvas.getContext("2d", { willReadFrequently: true });
    if (!sourceCtx || !cutoutCtx) return { blob: cutout, protected: false };
    onProgress?.("Protecting light clothing inside the detected subject…");
    sourceCtx.drawImage(sourceLoaded.image, 0, 0, sourceCanvas.width, sourceCanvas.height);
    cutoutCtx.drawImage(cutoutLoaded.image, 0, 0);
    const sourceData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
    const cutoutImageData = cutoutCtx.getImageData(0, 0, cutoutCanvas.width, cutoutCanvas.height);
    const data = cutoutImageData.data;
    const width = cutoutCanvas.width;
    const height = cutoutCanvas.height;
    const originalAlpha = new Uint8ClampedArray(pixels);
    for (let pixel = 0, index = 3; pixel < pixels; pixel += 1, index += 4) originalAlpha[pixel] = data[index];
    let changed = false;

    for (let y = 1; y < height - 1; y += 1) {
      for (let x = 1; x < width - 1; x += 1) {
        const pixel = y * width + x;
        const index = pixel * 4;
        const alpha = originalAlpha[pixel];
        if (alpha >= 210) continue;
        const r = sourceData[index];
        const g = sourceData[index + 1];
        const b = sourceData[index + 2];
        const hi = Math.max(r, g, b);
        const lo = Math.min(r, g, b);
        const luminance = r * .2126 + g * .7152 + b * .0722;
        if (luminance < 190 || hi - lo > 58) continue;

        const neighbors = [
          originalAlpha[pixel - width - 1], originalAlpha[pixel - width], originalAlpha[pixel - width + 1],
          originalAlpha[pixel - 1], originalAlpha[pixel + 1],
          originalAlpha[pixel + width - 1], originalAlpha[pixel + width], originalAlpha[pixel + width + 1],
        ];
        const strong = neighbors.filter((value) => value >= 170);
        if (strong.length < 5) continue;
        const average = strong.reduce((sum, value) => sum + value, 0) / strong.length;
        const recovered = Math.min(245, Math.max(alpha, Math.round(average * .76)));
        if (recovered > alpha) {
          data[index + 3] = recovered;
          changed = true;
        }
      }
    }

    if (!changed) return { blob: cutout, protected: false };
    cutoutCtx.putImageData(cutoutImageData, 0, 0);
    const protectedBlob = await new Promise<Blob>((resolve, reject) => {
      cutoutCanvas.toBlob((value) => value ? resolve(value) : reject(new Error("Subject protection could not encode the PNG.")), "image/png", 1);
    });
    return { blob: protectedBlob, protected: true };
  } finally {
    sourceCanvas.width = sourceCanvas.height = 1;
    cutoutCanvas.width = cutoutCanvas.height = 1;
    releaseImage(sourceLoaded);
    releaseImage(cutoutLoaded);
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

function shouldRetryWithCdn(reason: unknown) {
  const message = reason instanceof Error ? reason.message.toLowerCase() : String(reason || "").toLowerCase();
  return ["relativeurl", "wasm", "webassembly", "worker", "import.meta", "module script", "backend"].some((token) => message.includes(token));
}

async function runModel(input: Blob, model: BrowserBackgroundModel, device: InferenceDevice, runtime: Runtime, onProgress?: ProgressHandler) {
  const modelLabel = model === QUALITY_MODEL ? "FP16" : "quantized";
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
    onProgress?.("Restoring original image detail with the protected local mask…");
    const restored = await runtime.applySegmentationMask(source, maskCutout, {
      publicPath: IMGLY_ASSET_PATH,
      debug: false,
      rescale: true,
      output: { format: "image/png", quality: 1 },
    });
    return { blob: restored, restored: true };
  } catch {
    return { blob: maskCutout, restored: false };
  }
}

export async function removeBackgroundInBrowser(file: File, model: BrowserBackgroundModel, onProgress?: ProgressHandler): Promise<BrowserBackgroundResult> {
  if (typeof window === "undefined") throw new Error("Browser AI is only available in a browser.");
  if (typeof WebAssembly !== "object") throw new Error("This browser does not provide WebAssembly, which browser AI requires.");

  const modelLabel = model === QUALITY_MODEL ? "FP16" : "quantized";
  const prepared = await normalizeInputForModel(file, model, onProgress);
  try {
    const modelCutout = await executeModel(prepared.blob, model, onProgress);
    await inspectCutout(modelCutout, `IMG.LY ${modelLabel}`);
    const risk = await detectPreservationRisk(file, modelCutout).catch(() => ({ paleRisk: false, fineEdgeRisk: false, qualityRisk: false }));
    const refinement = await refineCutoutEdges(modelCutout, onProgress);
    const protection = await protectPaleForeground(file, refinement.blob, risk.paleRisk, onProgress);
    const restoration = await restoreOriginalResolution(file, protection.blob, prepared, onProgress);
    await inspectCutout(restoration.blob, `IMG.LY ${modelLabel} protected result`);
    return {
      blob: restoration.blob,
      model,
      modelLabel,
      edgeRefined: refinement.refined || protection.protected,
      optimizedForMemory: prepared.optimizedForMemory,
      restoredResolution: restoration.restored,
      preservationRisk: risk.qualityRisk,
    };
  } catch (reason) {
    throw new Error(friendlyError(reason, `IMG.LY ${modelLabel}`));
  }
}

/**
 * Fast adaptive browser-only path. Start with the small quantized model for
 * speed. On capable WebGPU devices, only images showing risky pale-subject or
 * fine-edge mask patterns are automatically retried with FP16. This keeps the
 * common case fast while spending extra compute on hair/white-clothing cases.
 */
export async function removeBackgroundWithFallback(file: File, onProgress?: ProgressHandler): Promise<BrowserBackgroundResult> {
  const memory = deviceMemoryGb();
  onProgress?.("Starting fast local background removal…");

  let fastResult: BrowserBackgroundResult;
  try {
    fastResult = await removeBackgroundInBrowser(file, SMALL_MODEL, onProgress);
  } catch (reason) {
    if (memory >= 6 && canUseWebGpu()) {
      onProgress?.("Fast model could not finish. Trying the higher-quality WebGPU model…");
      const qualityResult = await removeBackgroundInBrowser(file, QUALITY_MODEL, onProgress);
      onProgress?.(`Complete · FP16 model${qualityResult.edgeRefined ? " · protected fine edges" : ""}${qualityResult.restoredResolution ? " · source detail restored" : ""}`);
      return qualityResult;
    }
    const message = reason instanceof Error ? reason.message : "IMG.LY browser model failed.";
    throw new Error(`Browser background removal could not finish. ${message}`);
  }

  if (fastResult.preservationRisk && memory >= 6 && canUseWebGpu()) {
    onProgress?.("Fine hair or pale subject edges detected. Running a quality-preserving pass…");
    try {
      const qualityResult = await removeBackgroundInBrowser(file, QUALITY_MODEL, onProgress);
      onProgress?.(`Complete · FP16 model${qualityResult.edgeRefined ? " · protected fine edges" : ""}${qualityResult.restoredResolution ? " · source detail restored" : ""}`);
      return qualityResult;
    } catch {
      onProgress?.("Quality pass was unavailable. Keeping the valid protected fast result.");
    }
  }

  onProgress?.(`Complete · quantized model${fastResult.edgeRefined ? " · protected fine edges" : ""}${fastResult.restoredResolution ? " · source detail restored" : ""}`);
  return fastResult;
}
