import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");
const home = await read("../src/app/page.tsx");
const journey = await read("../src/components/FlyTheBGJourney.tsx");
const layout = await read("../src/app/layout.tsx");
const brandLogo = await read("../src/components/FlytheBGLogo.tsx");
const journeyCss = await read("../src/app/flythebg-journey.css");
const refinements = await read("../src/app/theme-refinements.css");
const adPlaceholder = await read("../src/components/AdPlaceholder.tsx");
const faq = await read("../src/components/HoverFaqList.tsx");
const faqPage = await read("../src/app/faq/page.tsx");
const modelDisclosure = await read("../src/app/model-disclosure/page.tsx");
const remover = await read("../src/app/remove-background/page.tsx");
const passport = await read("../src/app/features/passport-photo/page.tsx");
const privacy = await read("../src/app/privacy/page.tsx");
const terms = await read("../src/app/terms/page.tsx");
const monetizationScripts = await read("../src/components/MonetizationScripts.tsx");
const monetizationConfig = await read("../src/lib/monetization.ts");
const envExample = await read("../../../.env.example");

test("landing uses the cinematic FlyTheBG journey with scrollable page flow", () => {
  assert.match(home, /FlyTheBGJourney/);
  assert.match(home, /LandingFAQ/);
  assert.match(home, /aiDiscoverySummary/);
  assert.match(journey, /className=\{`flyJourneyHome/);
  assert.match(journey, /className="flyJourneyVideoStack"/);
  assert.match(journey, /className="flyJourneyHero"/);
  assert.match(journey, /className="flyJourneySwitcher"/);
  assert.match(journeyCss, /\.flyJourneyHome/);
});

test("real FlyTheBG artwork is used throughout navigation and metadata", () => {
  assert.match(home, /FlyTheBGJourney/);
  assert.match(layout, /FlytheBGLogo/);
  assert.match(brandLogo, /\/brand\/flythebg-mark\.svg/);
  assert.match(layout, /\/brand\/flythebg-mark\.svg/);
  assert.doesNotMatch(brandLogo, /flythebg-lockup\.svg/);
  assert.match(layout, /href="\/faq"/);
});

test("landing retains cinematic typography and scene switching", () => {
  assert.match(layout, /Instrument_Serif, Inter/);
  assert.match(journey, /Instrument|flyJourney/);
  assert.match(journey, /setActiveVideo/);
  assert.match(journey, /switchVideo/);
  assert.match(journey, /AnimatePresence/);
});

test("landing uses light glass styling rather than legacy dark panels", () => {
  assert.match(refinements, /overflow-y:auto!important/);
  assert.match(journeyCss, /liquid-glass/);
  assert.match(journeyCss, /flyJourneySafeOverlay/);
});

test("FAQ navigation has a dedicated destination and tool anchors", () => {
  assert.match(faqPage, /FlytheBG FAQ/);
  assert.match(faqPage, /\/remove-background#faq/);
  assert.match(faqPage, /\/features\/passport-photo#faq/);
  assert.match(remover, /id="faq"/);
  assert.match(passport, /id="faq"/);
  assert.match(home, /LandingFAQ/);
});

test("FAQ opens and closes with controlled interaction", () => {
  assert.match(faq, /aria-expanded=\{open\}/);
  assert.match(faq, /onClick=\{\(\) => toggle\(index\)\}/);
  assert.match(faq, /onMouseEnter/);
  assert.match(faq, /onMouseLeave/);
});

test("ad inventory is a reserved labelled placement rather than a content-like box", () => {
  assert.match(adPlaceholder, /aria-label="Advertisements"/);
  assert.match(adPlaceholder, />Advertisements<\/span>/);
  assert.match(adPlaceholder, /data-ad-placeholder="true"/);
  assert.match(adPlaceholder, /data-ad-providers="adsense monetag"/);
  assert.match(adPlaceholder, /data-adsense-placeholder/);
  assert.match(adPlaceholder, /data-monetag-placeholder/);
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

test("AdSense and Monetag remain disabled by default and safely gated", () => {
  assert.match(envExample, /NEXT_PUBLIC_ADSENSE_ENABLED=false/);
  assert.match(envExample, /NEXT_PUBLIC_MONETAG_ENABLED=false/);
  assert.match(envExample, /NEXT_PUBLIC_MONETAG_ADSENSE_SAFE=false/);
  assert.match(monetizationConfig, /!adsenseEnabled \|\| monetagAdsenseSafe/);
  assert.match(monetizationConfig, /monetagScriptEnabled: Boolean\(monetagEnabled && \(!adsenseEnabled \|\| monetagAdsenseSafe\)/);
  assert.match(monetizationScripts, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
});
