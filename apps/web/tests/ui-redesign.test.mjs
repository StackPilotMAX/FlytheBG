import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const home = await readFile(new URL("../src/app/page.tsx", import.meta.url), "utf8");
const layout = await readFile(new URL("../src/app/layout.tsx", import.meta.url), "utf8");
const brandLogo = await readFile(new URL("../src/components/FlytheBGLogo.tsx", import.meta.url), "utf8");
const cinematic = await readFile(new URL("../src/app/cinematic-hero.css", import.meta.url), "utf8");
const immersive = await readFile(new URL("../src/app/immersive-theme.css", import.meta.url), "utf8");
const refinements = await readFile(new URL("../src/app/theme-refinements.css", import.meta.url), "utf8");
const monetizationCss = await readFile(new URL("../src/app/monetization.css", import.meta.url), "utf8");
const motion = await readFile(new URL("../src/components/MotionLayer.tsx", import.meta.url), "utf8");
const announcement = await readFile(new URL("../src/components/FeatureAnnouncement.tsx", import.meta.url), "utf8");
const faq = await readFile(new URL("../src/components/HoverFaqList.tsx", import.meta.url), "utf8");
const faqPage = await readFile(new URL("../src/app/faq/page.tsx", import.meta.url), "utf8");
const adPlaceholder = await readFile(new URL("../src/components/AdPlaceholder.tsx", import.meta.url), "utf8");
const modelDisclosure = await readFile(new URL("../src/app/model-disclosure/page.tsx", import.meta.url), "utf8");
const remover = await readFile(new URL("../src/app/remove-background/page.tsx", import.meta.url), "utf8");
const passport = await readFile(new URL("../src/app/features/passport-photo/page.tsx", import.meta.url), "utf8");
const privacy = await readFile(new URL("../src/app/privacy/page.tsx", import.meta.url), "utf8");
const terms = await readFile(new URL("../src/app/terms/page.tsx", import.meta.url), "utf8");
const monetizationScripts = await readFile(new URL("../src/components/MonetizationScripts.tsx", import.meta.url), "utf8");
const monetizationConfig = await readFile(new URL("../src/lib/monetization.ts", import.meta.url), "utf8");
const preparePublic = await readFile(new URL("../scripts/prepare-public.mjs", import.meta.url), "utf8");
const envExample = await readFile(new URL("../../../.env.example", import.meta.url), "utf8");

test("landing is scrollable and reuses the single shared video backdrop", () => {
  assert.match(home, /className="cinematicLanding"/);
  assert.match(home, /className="cinematicHero"/);
  assert.match(home, /id="what-flythebg-does"/);
  assert.match(home, /Scroll to explore/);
  assert.match(layout, /className="siteBackdropVideo" autoPlay muted loop playsInline/);
  assert.match(layout, /hf_20260714_113715_c7e0daa0-8bdd-4486-a2da-040901f8f0ea\.mp4/);
  assert.doesNotMatch(home, /className="cinematicHeroVideo"/);
  assert.match(refinements, /overflow-y:auto!important/);
  assert.match(refinements, /body:has\(\.cinematicHero\) \.siteVideoBackdrop\{display:block!important\}/);
});

test("real FlytheBG artwork is used throughout navigation and metadata", () => {
  assert.match(home, /FlytheBGLogo/);
  assert.match(layout, /FlytheBGLogo/);
  assert.match(brandLogo, /\/brand\/flythebg-mark\.svg/);
  assert.match(layout, /\/brand\/flythebg-mark\.svg/);
  assert.doesNotMatch(home, /flythebg-lockup\.svg/);
  assert.doesNotMatch(layout, /flythebg-lockup\.svg/);
  assert.doesNotMatch(home, /<svg viewBox=/);
  assert.match(layout, /href="\/faq"/);
});

