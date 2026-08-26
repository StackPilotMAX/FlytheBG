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

const monetagEnabled = enabled(process.env.NEXT_PUBLIC_MONETAG_ENABLED);
const monetagScriptSrc = validHttpsUrl(process.env.NEXT_PUBLIC_MONETAG_SCRIPT_SRC);
const monetagMetaName = process.env.NEXT_PUBLIC_MONETAG_VERIFICATION_META_NAME?.trim() || "";
const monetagMetaContent = process.env.NEXT_PUBLIC_MONETAG_VERIFICATION_META_CONTENT?.trim() || "";

const adSlots = {
  "landing-inline-1": process.env.NEXT_PUBLIC_MONETAG_ZONE_LANDING?.trim() || "",
  "remove-bg-inline-1": process.env.NEXT_PUBLIC_MONETAG_ZONE_REMOVE_BG?.trim() || "",
  "passport-inline-1": process.env.NEXT_PUBLIC_MONETAG_ZONE_PASSPORT?.trim() || "",
  "faq-inline-1": process.env.NEXT_PUBLIC_MONETAG_ZONE_FAQ?.trim() || "",
} as const;

export type AdPlacementName = keyof typeof adSlots;

export function getAdSlotConfig(slot: string) {
  return adSlots[slot as AdPlacementName] ?? "";
}

export const monetizationConfig = {
  monetagEnabled,
  monetagScriptSrc,
  monetagScriptEnabled: Boolean(monetagEnabled && monetagScriptSrc),
  monetagMetaName,
  monetagMetaContent,
  monetagVerificationEnabled: Boolean(monetagMetaName && monetagMetaContent),
  adSlots,
} as const;
