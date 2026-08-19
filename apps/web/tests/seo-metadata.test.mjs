import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

const config = read("../src/lib/config.ts");
const layout = read("../src/app/layout.tsx");
const home = read("../src/app/page.tsx");
const manifest = read("../src/app/manifest.ts");
const robots = read("../src/app/robots.ts");
const backgroundGuide = read("../src/app/guides/background-removal/page.tsx");
const terms = read("../src/app/terms/page.tsx");

const publicSeoSource = [config, layout, home, manifest, robots].join("\n");

test("production SEO defaults to flythebg.com", () => {
  assert.match(config, /https:\/\/flythebg\.com/);
  assert.doesNotMatch(publicSeoSource, /flythebg\.onrender\.com/);
});

test("root metadata exposes search, social, verification, and manifest signals", () => {
  assert.match(layout, /googleBot/);
  assert.match(layout, /openGraph/);
  assert.match(layout, /twitter/);
  assert.match(layout, /NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION/);
  assert.match(layout, /manifest\.webmanifest/);
});

test("homepage has canonical metadata and WebSite structured data", () => {
  assert.match(home, /canonical: "\/"/);
  assert.match(home, /"@type": "WebSite"/);
  assert.match(home, /alternateName/);
  assert.match(home, /"@type": "SoftwareApplication"/);
});

test("manifest includes direct tool entry points", () => {
  assert.match(manifest, /shortcuts/);
  assert.match(manifest, /\/remove-background/);
  assert.match(manifest, /\/features\/passport-photo/);
});

test("public guidance no longer describes FP16-first production behavior", () => {
  assert.doesNotMatch(backgroundGuide, /FP16 first|FP16 used as the quality-first|tries IMG\.LY FP16 first/i);
  assert.doesNotMatch(terms, /FP16 first|FP16 used as the quality-first|tries IMG\.LY FP16 first/i);
});
