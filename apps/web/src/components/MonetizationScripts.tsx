const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "ca-pub-7486274445029717";
const ADSENSE_ENABLED =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED?.trim().toLowerCase() === "true";

// Monetag is enabled unless explicitly disabled. If AdSense is enabled,
// Monetag only loads when the deployer explicitly confirms compatibility.
const MONETAG_ENABLED =
  process.env.NEXT_PUBLIC_MONETAG_ENABLED?.trim().toLowerCase() !== "false";
const MONETAG_ADSENSE_SAFE =
  process.env.NEXT_PUBLIC_MONETAG_ADSENSE_SAFE?.trim().toLowerCase() === "true";
const MONETAG_SCRIPT_SRC =
  process.env.NEXT_PUBLIC_MONETAG_SCRIPT_SRC?.trim() || "https://quge5.com/88/tag.min.js";
const MONETAG_ZONE =
  process.env.NEXT_PUBLIC_MONETAG_ZONE_LANDING?.trim() || "273485";

export function MonetizationHead() {
  const loadMonetag = MONETAG_ENABLED && (!ADSENSE_ENABLED || MONETAG_ADSENSE_SAFE);

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

      <meta name="monetag" content="5e777e0aa6ce027ca2e1a8ec1c8325b3" />

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
