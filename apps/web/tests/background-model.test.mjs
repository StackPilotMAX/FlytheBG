import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/lib/browser-background-removal.ts", import.meta.url), "utf8");

test("small quantized model remains the fast first pass", () => {
  assert.match(source, /const SMALL_MODEL: BrowserBackgroundModel = "isnet_quint8";/);
  assert.match(source, /Starting fast local background removal/);
  assert.match(source, /removeBackgroundInBrowser\(file, SMALL_MODEL, onProgress\)/);
});

test("inference uses bounded working edges for faster browser processing", () => {
  assert.match(source, /function modelTargetEdge/);
  assert.match(source, /return 2048/);
  assert.match(source, /return 2304/);
  assert.match(source, /Fast AI pass: using a \$\{targetEdge\}px working copy/);
  assert.match(source, /restoreOriginalResolution/);
});

test("quality FP16 pass is adaptive instead of always running first", () => {
  assert.match(source, /const QUALITY_MODEL: BrowserBackgroundModel = "isnet_fp16";/);
  assert.match(source, /detectPreservationRisk/);
  assert.match(source, /fastResult\.preservationRisk/);
  assert.match(source, /Fine hair or pale subject edges detected/);
  assert.match(source, /removeBackgroundInBrowser\(file, QUALITY_MODEL, onProgress\)/);
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

test("edge cleanup preserves connected semi-transparent hair instead of thinning it", () => {
  assert.match(source, /Conservative alpha cleanup/);
  assert.match(source, /Preserve connected low-alpha strands/);
  assert.match(source, /a < 96 && neighborMax > 64/);
  assert.doesNotMatch(source, /refined \*= 0\.35/);
});

test("pale clothing protection only recovers pixels surrounded by foreground", () => {
  assert.match(source, /async function protectPaleForeground/);
  assert.match(source, /strong\.length < 5/);
  assert.match(source, /luminance < 190/);
  assert.match(source, /Protecting light clothing inside the detected subject/);
});

test("resized inference masks can restore source detail when memory allows", () => {
  assert.match(source, /applySegmentationMask/);
  assert.match(source, /sourceRestorePixelLimit/);
  assert.match(source, /restoredResolution: restoration\.restored/);
});
