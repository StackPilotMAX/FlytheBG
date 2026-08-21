import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const maker = await readFile(new URL("../src/components/PassportPhotoMaker.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../src/app/features/passport-photo/page.tsx", import.meta.url), "utf8");

test("passport sheet supports independent per-copy framing", () => {
  assert.match(maker, /individualFrames/);
  assert.match(maker, /selectedCopy/);
  assert.match(maker, /onSheetPointerDown/);
  assert.match(maker, /onSheetPointerMove/);
  assert.match(maker, /onSheetWheel/);
  assert.match(maker, /nudgeSelected/);
  assert.match(maker, /Reset selected/);
});

test("passport export uses the frame selected for each copy", () => {
  assert.match(maker, /positions\.forEach\(\(position, index\)/);
  assert.match(maker, /frameFor\(index\)/);
});

test("passport tool exposes direct print and PNG download without clearing edits", () => {
  assert.match(maker, /Print directly at 100%/);
  assert.match(maker, /Download PNG/);
  const downloadFunction = maker.slice(maker.indexOf("async function downloadSheet"), maker.indexOf("async function printSheet"));
  assert.doesNotMatch(downloadFunction, /releaseWorkingPhoto/);
});

test("passport page uses the shared animated FAQ component", () => {
  assert.match(page, /HoverFaqList/);
  assert.match(page, /manually move each passport photo/i);
  assert.match(page, /Print directly at 100%/);
  assert.match(page, /Download PNG/);
});