test("landing retains cinematic typography and animated scrolling sections", () => {
  assert.match(layout, /Instrument_Serif, Inter/);
  assert.match(layout, /theme-refinements\.css/);
  assert.match(home, /landingReveal/);
  assert.match(motion, /\.landingReveal/);
  assert.match(motion, /--video-y/);
  assert.match(motion, /--video-scale/);
  assert.match(immersive, /\.motion-ready \.revealItem/);
  assert.match(cinematic, /backdrop-filter:blur/);
});

test("dark legacy panels are overridden with the light video glass theme", () => {
  assert.match(refinements, /background:linear-gradient\(145deg,rgba\(255,255,255,\.76\),rgba\(247,245,255,\.58\)\)!important/);
  assert.match(refinements, /input,select,textarea/);
  assert.match(refinements, /background:linear-gradient\(135deg,#7eaee4,#9180df\)!important/);
  assert.match(refinements, /color:var\(--fly-text\)/);
});

test("FAQ navigation has a dedicated destination and tool anchors", () => {
  assert.match(faqPage, /FlytheBG FAQ/);
  assert.match(faqPage, /\/remove-background#faq/);
  assert.match(faqPage, /\/features\/passport-photo#faq/);
  assert.match(remover, /id="faq"/);
  assert.match(passport, /id="faq"/);
  assert.match(home, /href="\/faq"/);
});

test("FAQ opens and closes with controlled smooth animation", () => {
  assert.match(faq, /aria-expanded=\{open\}/);
  assert.match(faq, /onClick=\{\(\) => toggle\(index\)\}/);
  assert.match(faq, /onMouseEnter/);
  assert.match(faq, /onMouseLeave/);
  assert.match(refinements, /grid-template-rows:0fr/);
  assert.match(refinements, /grid-template-rows:1fr/);
  assert.match(refinements, /transition:grid-template-rows \.52s/);
});

test("ad inventory is a reserved labelled placement rather than a content-like box", () => {
  assert.match(adPlaceholder, /aria-label="Advertisements"/);
  assert.match(adPlaceholder, />Advertisements<\/span>/);
  assert.match(adPlaceholder, /data-ad-placeholder="true"/);
  assert.match(adPlaceholder, /data-ad-providers="adsense monetag"/);
  assert.match(adPlaceholder, /data-adsense-placeholder/);
  assert.match(adPlaceholder, /data-monetag-placeholder/);
  assert.match(home, /landing-inline-1/);
  assert.match(remover, /remove-bg-inline-1/);
  assert.match(passport, /passport-inline-1/);
  assert.match(refinements, /Reserved advertisement inventory/);
});

test("model and legal disclosure names the package, variants and ownership boundary", () => {
  assert.match(modelDisclosure, /@imgly\/background-removal/);
  assert.match(modelDisclosure, /1\.7\.0/);
  assert.match(modelDisclosure, /isnet_quint8/);
  assert.match(modelDisclosure, /isnet_fp16/);
  assert.match(modelDisclosure, /AGPL/);
  assert.match(modelDisclosure, /does not claim ownership/);
  assert.match(privacy, /AGPL/);
  assert.match(terms, /AGPL/);
});

test("October 2026 feature notice remains dismissible", () => {
  assert.match(layout, /<FeatureAnnouncement \/>/);
  assert.match(announcement, /New FlytheBG features are coming in October 2026\./);
  assert.match(announcement, /localStorage\.getItem/);
  assert.match(announcement, /localStorage\.setItem/);
  assert.match(monetizationCss, /\.featureAnnouncement/);
});

test("AdSense and Monetag remain disabled by default and safely gated", () => {
  assert.match(envExample, /NEXT_PUBLIC_ADSENSE_ENABLED=false/);
  assert.match(envExample, /NEXT_PUBLIC_MONETAG_ENABLED=false/);
  assert.match(envExample, /NEXT_PUBLIC_MONETAG_ADSENSE_SAFE=false/);
  assert.match(monetizationConfig, /!adsenseEnabled \|\| monetagAdsenseSafe/);
  assert.match(monetizationConfig, /OnClick\/pop-under formats together with AdSense/);
  assert.match(monetizationScripts, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
  assert.match(preparePublic, /MONETAG_ADS_TXT_LINES/);
});
