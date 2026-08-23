import Script from "next/script";
import { monetizationConfig } from "@/lib/monetization";

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
      {monetizationConfig.monetagVerificationEnabled && (
        <meta
          name={monetizationConfig.monetagMetaName}
          content={monetizationConfig.monetagMetaContent}
        />
      )}
    </>
  );
}

export function MonetizationScripts() {
  return (
    <>
      {monetizationConfig.monetagScriptEnabled && (
        <Script
          id="flythebg-monetag"
          strategy="lazyOnload"
          src={monetizationConfig.monetagScriptSrc}
        />
      )}
    </>
  );
}
