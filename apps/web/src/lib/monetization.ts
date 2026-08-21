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

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
const adsenseClientValid = /^ca-pub-\d{16}$/.test(adsenseClient);
const adsenseEnabled = enabled(process.env.NEXT_PUBLIC_ADSENSE_ENABLED) && adsenseClientValid;

const monetagEnabled = enabled(process.env.NEXT_PUBLIC_MONETAG_ENABLED);
const monetagAdsenseSafe = enabled(process.env.NEXT_PUBLIC_MONETAG_ADSENSE_SAFE);
const monetagScriptSrc = validHttpsUrl(process.env.NEXT_PUBLIC_MONETAG_SCRIPT_SRC);
const monetagMetaName = process.env.NEXT_PUBLIC_MONETAG_VERIFICATION_META_NAME?.trim() || "";
const monetagMetaContent = process.env.NEXT_PUBLIC_MONETAG_VERIFICATION_META_CONTENT?.trim() || "";

// When AdSense is active, Monetag is deliberately suppressed unless the owner
// explicitly confirms the selected Monetag format is AdSense-safe. Do not use
// OnClick/pop-under formats together with AdSense.
const monetagScriptEnabled = Boolean(
  monetagEnabled && monetagScriptSrc && (!adsenseEnabled || monetagAdsenseSafe),
);

export const monetizationConfig = {
  adsenseClient,
  adsenseClientValid,
  adsenseEnabled,
  monetagEnabled,
  monetagAdsenseSafe,
  monetagScriptSrc,
  monetagScriptEnabled,
  monetagMetaName,
  monetagMetaContent,
  monetagVerificationEnabled: Boolean(monetagMetaName && monetagMetaContent),
} as const;
