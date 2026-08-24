const ADSENSE_CLIENT = "ca-pub-7486274445029717";

export function MonetizationHead() {
  return (
    <>
      <meta name="google-adsense-account" content={ADSENSE_CLIENT} />
      <script
        async
        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
        crossOrigin="anonymous"
      />
    </>
  );
}

export function MonetizationScripts() {
  // AdSense is the only advertising provider. Auto Ads uses the global
  // publisher script in <head>; no second ad-network script is injected.
  return null;
}
