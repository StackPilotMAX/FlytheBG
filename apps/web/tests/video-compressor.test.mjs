import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const settings = read("../src/lib/video-compressor/settings.ts");
const engine = read("../src/lib/video-compressor/encoder.ts");
const capabilities = read("../src/lib/video-compressor/capabilities.ts");
const page = read("../src/app/tools/video-compressor/page.tsx");
const component = read("../src/components/video-compressor/VideoCompressor.tsx");
const packageJson = read("../package.json");

 test("video compressor exposes all required resolution presets and never upscales", () => {
  for (const preset of ["original", "1080p", "720p", "480p", "360p"]) assert.match(settings, new RegExp(`\\\"${preset}\\\"`));
  assert.match(settings, /longestSide <= limit/);
  assert.match(settings, /scale = limit \/ longestSide/);
});

test("target-size mode uses measured duration and bounded bitrate iteration", () => {
  assert.match(settings, /targetBytesValue \* 8/);
  assert.match(settings, /durationSeconds/);
  assert.match(engine, /MAX_TARGET_PASSES = 3/);
  assert.match(engine, /result\.output\.size \/ target/);
});

test("compression stays browser-local and uses no upload endpoint", () => {
  assert.match(engine, /new BlobSource\(file\)/);
  assert.match(engine, /new Mp4OutputFormat/);
  assert.doesNotMatch(engine, /fetch\(/);
  assert.doesNotMatch(engine, /XMLHttpRequest/);
  assert.match(component, /Your source stays in your browser/);
});

test("capability detection checks WebCodecs and H.264", () => {
  assert.match(capabilities, /VideoEncoder/);
  assert.match(capabilities, /VideoFrame/);
  assert.match(capabilities, /getEncodableVideoCodecs/);
  assert.match(capabilities, /\[\"avc\"\]/);
});

test("output is advertised as real H.264 MP4 and has a downloadable filename", () => {
  assert.match(engine, /type: \"video\/mp4\"/);
  assert.match(engine, /-compressed\.mp4/);
  assert.match(component, /download=\{outputName\}/);
});

test("route has canonical SEO metadata and the tools catalog links to it", () => {
  assert.match(page, /\/tools\/video-compressor/);
  assert.match(page, /Free Video Compressor/);
  const features = read("../src/app/features/page.tsx");
  assert.match(features, /\/tools\/video-compressor/);
});

test("Mediabunny is the browser media dependency", () => {
  assert.match(packageJson, /\"mediabunny\": \"\^1\.55\.3\"/);
  assert.doesNotMatch(packageJson, /ffmpeg/i);
});
