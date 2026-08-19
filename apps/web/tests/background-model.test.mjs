import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../src/lib/browser-background-removal.ts", import.meta.url), "utf8");

test("automatic background removal defaults to the quantized model", () => {
  assert.match(source, /const DEFAULT_MODEL: BrowserBackgroundModel = "isnet_quint8";/);
});

test("automatic background removal does not directly retry the FP16 model", () => {
  const automaticPath = source.slice(source.indexOf("export async function removeBackgroundWithFallback"));
  assert.ok(automaticPath.includes("removeBackgroundInBrowser(file, DEFAULT_MODEL, onProgress)"));
  assert.ok(!automaticPath.includes('removeBackgroundInBrowser(file, "isnet_fp16"'));
});

test("small model prefers WebGPU and retries the same model on CPU", () => {
  assert.ok(source.includes('runModel(input, model, "gpu", onProgress)'));
  assert.ok(source.includes('runModel(input, model, "cpu", onProgress)'));
  assert.ok(source.includes("proxyToWorker: true"));
});

test("result uses the IMG.LY cutout directly without the old edge expansion", () => {
  assert.ok(!source.includes("preserveFineEdges"));
  assert.ok(source.includes("return { blob: cutout, model, modelLabel, edgeRefined: false }"));
});
