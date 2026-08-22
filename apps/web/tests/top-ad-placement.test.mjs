import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const home = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const remover = await readFile(new URL("../src/app/remove-background/page.tsx", import.meta.url), "utf8");
const passport = await readFile(new URL("../src/app/features/passport-photo/page.tsx", import.meta.url), "utf8");
const faq = await readFile(new URL("../src/app/faq/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/app/top-ad-placement.css", import.meta.url), "utf8");

function expectBetween(source, needle, beforeNeedle, afterNeedle) {
  const index = source.indexOf(needle);
  const before = source.indexOf(beforeNeedle);
  const after = source.indexOf(afterNeedle);
  assert.ok(index >= 0, `${needle} must exist`);
  assert.ok(before >= 0 && after >= 0, "placement anchors must exist");
  assert.ok(index > before && index < after, `${needle} must be between the expected top-of-page anchors`);
}

test("homepage ad is visible in the hero before the primary hero content", () => {
  expectBetween(home, "landing-inline-1", "cinematicNav", "cinematicHeroContent");
  assert.equal(home.match(/landing-inline-1/g)?.length, 1);
  assert.match(home, /className="landingHeroAd"/);
});

test("tool ads sit below hero copy and above the editors", () => {
  expectBetween(remover, "remove-bg-inline-1", "pageHeroGrid", "toolWorkspace");
  expectBetween(passport, "passport-inline-1", "pageHeroGrid", "passportWorkspace");
  assert.equal(remover.match(/remove-bg-inline-1/g)?.length, 1);
  assert.equal(passport.match(/passport-inline-1/g)?.length, 1);
  assert.match(remover, /className="shell pageHeroAd"/);
  assert.match(passport, /className="shell pageHeroAd"/);
});

test("FAQ ad is above the general accordion rather than after it", () => {
  expectBetween(faq, "faq-inline-1", "narrowHero", "general-faq");
  assert.equal(faq.match(/faq-inline-1/g)?.length, 1);
});

test("top ad styling is responsive and loaded after the existing theme layers", () => {
  assert.match(layout, /passport-manual-controls\.css[\s\S]*top-ad-placement\.css/);
  assert.match(css, /\.landingHeroAd/);
  assert.match(css, /\.pageHeroAd/);
  assert.match(css, /@media \(max-width:720px\)/);
  assert.doesNotMatch(css, /position:\s*(fixed|sticky)/);
});
