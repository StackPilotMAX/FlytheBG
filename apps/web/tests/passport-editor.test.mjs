import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const maker = await readFile(new URL("../src/components/PassportPhotoMaker.tsx", import.meta.url), "utf8");
const page = await readFile(new URL("../src/app/features/passport-photo/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const manualCss = await readFile(new URL("../src/app/passport-manual-controls.css", import.meta.url), "utf8");

test("passport sheet supports independent per-copy crop frames", () => {
  assert.match(maker, /individualFrames/);
  assert.match(maker, /selectedCopy/);
  assert.match(maker, /onSheetPointerDown/);
  assert.match(maker, /updateSelectedFrame/);
  assert.match(maker, /nudgeSelectedFrame/);
  assert.match(maker, /Reset selected crop/);
});

test("passport export uses the crop frame selected for each copy", () => {
  assert.match(maker, /positions\.forEach\(\(position, index\)/);
  assert.match(maker, /frameFor\(index\)/);
  assert.match(maker, /- frame\.shiftX/);
  assert.match(maker, /- frame\.shiftY/);
});

test("passport tool exposes direct print and PNG download without clearing edits", () => {
  assert.match(maker, /Print directly at 100%/);
  assert.match(maker, /Download PNG/);
  const downloadFunction = maker.slice(maker.indexOf("async function downloadSheet"), maker.indexOf("async function printSheet"));
  assert.doesNotMatch(downloadFunction, /releaseWorkingPhoto/);
});

test("passport page explains that the crop frame moves over a stationary photo", () => {
  assert.match(page, /crop frame without moving the photo/i);
  assert.match(page, /photo stays stationary/i);
  assert.match(page, /Print directly at 100%/);
  assert.match(page, /Download PNG/);
});

test("passport maker renders a stationary source photo with a draggable crop frame overlay", () => {
  assert.match(maker, /Move the frame over the photo/);
  assert.match(maker, /source photo does not move/);
  assert.match(maker, /className="framePhotoStage"/);
  assert.match(maker, /className="movableCropFrame"/);
  assert.match(maker, /Stationary source for passport crop/);
  assert.match(maker, /onMasterFramePointerDown/);
  assert.match(maker, /nudgeMasterFrame/);
  assert.match(maker, /Frame horizontal position/);
  assert.match(maker, /Frame vertical position/);
  assert.match(maker, /Crop frame zoom/);
  assert.match(maker, /Reset crop frame/);
});

test("selected passport copies expose crop-frame X Y and zoom controls", () => {
  assert.match(maker, /Selected frame horizontal position/);
  assert.match(maker, /Selected frame vertical position/);
  assert.match(maker, /Selected crop frame zoom/);
  assert.match(maker, /Use main crop frame/);
  assert.match(maker, /Custom crop frame/);
});

test("manual frame controls have scoped responsive styling loaded after the pastel tool theme", () => {
  assert.match(layout, /tool-pastel-theme\.css[\s\S]*passport-manual-controls\.css/);
  assert.match(manualCss, /\.passportMaker \.framePhotoStage/);
  assert.match(manualCss, /\.passportMaker \.movableCropFrame/);
  assert.match(manualCss, /\.passportMaker \.frameManualControls/);
  assert.match(manualCss, /\.passportMaker \.selectedFrameManual/);
});
