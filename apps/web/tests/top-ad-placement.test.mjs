import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const home = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const journey = await readFile(new URL("../src/components/FlyTheBGJourney.tsx", import.meta.url), "utf8");
const remover = await readFile(new URL("../src/app/remove-background/page.tsx", import.meta.url), "utf8");
const passport = await readFile(new URL("../src/app/features/passport-photo/page.tsx", import.meta.url), "utf8");
const faq = await readFile(new URL("../src/app/faq/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const css = await readFile(new URL("../src/app/top-ad-placement.css", import.meta.url), "utf8");

test("homepage keeps the cinematic hero before FAQ and privacy copy", () => {
  assert.ok(home.indexOf("<FlyTheBGJourney />") < home.indexOf("<LandingFAQ />"));
  assert.ok(home.indexOf("<LandingFAQ />") < home.indexOf("aiDiscoverySummary"));
  assert.match(journey, /className="flyJourneyHome/);
  assert.match(journey, /className="flyJourneyHero/);
});

test("tool ads sit below hero copy and above the editors", () => {
  assert.ok(remover.indexOf("remove-bg-inline-1") >= 0);
  assert.ok(passport.indexOf("passport-inline-1") >= 0);
  assert.match(remover, /className="shell pageHeroAd"/);
  assert.match(passport, /className="shell pageHeroAd"/);
});

test("FAQ ad is above the general accordion rather than after it", () => {
  const index = faq.indexOf("faq-inline-1");
  assert.ok(index >= 0);
  assert.ok(index < faq.indexOf("general-faq"));
});

test("top ad styling is responsive and loaded after the existing theme layers", () => {
  assert.match(layout, /passport-manual-controls\.css[\s\S]*top-ad-placement\.css/);
  assert.match(css, /\.landingHeroAd/);
  assert.match(css, /\.pageHeroAd/);
  assert.match(css, /@media \(max-width:720px\)/);
  assert.doesNotMatch(css, /position:\s*(fixed|sticky)/);
});
