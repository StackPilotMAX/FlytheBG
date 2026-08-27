function enabled(value?: string) {
  return value?.trim().toLowerCase() === "true";
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
const adsenseEnabled = enabled(process.env.NEXT_PUBLIC_ADSENSE_ENABLED ?? "true") && adsenseClientValid;

const monetagEnabled = enabled(process.env.NEXT_PUBLIC_MONETAG_ENABLED ?? "true");
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
    monetag: process.env.NEXT_PUBLIC_MONETAG_ZONE_LANDING?.trim() || "",
  },
  "remove-bg-inline-1": {
    adsense: process.env.NEXT_PUBLIC_ADSENSE_SLOT_REMOVE_BG?.trim() || "",
    monetag: process.env.NEXT_PUBLIC_MONETAG_ZONE_REMOVE_BG?.trim() || "",
  },
  "passport-inline-1": {
    adsense: process.env.NEXT_PUBLIC_ADSENSE_SLOT_PASSPORT?.trim() || "",
    monetag: process.env.NEXT_PUBLIC_MONETAG_ZONE_PASSPORT?.trim() || "",
  },
  "faq-inline-1": {
    adsense: process.env.NEXT_PUBLIC_ADSENSE_SLOT_FAQ?.trim() || "",
    monetag: process.env.NEXT_PUBLIC_MONETAG_ZONE_FAQ?.trim() || "",
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
  monetagScriptSrc,
  monetagScriptEnabled: Boolean(monetagEnabled && monetagScriptSrc),
  monetagMetaName,
  monetagMetaContent,
  monetagVerificationEnabled: Boolean(monetagMetaName && monetagMetaContent),
  adSlots,
} as const;
