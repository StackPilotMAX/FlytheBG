import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const sourceDir = join(root, "media-src");
const outputDir = join(root, "public", "media");
const parts = readdirSync(sourceDir)
  .filter((name) => name.startsWith("flythebg-car-demo.b64."))
  .sort();

if (!parts.length) throw new Error("Missing FlytheBG demo video source chunks.");

const encoded = parts.map((name) => readFileSync(join(sourceDir, name), "utf8").trim()).join("");
const bytes = Buffer.from(encoded, "base64");
if (bytes.length < 20_000) throw new Error("FlytheBG demo video materialized to an unexpectedly small file.");

mkdirSync(outputDir, { recursive: true });
writeFileSync(join(outputDir, "flythebg-car-demo.mp4"), bytes);
console.log(`Materialized landing demo video: ${bytes.length} bytes from ${parts.length} chunks.`);
