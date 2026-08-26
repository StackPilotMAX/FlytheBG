# FlytheBG monetization setup

FlytheBG is configured for Monetag only. Google AdSense code and configuration have been removed from the application.

## Monetag verification

The Monetag `sw.js` file supplied for this site is stored at `apps/web/public/sw.js`, which Next.js serves as `/sw.js` at the website root.

The supplied file contains Monetag domain `3nbf4.com` and zone ID `11660960`. Do not modify that file unless Monetag provides a replacement.

Monetag's current publisher documentation says the downloaded `sw.js` should be saved in the site's root directory for site verification / HTTPS ad formats:
https://help.monetag.com/en/articles/6726312-how-do-i-get-started-as-a-publisher-add-and-verify-your-website-s

## Monetag configuration

Use only the public values supplied by the Monetag dashboard. Do not provide a Monetag password or private account credential.

```env
NEXT_PUBLIC_MONETAG_ENABLED=true
NEXT_PUBLIC_MONETAG_SCRIPT_SRC=
NEXT_PUBLIC_MONETAG_VERIFICATION_META_NAME=
NEXT_PUBLIC_MONETAG_VERIFICATION_META_CONTENT=
NEXT_PUBLIC_MONETAG_ZONE_LANDING=
NEXT_PUBLIC_MONETAG_ZONE_REMOVE_BG=
NEXT_PUBLIC_MONETAG_ZONE_PASSPORT=
NEXT_PUBLIC_MONETAG_ZONE_FAQ=
MONETAG_ADS_TXT_LINES=
```

The exact Monetag ad-channel tag is separate from `sw.js`. Monetag's documentation says that after verification, publishers create an ad channel/zone and paste the generated ad tag into the website source:
https://help.monetag.com/en/articles/6726314-how-do-i-get-started-as-a-publisher-creating-ad-channels

The current repository therefore installs the supplied `sw.js` and removes the AdSense integration, but it does **not** invent an ad-tag URL or ad-channel script that was not supplied by Monetag.

## ads.txt

The build now generates `/ads.txt` only from `MONETAG_ADS_TXT_LINES`. If Monetag supplies seller lines, place those public lines in that environment variable. No Google seller entry is generated.

## Final Monetag setup values

For actual ad serving, the remaining public values needed from the Monetag dashboard are:

1. The exact Monetag ad-format code or script URL for the chosen format.
2. The Monetag zone ID(s) for the placements you want to use.
3. The Monetag `ads.txt` seller line(s), if Monetag provides them.
4. The exact verification meta tag, if Monetag asks you to use that method instead of the supplied `sw.js`.

Do not send account passwords, one-time codes, recovery codes, browser cookies, API secrets, or payment credentials.
