import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const publicDir = join(process.cwd(), "public");
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "ca-pub-7486274445029717";
const adsenseEnabled = process.env.NEXT_PUBLIC_ADSENSE_ENABLED?.trim().toLowerCase() !== "false";
const publisher = adsenseClient.replace(/^ca-/, "");

const monetagSellerLines = (process.env.MONETAG_ADS_TXT_LINES?.trim() || "")
  .replace(/\\n/g, "\n")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

const lines = [];
if (adsenseEnabled && /^pub-\d{16}$/.test(publisher)) {
  lines.push(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0`);
}
lines.push(...monetagSellerLines);

const body = lines.length
  ? `${Array.from(new Set(lines)).join("\n")}\n`
  : "# Advertising sellers are not configured for this build.\n";

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "ads.txt"), body, "utf8");

// Sectigo/Comodo HTTP/HTTPS file validation must survive every Netlify build.
const validationDir = join(publicDir, ".well-known", "pki-validation");
mkdirSync(validationDir, { recursive: true });
writeFileSync(
  join(validationDir, "29D349B48D40CDF91E0BDE446793DAC2.txt"),
  "509CAE296EDDA62148A696DAB85CE9A2220B7CE598C8E6F7D727C9DF21C8C3A9\ncomodoca.com\nab6be3e1c5e9cb2\n",
  "utf8",
);

console.log(lines.length ? `Prepared ads.txt with ${lines.length} seller line(s).` : "Prepared non-advertising ads.txt placeholder.");
console.log("Prepared Sectigo/Comodo SSL validation file.");
