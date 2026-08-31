function enabled(value?: string, defaultValue = false) {
  if (value === undefined || value.trim() === "") return defaultValue;
  return value.trim().toLowerCase() === "true";
}

function validHttpsUrl(value?: string) {
  const candidate = value?.trim() || "";
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "ca-pub-7486274445029717";
const adsenseClientValid = /^ca-pub-\d{16}$/.test(adsenseClient);
const adsenseEnabled = enabled(process.env.NEXT_PUBLIC_ADSENSE_ENABLED, false) && adsenseClientValid;

// Monetag is the fast-start fallback for FlytheBG. It can still be explicitly
// disabled with NEXT_PUBLIC_MONETAG_ENABLED=false when another ad network is used.
const monetagEnabled = enabled(process.env.NEXT_PUBLIC_MONETAG_ENABLED, true);
const monetagAdsenseSafe = enabled(process.env.NEXT_PUBLIC_MONETAG_ADSENSE_SAFE, false);
const monetagScriptSrc = validHttpsUrl(
  process.env.NEXT_PUBLIC_MONETAG_SCRIPT_SRC?.trim() ||
    "https://quge5.com/88/tag.min.js",
);
const monetagMetaName = process.env.NEXT_PUBLIC_MONETAG_VERIFICATION_META_NAME?.trim() || "monetag";
const monetagMetaContent =
  process.env.NEXT_PUBLIC_MONETAG_VERIFICATION_META_CONTENT?.trim() ||
  "5e777e0aa6ce027ca2e1a8ec1c8325b3";

const adSlots = {
  "landing-inline-1": {
    adsense: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LANDING?.trim() || "",
    monetag: process.env.NEXT_PUBLIC_MONETAG_ZONE_LANDING?.trim() || "273485",
  },
  "remove-bg-inline-1": {
    adsense: process.env.NEXT_PUBLIC_ADSENSE_SLOT_REMOVE_BG?.trim() || "",
    monetag: process.env.NEXT_PUBLIC_MONETAG_ZONE_REMOVE_BG?.trim() || "273485",
  },
  "passport-inline-1": {
    adsense: process.env.NEXT_PUBLIC_ADSENSE_SLOT_PASSPORT?.trim() || "",
    monetag: process.env.NEXT_PUBLIC_MONETAG_ZONE_PASSPORT?.trim() || "273485",
  },
  "faq-inline-1": {
    adsense: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FAQ?.trim() || "",
    monetag: process.env.NEXT_PUBLIC_MONETAG_ZONE_FAQ?.trim() || "273485",
  },
} as const;

export type AdPlacementName = keyof typeof adSlots;

export function getAdSlotConfig(slot: string) {
  return adSlots[slot as AdPlacementName] ?? { adsense: "", monetag: "" };
}

export const monetizationConfig = {
  adsenseClient,
  adsenseClientValid,
  adsenseEnabled,
  monetagEnabled,
  monetagAdsenseSafe,
  monetagScriptSrc,
  monetagScriptEnabled: Boolean(monetagEnabled && (!adsenseEnabled || monetagAdsenseSafe) && monetagScriptSrc),
  monetagMetaName,
  monetagMetaContent,
  monetagVerificationEnabled: Boolean(monetagMetaName && monetagMetaContent),
  adSlots,
} as const;
