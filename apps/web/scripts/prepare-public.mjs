import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const publicDir = join(process.cwd(), "public");
const monetagSellerLines = (process.env.MONETAG_ADS_TXT_LINES?.trim() || "")
  .replace(/\\n/g, "\n")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

const body = monetagSellerLines.length
  ? `${Array.from(new Set(monetagSellerLines)).join("\n")}\n`
  : "# Monetag seller lines are not configured for this build.\n";

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "ads.txt"), body, "utf8");
console.log(
  monetagSellerLines.length
    ? `Prepared ads.txt with ${monetagSellerLines.length} Monetag seller line(s).`
    : "Prepared Monetag ads.txt placeholder.",
);
