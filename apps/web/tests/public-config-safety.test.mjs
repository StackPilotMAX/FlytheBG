import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const config = await readFile(new URL("../src/lib/config.ts", import.meta.url), "utf8");
const envExample = await readFile(new URL("../../../.env.example", import.meta.url), "utf8");
const gitignore = await readFile(new URL("../../../.gitignore", import.meta.url), "utf8");

test("public contact information is opt-in instead of hard-coded", () => {
  assert.match(config, /NEXT_PUBLIC_CONTACT_EMAIL/);
  assert.match(config, /configuredContactEmail/);
  assert.match(config, /\|\| ""/);
  assert.doesNotMatch(config, /@outlook\.com|@gmail\.com|@yahoo\.com/i);
});

test("public env template warns that NEXT_PUBLIC values are browser-visible", () => {
  assert.match(envExample, /NEXT_PUBLIC_CONTACT_EMAIL=/);
  assert.match(envExample, /browser-visible/i);
  assert.match(envExample, /Do not place passwords, API secrets/i);
});

test("common local credential files are ignored", () => {
  assert.match(gitignore, /^\.env\*/m);
  assert.match(gitignore, /^\.npmrc$/m);
  assert.match(gitignore, /^\.netrc$/m);
  assert.match(gitignore, /^\*\.pem$/m);
  assert.match(gitignore, /^\*\.key$/m);
});
