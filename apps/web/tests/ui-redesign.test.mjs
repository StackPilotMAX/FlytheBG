import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const hero = await readFile(new URL("../src/components/GalaxyWorld.tsx", import.meta.url), "utf8");
const home = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const remover = await readFile(new URL("../src/app/remove-background/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");

test("homepage hero contains the animated Earth entry point", () => {
  assert.match(hero, /className="earthLink"/);
  assert.match(hero, /Click Earth to start removing/);
  assert.match(hero, /Any normal ratio/);
});

test("homepage and remover describe aspect-ratio preservation", () => {
  assert.match(home, /preserves the source aspect ratio/i);
  assert.match(remover, /preserves the source aspect ratio/i);
});

test("premium motion layer is wired after the base production stylesheet", () => {
  assert.match(layout, /import "\.\/production-ui\.css";\s*import "\.\/redesign\.css";/);
  assert.match(layout, /<MotionLayer \/>/);
});

test("redesign copy does not reintroduce the retired FP16 automatic fallback", () => {
  assert.ok(!hero.includes("FP16 automatic fallback"));
  assert.ok(!home.includes("FP16 automatic fallback"));
  assert.ok(!remover.includes("FP16 automatic fallback"));
});
