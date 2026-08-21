# FlytheBG monetization setup

FlytheBG supports optional Google AdSense and Monetag configuration. Both networks are disabled by default so a normal build does not load their ad-serving JavaScript until the production owner intentionally enables it.

## Reserved advertisement placements

FlytheBG now contains explicit, non-interactive advertisement placeholders on content-heavy pages. They are labelled **Advertisements**, kept away from upload/download/navigation controls, and identified in markup with `data-ad-placeholder`, `data-ad-slot`, `data-adsense-placeholder`, and `data-monetag-placeholder` attributes.

Current placement names:

- `landing-inline-1`
- `remove-bg-inline-1`
- `passport-inline-1`
- `faq-inline-1`

The placeholders are intentionally not animated or styled to mimic publisher content. When provider IDs are supplied later, the same reserved locations expose the configured AdSense slot ID and Monetag zone ID rather than inventing a new page location.

## AdSense values

Provide only the public publisher information shown by AdSense. Do not provide Google passwords, recovery codes, cookies, or account login credentials.

```env
NEXT_PUBLIC_ADSENSE_ENABLED=true
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000
NEXT_PUBLIC_ADSENSE_SLOT_LANDING=
NEXT_PUBLIC_ADSENSE_SLOT_REMOVE_BG=
NEXT_PUBLIC_ADSENSE_SLOT_PASSPORT=
NEXT_PUBLIC_ADSENSE_SLOT_FAQ=
```

The build uses the publisher ID to generate the Google seller entry in `/ads.txt`. The global AdSense script is loaded only when the enable flag is `true` and the client value has the expected `ca-pub-` format.

If you want FlytheBG to use only these reserved manual locations, keep AdSense **Auto ads disabled in the AdSense account/dashboard**. Auto ads are controlled by AdSense and can choose additional locations independently of these page placeholders.

## Monetag values

Provide the exact public values supplied by the Monetag site/zone setup. Do not provide a Monetag password or private account credential.

```env
NEXT_PUBLIC_MONETAG_ENABLED=true
NEXT_PUBLIC_MONETAG_ADSENSE_SAFE=true
NEXT_PUBLIC_MONETAG_SCRIPT_SRC=https://example-from-monetag.invalid/script.js
NEXT_PUBLIC_MONETAG_VERIFICATION_META_NAME=
NEXT_PUBLIC_MONETAG_VERIFICATION_META_CONTENT=
NEXT_PUBLIC_MONETAG_ZONE_LANDING=
NEXT_PUBLIC_MONETAG_ZONE_REMOVE_BG=
NEXT_PUBLIC_MONETAG_ZONE_PASSPORT=
NEXT_PUBLIC_MONETAG_ZONE_FAQ=
MONETAG_ADS_TXT_LINES=
```

`NEXT_PUBLIC_MONETAG_ADSENSE_SAFE=true` is an explicit safety gate. When AdSense is active, FlytheBG does not load the Monetag script unless this flag is true.

## AdSense + Monetag together

Google allows non-Google advertising on a site that also uses AdSense, provided the site remains compliant with Google Publisher Policies and ads do not overwhelm publisher content.

For FlytheBG, do **not** enable Monetag OnClick/pop-under behavior while AdSense is active. Monetag MultiTag currently includes an OnClick format, so it should not be used as the default combined AdSense + Monetag configuration. Prefer a non-pop-under Monetag format supplied specifically for normal in-page/banner-style monetization and verify the current provider rules before enabling it.

Keep advertising away from image-upload buttons, download buttons, print controls, crop controls, and other interactive tool controls to reduce accidental-click risk. Visible ad headings should remain limited to provider/policy-safe labels such as **Advertisements**.

## Consent

Before serving personalized Google ads to users in the EEA, UK, or Switzerland, configure a Google-certified consent management platform that integrates with the IAB TCF. Also confirm that the selected CMP/consent setup covers any additional advertising technology used by Monetag where required.

## What to send for final setup

Send the following public values only:

1. AdSense publisher/client ID (`ca-pub-...`).
2. Whether AdSense is approved and should actually be enabled yet.
3. AdSense manual ad-unit slot IDs for the landing, remover, passport, and FAQ placements you want to fill.
4. The exact Monetag verification meta tag, if Monetag asks for one.
5. The exact Monetag ad-format code or script URL for the format you want to use.
6. Monetag zone IDs for the reserved placements you want to fill.
7. The Monetag `ads.txt` seller line(s), if Monetag provides them.
8. Confirmation that the selected Monetag format does not use OnClick/pop-under behavior if AdSense will run at the same time.

Do not send account passwords, one-time codes, recovery codes, browser cookies, API secrets, or payment credentials.
