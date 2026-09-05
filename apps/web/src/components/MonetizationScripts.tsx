const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
const ADSENSE_ENABLED =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED?.trim().toLowerCase() === "true" && Boolean(ADSENSE_CLIENT);

// Production monetization is opt-in from Render environment variables.
// Keep provider IDs and zones out of source control; NEXT_PUBLIC_* values are
// still browser-visible once enabled, so they must never contain private keys.
const MONETAG_ENABLED =
  process.env.NEXT_PUBLIC_MONETAG_ENABLED?.trim().toLowerCase() === "true";
const MONETAG_ADSENSE_SAFE =
  process.env.NEXT_PUBLIC_MONETAG_ADSENSE_SAFE?.trim().toLowerCase() === "true";
const MONETAG_SCRIPT_SRC = process.env.NEXT_PUBLIC_MONETAG_SCRIPT_SRC?.trim() || "";
const MONETAG_ZONE = process.env.NEXT_PUBLIC_MONETAG_ZONE_LANDING?.trim() || "";

export function MonetizationHead() {
  const loadMonetag =
    MONETAG_ENABLED &&
    MONETAG_SCRIPT_SRC &&
    MONETAG_ZONE &&
    (!ADSENSE_ENABLED || MONETAG_ADSENSE_SAFE);

  return (
    <>
      {ADSENSE_ENABLED ? (
        <>
          <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
          />
        </>
      ) : null}

      {loadMonetag ? (
        <script
          src={MONETAG_SCRIPT_SRC}
          data-zone={MONETAG_ZONE}
          async
          data-cfasync="false"
        />
      ) : null}
    </>
  );
}

export function MonetizationScripts() {
  return null;
}
