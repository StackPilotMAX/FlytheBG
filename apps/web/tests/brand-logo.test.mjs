import test from "node:test";
import assert from "node:assert/strict";
import { access, readdir, readFile } from "node:fs/promises";

const srcRoot = new URL("../src/", import.meta.url);
const realLogo = new URL("../public/brand/flythebg-mark.svg", import.meta.url);
const legacyAssets = [
  new URL("../public/brand/flythebg-lockup.svg", import.meta.url),
  new URL("../public/brand/flythebg-mark-mono.svg", import.meta.url),
  new URL("../public/icon.svg", import.meta.url),
];

async function collectSource(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let output = "";
  for (const entry of entries) {
    const url = new URL(`${entry.name}${entry.isDirectory() ? "/" : ""}`, dir);
    if (entry.isDirectory()) output += await collectSource(url);
    else if (/\.(?:ts|tsx|css)$/.test(entry.name)) output += `\n${await readFile(url, "utf8")}`;
  }
  return output;
}

test("the retained FlytheBG logo is the original embedded artwork rather than drawn SVG geometry", async () => {
  const logo = await readFile(realLogo, "utf8");
  assert.match(logo, /<image\b/);
  assert.match(logo, /data:image\/webp;base64,/);
  assert.doesNotMatch(logo, /<path\b/);
  assert.doesNotMatch(logo, /<text\b/);
});

test("production source uses only the real FlytheBG artwork asset", async () => {
  const source = await collectSource(srcRoot);
  assert.match(source, /\/brand\/flythebg-mark\.svg/);
  assert.doesNotMatch(source, /flythebg-lockup\.svg/);
  assert.doesNotMatch(source, /flythebg-mark-mono\.svg/);
  assert.doesNotMatch(source, /src=["']\/icon\.svg["']/);
  assert.doesNotMatch(source, /<svg\b[^>]*aria-label=["']FlytheBG/i);
});

test("legacy code-drawn logo assets are removed from public output", async () => {
  for (const asset of legacyAssets) {
    await assert.rejects(access(asset));
  }
});
