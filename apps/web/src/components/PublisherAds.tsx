import Script from "next/script";

export function PublisherAds() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT?.trim() || "";
  if (!/^ca-pub-\d{16}$/.test(client)) return null;

  return (
    <Script
      id="flythebg-publisher-ads"
      async
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(client)}`}
    />
  );
}
