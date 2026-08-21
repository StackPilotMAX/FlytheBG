import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const publicDir = join(process.cwd(), "public");
const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
const publisher = client.replace(/^ca-/, "");
const monetagSellerLines = (process.env.MONETAG_ADS_TXT_LINES?.trim() || "")
  .replace(/\\n/g, "\n")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

const lines = [];
if (/^pub-\d{16}$/.test(publisher)) {
  lines.push(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0`);
}
lines.push(...monetagSellerLines);

const body = lines.length
  ? `${Array.from(new Set(lines)).join("\n")}\n`
  : "# Advertising sellers are not configured for this build.\n";

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "ads.txt"), body, "utf8");
console.log(lines.length ? `Prepared ads.txt with ${lines.length} seller line(s).` : "Prepared non-advertising ads.txt placeholder.");
