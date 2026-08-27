const ADSENSE_CLIENT =
  process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "ca-pub-7486274445029717";
const ADSENSE_ENABLED =
  process.env.NEXT_PUBLIC_ADSENSE_ENABLED?.trim().toLowerCase() !== "false";

const MONETAG_ENABLED =
  process.env.NEXT_PUBLIC_MONETAG_ENABLED?.trim().toLowerCase() === "true";
const MONETAG_ADSENSE_SAFE =
  process.env.NEXT_PUBLIC_MONETAG_ADSENSE_SAFE?.trim().toLowerCase() === "true";

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
          src="https://quge5.com/88/tag.min.js"
          data-zone="273485"
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
