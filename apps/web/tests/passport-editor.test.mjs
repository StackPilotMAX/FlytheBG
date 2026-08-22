import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const maker = await readFile(new URL("../src/components/PassportPhotoMaker.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../src/app/features/passport-photo/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const manualCss = await readFile(new URL("../src/app/passport-manual-controls.css", import.meta.url), "utf8");

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

test("passport maker makes it explicit that the user moves the photo rather than the frame", () => {
  assert.match(maker, /Move the photo, not the frame/);
  assert.match(maker, /Fixed size box/);
  assert.match(maker, /only the photo moves inside it/);
  assert.match(maker, /nudgeMasterPhoto/);
  assert.match(maker, /centerMasterPhoto/);
  assert.match(maker, /Photo horizontal position/);
  assert.match(maker, /Photo vertical position/);
  assert.match(maker, /Photo zoom/);
  assert.match(maker, /Reset photo position/);
});

test("selected passport copies also expose direct photo-only X Y and zoom controls", () => {
  assert.match(maker, /updateSelectedPhoto/);
  assert.match(maker, /Selected photo horizontal position/);
  assert.match(maker, /Selected photo vertical position/);
  assert.match(maker, /Selected photo zoom/);
  assert.match(maker, /Use main photo position/);
  assert.match(maker, /fixed passport-size box/i);
});

test("manual controls have scoped responsive styling loaded after the pastel tool theme", () => {
  assert.match(layout, /tool-pastel-theme\.css[\s\S]*passport-manual-controls\.css/);
  assert.match(manualCss, /\.passportMaker \.photoManualControls/);
  assert.match(manualCss, /\.passportMaker \.photoMovePad/);
  assert.match(manualCss, /\.passportMaker \.selectedPhotoManual/);
  assert.match(manualCss, /FIXED PASSPORT SIZE/);
});
