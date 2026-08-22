import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const pastel = await readFile(new URL("../src/app/tool-pastel-theme.css", import.meta.url), "utf8");
const uploader = await readFile(new URL("../src/components/Uploader.tsx", import.meta.url), "utf8");
const passport = await readFile(new URL("../src/components/PassportPhotoMaker.tsx", import.meta.url), "utf8");

test("pastel tool theme loads after the global light guard", () => {
  const lightIndex = layout.indexOf('light-theme-final.css');
  const pastelIndex = layout.indexOf('tool-pastel-theme.css');
  assert.ok(lightIndex >= 0);
  assert.ok(pastelIndex > lightIndex);
});

test("remove background dark working surfaces are explicitly converted", () => {
  assert.match(pastel, /\.toolPage \.toolSurface/);
  assert.match(pastel, /\.toolPage \.uploadDropZone/);
  assert.match(pastel, /\.toolPage \.imageWell\.checker/);
  assert.match(pastel, /\.toolPage \.resultActionsBar/);
  assert.match(pastel, /#e9a9c7/);
  assert.match(uploader, /className="toolSurface uploadSurface"/);
  assert.match(uploader, /className="imageWell checker"/);
});

test("passport editor uses scoped blush, lavender and white controls", () => {
  assert.match(pastel, /\.passportPage \.passportUploadCard/);
  assert.match(pastel, /\.passportPage \.modeTabs button\.active/);
  assert.match(pastel, /\.passportPage \.passportPanel/);
  assert.match(pastel, /\.passportPage \.portraitEditor/);
  assert.match(pastel, /\.passportPage \.perPhotoEditor/);
  assert.match(pastel, /\.passportPage \.sheetCanvasShell canvas/);
  assert.match(passport, /className="passportUploadCard"/);
  assert.match(passport, /className="perPhotoEditor"/);
});

test("pastel overrides stay scoped to the two tool pages", () => {
  assert.doesNotMatch(pastel, /\.featurePage \.passportPanel/);
  assert.doesNotMatch(pastel, /body \.(?:passportPanel|toolSurface)/);
  assert.match(pastel, /\.toolPage,/);
  assert.match(pastel, /\.passportPage\{/);
});
