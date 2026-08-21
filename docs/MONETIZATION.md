# FlytheBG monetization setup

FlytheBG supports optional Google AdSense and Monetag configuration. Both networks are disabled by default so a normal build does not load their ad-serving JavaScript until the production owner intentionally enables it.

## AdSense values

Provide only the public publisher information shown by AdSense. Do not provide Google passwords, recovery codes, cookies, or account login credentials.

```env
NEXT_PUBLIC_ADSENSE_ENABLED=true
NEXT_PUBLIC_ADSENSE_CLIENT=ca-pub-0000000000000000
```

The build uses the publisher ID to generate the Google seller entry in `/ads.txt`. The global AdSense script is loaded only when the enable flag is `true` and the client value has the expected `ca-pub-` format.

## Monetag values

Provide the exact public values supplied by the Monetag site/zone setup. Do not provide a Monetag password or private account credential.

```env
NEXT_PUBLIC_MONETAG_ENABLED=true
NEXT_PUBLIC_MONETAG_ADSENSE_SAFE=true
NEXT_PUBLIC_MONETAG_SCRIPT_SRC=https://example-from-monetag.invalid/script.js
NEXT_PUBLIC_MONETAG_VERIFICATION_META_NAME=
NEXT_PUBLIC_MONETAG_VERIFICATION_META_CONTENT=
MONETAG_ADS_TXT_LINES=
```

`NEXT_PUBLIC_MONETAG_ADSENSE_SAFE=true` is an explicit safety gate. When AdSense is active, FlytheBG does not load the Monetag script unless this flag is true.

## AdSense + Monetag together

Google allows non-Google advertising on a site that also uses AdSense, provided the site remains compliant with Google Publisher Policies and ads do not overwhelm publisher content.

For FlytheBG, do **not** enable Monetag OnClick/pop-under behavior while AdSense is active. Monetag MultiTag currently includes an OnClick format, so it should not be used as the default combined AdSense + Monetag configuration. Prefer a non-pop-under Monetag format supplied specifically for normal in-page/banner-style monetization and verify the current provider rules before enabling it.

Keep advertising away from image-upload buttons, download buttons, print controls, crop controls, and other interactive tool controls to reduce accidental-click risk.

## Consent

Before serving personalized Google ads to users in the EEA, UK, or Switzerland, configure a Google-certified consent management platform that integrates with the IAB TCF. Also confirm that the selected CMP/consent setup covers any additional advertising technology used by Monetag where required.

## What to send for final setup

Send the following public values only:

1. AdSense publisher/client ID (`ca-pub-...`).
2. Whether AdSense is approved and should actually be enabled yet.
3. The exact Monetag verification meta tag, if Monetag asks for one.
4. The exact Monetag ad-format code or script URL for the format you want to use.
5. The Monetag `ads.txt` seller line(s), if Monetag provides them.
6. Confirmation that the selected Monetag format does not use OnClick/pop-under behavior if AdSense will run at the same time.

Do not send account passwords, one-time codes, recovery codes, browser cookies, API secrets, or payment credentials.
