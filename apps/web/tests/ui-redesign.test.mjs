import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const home = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const cinematic = await readFile(new URL("../src/app/cinematic-hero.css", import.meta.url), "utf8");
const immersive = await readFile(new URL("../src/app/immersive-theme.css", import.meta.url), "utf8");
const monetizationCss = await readFile(new URL("../src/app/monetization.css", import.meta.url), "utf8");
const motion = await readFile(new URL("../src/components/MotionLayer.tsx", import.meta.url), "utf8");
const announcement = await readFile(new URL("../src/components/FeatureAnnouncement.tsx", import.meta.url), "utf8");
const monetizationScripts = await readFile(new URL("../src/components/MonetizationScripts.tsx", import.meta.url), "utf8");
const monetizationConfig = await readFile(new URL("../src/lib/monetization.ts", import.meta.url), "utf8");
const faq = await readFile(new URL("../src/components/HoverFaqList.tsx", import.meta.url), "utf8");
const polish = await readFile(new URL("../src/app/polish.css", import.meta.url), "utf8");
const remover = await readFile(new URL("../src/app/remove-background/page.tsx", import.meta.url), "utf8");
const privacy = await readFile(new URL("../src/app/privacy/page.tsx", import.meta.url), "utf8");
const cookies = await readFile(new URL("../src/app/cookies/page.tsx", import.meta.url), "utf8");
const terms = await readFile(new URL("../src/app/terms/page.tsx", import.meta.url), "utf8");
const preparePublic = await readFile(new URL("../../scripts/prepare-public.mjs", import.meta.url), "utf8");
const envExample = await readFile(new URL("../../../.env.example", import.meta.url), "utf8");

test("homepage is a single cinematic video hero", () => {
  assert.match(home, /className="cinematicHero"/);
  assert.match(home, /autoPlay muted loop playsInline/);
  assert.match(home, /hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea\.mp4/);
  assert.match(home, /Remove backgrounds\./);
  assert.match(home, /Make passport photos\./);
  assert.doesNotMatch(home, /LocalAISimulator/);
  assert.doesNotMatch(home, /landingBento/);
  assert.doesNotMatch(home, /landingFinalCta/);
});

test("landing and shared chrome use the official FlytheBG lockup", () => {
  assert.match(home, /\/brand\/flythebg-lockup\.svg/);
  assert.match(home, /className="cinematicBrandLockup"/);
  assert.match(layout, /className="brandLockup" src="\/brand\/flythebg-lockup\.svg"/);
  assert.match(monetizationCss, /\.cinematicBrandLockup/);
  assert.match(home, /href="\/remove-background"/);
  assert.match(home, /href="\/features\/passport-photo"/);
  assert.match(home, /href="\/privacy"/);
  assert.match(home, /href="\/about"/);
});

test("homepage title and local product description are preserved for search", () => {
  assert.match(home, /FlytheBG-- Free Background Remover & Passport Photo Maker/);
  assert.match(home, /locally in your browser/i);
  assert.match(remover, /aspect ratio/i);
});

test("Instrument Serif and Inter are self-hosted through next font and applied globally", () => {
  assert.match(layout, /Instrument_Serif, Inter/);
  assert.match(layout, /variable: "--font-instrument-serif"/);
  assert.match(layout, /variable: "--font-inter"/);
  assert.match(layout, /immersive-theme\.css/);
  assert.match(layout, /cinematic-hero\.css/);
  assert.match(layout, /monetization\.css/);
  assert.match(cinematic, /font-family:var\(--font-inter\)/);
  assert.match(cinematic, /font-family:var\(--font-instrument-serif\)/);
});

test("cinematic hero hides the normal site chrome and remains full viewport", () => {
  assert.match(cinematic, /height:100dvh/);
  assert.match(cinematic, /height:130%/);
  assert.match(cinematic, /object-position:50% 0%/);
  assert.match(cinematic, /\.siteHeader/);
  assert.match(cinematic, /\.siteFooter/);
  assert.match(cinematic, /backdrop-filter:blur/);
});

test("all non-home public pages reuse the supplied cinematic video theme", () => {
  assert.match(layout, /className="siteVideoBackdrop"/);
  assert.match(layout, /className="siteBackdropVideo" autoPlay muted loop playsInline/);
  assert.match(layout, /hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea\.mp4/);
  assert.match(immersive, /\.siteVideoBackdrop\{[\s\S]*position:fixed/);
  assert.match(immersive, /body > main:not\(\.cinematicHero\) > section > \.shell/);
  assert.match(immersive, /backdrop-filter:blur\(24px\)/);
  assert.match(immersive, /body:has\(\.cinematicHero\) \.siteVideoBackdrop\{display:none\}/);
});

test("scroll motion reveals page sections and parallax-shifts the shared video", () => {
  assert.match(layout, /<MotionLayer \/>/);
  assert.match(motion, /main:not\(\.cinematicHero\) > section > \.shell > \*/);
  assert.match(motion, /reveal-left/);
  assert.match(motion, /reveal-right/);
  assert.match(motion, /--video-y/);
  assert.match(motion, /--video-scale/);
  assert.match(immersive, /\.motion-ready \.revealItem/);
  assert.match(immersive, /prefers-reduced-motion:reduce/);
});

test("October 2026 feature notice is visible and dismissible", () => {
  assert.match(layout, /<FeatureAnnouncement \/>/);
  assert.match(announcement, /New FlytheBG features are coming in October 2026\./);
  assert.match(announcement, /localStorage\.getItem/);
  assert.match(announcement, /localStorage\.setItem/);
  assert.match(announcement, /Dismiss October feature announcement/);
  assert.match(monetizationCss, /\.featureAnnouncement/);
});

test("AdSense and Monetag are disabled by default and gated for safe co-use", () => {
  assert.match(envExample, /NEXT_PUBLIC_ADSENSE_ENABLED=false/);
  assert.match(envExample, /NEXT_PUBLIC_MONETAG_ENABLED=false/);
  assert.match(envExample, /NEXT_PUBLIC_MONETAG_ADSENSE_SAFE=false/);
  assert.match(envExample, /NEXT_PUBLIC_MONETAG_SCRIPT_SRC=/);
  assert.match(envExample, /MONETAG_ADS_TXT_LINES=/);
  assert.match(monetizationConfig, /!adsenseEnabled \|\| monetagAdsenseSafe/);
  assert.match(monetizationConfig, /Do not use[\s\S]*OnClick\/pop-under formats together with AdSense/);
  assert.match(monetizationScripts, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
  assert.match(monetizationScripts, /strategy="lazyOnload"/);
  assert.match(preparePublic, /MONETAG_ADS_TXT_LINES/);
});

test("legal pages disclose both ad networks without hard-coded contact email", () => {
  for (const source of [privacy, cookies, terms]) {
    assert.match(source, /Monetag/);
    assert.match(source, /appConfig\.contactEmail/);
    assert.doesNotMatch(source, /stackpilotfe@outlook\.com/);
  }
});

test("FAQs on tool pages still support automatic pointer hover opening", () => {
  assert.match(faq, /onMouseEnter/);
  assert.match(faq, /onMouseLeave/);
  assert.match(faq, /event\.currentTarget\.open = true/);
  assert.match(faq, /event\.currentTarget\.open = false/);
  assert.match(polish, /\.animatedFaqList details\[open\]/);
});
