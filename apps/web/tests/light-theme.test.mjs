import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const lightTheme = await readFile(new URL("../src/app/light-theme-final.css", import.meta.url), "utf8");

test("final light theme is loaded after legacy styles", () => {
  const refinementsIndex = layout.indexOf('import "./theme-refinements.css"');
  const finalIndex = layout.indexOf('import "./light-theme-final.css"');
  assert.ok(refinementsIndex >= 0);
  assert.ok(finalIndex > refinementsIndex);
});

test("legacy dark root tokens are replaced with the video light palette", () => {
  assert.match(lightTheme, /--bg:#d9d5ef/);
  assert.match(lightTheme, /--surface:rgba\(255,255,255,\.70\)/);
  assert.match(lightTheme, /--text:#39345a/);
  assert.match(lightTheme, /color-scheme:light/);
  assert.match(lightTheme, /\.trustSection,[\s\S]*\.toolWorkspace/);
  assert.match(lightTheme, /\.pageHeroAside li,[\s\S]*background:rgba\(255,255,255,\.58\)!important/);
  assert.match(lightTheme, /\.secondaryButton,[\s\S]*background:rgba\(255,255,255,\.76\)!important/);
});
