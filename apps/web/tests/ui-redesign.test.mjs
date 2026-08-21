import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const hero = await readFile(new URL("../src/components/LocalAISimulator.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const remover = await readFile(new URL("../src/app/remove-background/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const faq = await readFile(new URL("../src/components/HoverFaqList.tsx", import.meta.url), "utf8");

test("homepage hero is the interactive local AI layer simulator", () => {
  assert.match(hero, /Separation Depth/);
  assert.match(hero, /Front View/);
  assert.match(hero, /3D Exploded View/);
  assert.match(hero, /OrbitControls/);
  assert.doesNotMatch(home, /GalaxyWorld/);
});

test("homepage and remover describe aspect-ratio preservation", () => {
  assert.match(home, /aspect ratio/i);
  assert.match(remover, /aspect ratio/i);
});

test("Gen Z motion layer is wired after the base production styles", () => {
  assert.match(layout, /import "\.\/production-ui\.css";[\s\S]*import "\.\/genz\.css";/);
  assert.match(layout, /<MotionLayer \/>/);
});

test("FAQs support automatic pointer hover opening without breaking native details", () => {
  assert.match(faq, /onMouseEnter/);
  assert.match(faq, /onMouseLeave/);
  assert.match(faq, /event\.currentTarget\.open = true/);
});

test("homepage includes public-domain before and after sample treatment", () => {
  assert.match(home, /Public-domain\/CC0/);
  assert.match(home, /sampleBeforeAfter/);
  assert.match(home, /Wikimedia Commons/);
});
