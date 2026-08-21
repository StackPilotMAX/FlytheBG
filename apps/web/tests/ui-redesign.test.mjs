import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const home = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const cinematic = await readFile(new URL("../src/app/cinematic-hero.css", import.meta.url), "utf8");
const faq = await readFile(new URL("../src/components/HoverFaqList.tsx", import.meta.url), "utf8");
const polish = await readFile(new URL("../src/app/polish.css", import.meta.url), "utf8");
const remover = await readFile(new URL("../src/app/remove-background/page.tsx", import.meta.url), "utf8");

test("homepage is a single cinematic video hero", () => {
  assert.match(home, /className="cinematicHero"/);
  assert.match(home, /autoPlay muted loop playsInline/);
  assert.match(home, /hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea\.mp4/);
  assert.match(home, /Remove backgrounds\./);
  assert.match(home, /Make passport photos\./);
  assert.doesNotMatch(home, /LocalAISimulator/);
  assert.doesNotMatch(home, /landingBento/);
  assert.doesNotMatch(home, /landingFinalCta/);
});

test("hero uses the requested custom chevron mark and functional FlytheBG tabs", () => {
  assert.match(home, /M 256 256 L 128 256 L 0 128 L 128 128 Z/);
  assert.match(home, /M 256 128 L 128 128 L 0 0 L 128 0 Z/);
  assert.match(home, /href="\/remove-background"/);
  assert.match(home, /href="\/features\/passport-photo"/);
  assert.match(home, /href="\/privacy"/);
  assert.match(home, /href="\/about"/);
});

test("homepage title and local product description are preserved for search", () => {
  assert.match(home, /FlytheBG-- Free Background Remover & Passport Photo Maker/);
  assert.match(home, /locally in your browser/i);
  assert.match(remover, /aspect ratio/i);
});

test("Instrument Serif and Inter are self-hosted through next font and applied globally", () => {
  assert.match(layout, /Instrument_Serif, Inter/);
  assert.match(layout, /variable: "--font-instrument-serif"/);
  assert.match(layout, /variable: "--font-inter"/);
  assert.match(layout, /cinematic-hero\.css/);
  assert.match(cinematic, /font-family:var\(--font-inter\)/);
  assert.match(cinematic, /font-family:var\(--font-instrument-serif\)/);
});

test("cinematic hero hides the normal site chrome and remains full viewport", () => {
  assert.match(cinematic, /height:100dvh/);
  assert.match(cinematic, /height:130%/);
  assert.match(cinematic, /object-position:50% 0%/);
  assert.match(cinematic, /\.siteHeader/);
  assert.match(cinematic, /\.siteFooter/);
  assert.match(cinematic, /backdrop-filter:blur/);
});

test("premium motion layer remains wired on non-home routes", () => {
  assert.match(layout, /<MotionLayer \/>/);
});

test("FAQs on tool pages still support automatic pointer hover opening", () => {
  assert.match(faq, /onMouseEnter/);
  assert.match(faq, /onMouseLeave/);
  assert.match(faq, /event\.currentTarget\.open = true/);
  assert.match(faq, /event\.currentTarget\.open = false/);
  assert.match(polish, /\.animatedFaqList details\[open\]/);
});
