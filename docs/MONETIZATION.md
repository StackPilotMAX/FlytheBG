# FlytheBG monetization setup

FlytheBG uses Google AdSense together with Monetag verification. To reduce policy risk, the current Monetag MultiTag ad-serving script is **not loaded while AdSense is enabled** unless an explicitly configured `NEXT_PUBLIC_MONETAG_ADSENSE_SAFE=true` is set.

Google's current AdSense guidance says sites containing or triggering pop-unders must not show Google ads, and ads must not be implemented in ways that cause accidental clicks. Google also treats artificial clicks/impressions and traffic manipulation as invalid traffic.
https://support.google.com/adsense/answer/1346295
https://support.google.com/adsense/answer/48182

Monetag also states that publishers are responsible for high-quality inventory and traffic and that invalid activity or Terms violations can result in suspension:
https://help.monetag.com/en/articles/6738465-why-was-my-account-suspended

## Current safe configuration

- AdSense loader: enabled.
- AdSense manual placements: supported.
- Monetag verification meta tag: installed.
- Monetag `sw.js`: installed at `/sw.js`.
- Monetag MultiTag script: gated off while AdSense is enabled.
- Monetag seller lines in `/ads.txt`: supported through `MONETAG_ADS_TXT_LINES`.

The current MultiTag script from Monetag is `https://quge5.com/88/tag.min.js` with zone `273485`.

Because MultiTag can include OnClick/pop-under behavior, do not enable that script on an AdSense-serving site unless Monetag provides a different format that is confirmed to be compatible with the current Google policies. Google specifically prohibits placing Google ads on sites that contain or trigger pop-unders.

## ads.txt

The build generates `/ads.txt` from the AdSense publisher ID and any Monetag seller lines supplied through `MONETAG_ADS_TXT_LINES`.

Current AdSense seller line:
`google.com, pub-7486274445029717, DIRECT, f08c47fec0942fa0`

Do not invent Monetag seller lines. Add only the exact line(s) Monetag supplies.

## Traffic and implementation rules

Do not click your own AdSense ads, ask users to click ads, buy low-quality or incentivized traffic, use bots/automated impressions, or place ads next to download/navigation/tool controls in a way that could cause accidental clicks.

Keep ads clearly distinguishable from navigation and tool controls, and keep the site easy to navigate.

Do not use a Monetag format that triggers pop-unders while AdSense ads are active.
