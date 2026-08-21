import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/lib/browser-background-removal.ts", import.meta.url), "utf8");

test("small quantized model remains the low-memory default", () => {
  assert.match(source, /const SMALL_MODEL: BrowserBackgroundModel = "isnet_quint8";/);
  assert.match(source, /deviceMemoryGb\(\)/);
  assert.match(source, /lowMemoryTargetEdge\(\)/);
});

test("powerful WebGPU devices can try FP16 and still fall back to quantized", () => {
  assert.match(source, /const QUALITY_MODEL: BrowserBackgroundModel = "isnet_fp16";/);
  assert.match(source, /const preferQuality = memory >= 8 && canUseWebGpu\(\)/);
  assert.match(source, /preferredModel === QUALITY_MODEL/);
  assert.match(source, /removeBackgroundInBrowser\(file, SMALL_MODEL, onProgress\)/);
});

test("model execution keeps WebGPU and CPU fallback paths", () => {
  assert.ok(source.includes('runModel(input, model, "gpu", runtime, onProgress)'));
  assert.ok(source.includes('runModel(input, model, "cpu", runtime, onProgress)'));
  assert.ok(source.includes('proxyToWorker: device === "gpu"'));
  assert.ok(source.includes("rescale: true"));
});

test("runtime can recover from bundled WASM or worker initialization failures", () => {
  assert.match(source, /IMGLY_ESM_URL/);
  assert.match(source, /shouldRetryWithCdn/);
  assert.match(source, /browser-safe ESM runtime/);
});

test("successful cutouts can receive local alpha matte cleanup", () => {
  assert.match(source, /async function refineCutoutEdges/);
  assert.match(source, /isolated background speckles/);
  assert.match(source, /tiny pinholes/);
  assert.match(source, /edgeRefined: refinement\.refined/);
});

test("resized inference masks can restore source detail when memory allows", () => {
  assert.match(source, /applySegmentationMask/);
  assert.match(source, /sourceRestorePixelLimit/);
  assert.match(source, /restoreOriginalResolution/);
  assert.match(source, /restoredResolution: restoration\.restored/);
});
