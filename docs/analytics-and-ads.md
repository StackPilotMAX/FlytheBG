# Analytics and Google AdSense production setup

FlytheBG's core image tools do not require advertising cookies to perform background removal, cropping, or passport-photo sheet generation. Google AdSense support is integrated separately from the image-processing path.

## Production publisher

The production AdSense publisher ID supplied by the FlytheBG operator is:

```text
pub-7486274445029717
```

The matching AdSense client ID is:

```text
ca-pub-7486274445029717
```

These identifiers are intentionally public. They are **not passwords, API keys, or private secrets**.

The production root `ads.txt` record must be:

```text
google.com, pub-7486274445029717, DIRECT, f08c47fec0942fa0
```

FlytheBG generates this record from `NEXT_PUBLIC_ADSENSE_CLIENT`. The root layout uses the same environment variable to load Google's AdSense script.

## Railway web variable

Set:

```text
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-7486274445029717
```

Do not put `INFERENCE_API_SECRET`, database credentials, Railway private URLs, or other server secrets into any `NEXT_PUBLIC_*` variable.

## Google AdSense account steps

Repository code cannot configure settings inside the operator's Google AdSense account. In AdSense, the operator must:

1. Add the final production domain under **Sites**.
2. Complete Google's site connection/review flow.
3. Open **Privacy & messaging** and configure Google's consent management platform for the regions served.
4. For EEA, UK, and Switzerland traffic, use a Google-certified CMP that integrates with the IAB Transparency & Consent Framework when required by Google's publisher policies.
5. Enable Auto ads or create the desired ad units only after the site is accepted and the privacy configuration is ready.
6. Check the site's `ads.txt` status and use **Check for updates** after deployment if needed.

Google can take time to recrawl `ads.txt` and update the account status.

## Placement guidance

Prefer ads between informational content sections or in feature/article areas. Avoid positioning ads directly beside:

- upload buttons;
- download buttons;
- crop controls;
- passport-photo print controls;
- navigation elements that could be confused with an ad.

This reduces accidental-click risk and keeps the image workflow usable.

## Privacy rules

With advertising enabled:

- keep Privacy, Terms, and Cookie pages current;
- do not send image bytes, private image URLs, source filenames, or image contents into analytics/ad event payloads;
- use the consent/opt-out controls required for the visitor's region;
- provide a way to revisit privacy choices where required by the CMP and applicable law;
- do not describe advertising as disabled while the AdSense client is live.

## Search Console / SEO

Google Search Console verification is prepared through:

```text
GOOGLE_SITE_VERIFICATION=
```

FlytheBG also provides `/robots.txt`, `/sitemap.xml`, metadata, structured data, and dedicated tool URLs that can be indexed separately.
