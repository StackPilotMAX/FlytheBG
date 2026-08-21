import Script from "next/script";
import { monetizationConfig } from "@/lib/monetization";

export function MonetizationHead() {
  return (
    <>
      {monetizationConfig.adsenseClientValid && (
        <meta name="google-adsense-account" content={monetizationConfig.adsenseClient} />
      )}
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
      {monetizationConfig.adsenseEnabled && (
        <Script
          id="flythebg-adsense"
          async
          strategy="afterInteractive"
          crossOrigin="anonymous"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${monetizationConfig.adsenseClient}`}
        />
      )}

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
