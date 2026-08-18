import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const publicDir = join(process.cwd(), "public");
const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
const publisher = client.replace(/^ca-/, "");
const body = /^pub-\d{16}$/.test(publisher)
  ? `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`
  : "# AdSense is not configured for this build.\n";

mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, "ads.txt"), body, "utf8");
console.log(/^pub-\d{16}$/.test(publisher) ? "Prepared public AdSense seller file." : "Prepared non-AdSense seller placeholder.");
