# Analytics and Google AdSense readiness

FlytheBG's core image tools do not require analytics or advertising cookies. Advertising support is present but remains disabled until a valid publisher ID is configured.

## Google AdSense integration already in the code

The root layout checks:

```text
NEXT_PUBLIC_ADSENSE_CLIENT
```

Only a value matching Google's `ca-pub-` publisher-ID format causes the AdSense loader script to be added. Leaving the variable empty means no AdSense script is loaded.

FlytheBG also exposes `/ads.txt`. When a valid client ID is present, the route derives the `pub-...` identifier and publishes the Google DIRECT record automatically.

## Recommended launch sequence

1. Deploy FlytheBG on the final production domain.
2. Make sure Privacy, Terms, Cookies, Contact, sitemap, robots, and useful product content are publicly reachable.
3. Apply for / configure Google AdSense using that real domain.
4. Complete Google's site verification/ownership flow.
5. In AdSense, choose Auto ads or create explicit ad units.
6. Configure the required privacy/consent message for the regions you serve before loading non-essential personalized advertising where consent is required.
7. Add the real Railway web variable:

```text
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-YOUR_16_DIGIT_PUBLISHER_ID
```

8. Redeploy the web service.
9. Verify `/ads.txt` contains the matching `pub-...` identifier.
10. Check the AdSense dashboard for site status, policy issues, and ad serving.

## Placement guidance

Prefer ads between informational content sections or in feature/article areas. Avoid positioning ads directly beside:

- upload buttons;
- download buttons;
- crop controls;
- passport-photo print controls;
- navigation elements that could be confused with an ad.

This reduces accidental-click risk and keeps the image workflow usable.

## Privacy rules

If advertising is enabled:

- update policy text whenever providers or behavior change;
- do not send image bytes, private image URLs, source filenames, or image contents into analytics/ad event payloads;
- use consent controls required for the visitor's region;
- provide a way to revisit privacy choices where required;
- do not claim ads are disabled once the AdSense variable is live.

## Search Console / SEO

Google Search Console verification is prepared through:

```text
GOOGLE_SITE_VERIFICATION=
```

FlytheBG also provides `/robots.txt`, `/sitemap.xml`, metadata, structured data, and dedicated tool URLs that can be indexed separately.
