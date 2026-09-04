import type { Metadata, Viewport } from "next";
import Link from "next/link";
import Script from "next/script";
import { Instrument_Serif, Inter } from "next/font/google";
import "./production-ui.css";
import "./redesign.css";
import "./adsense-safety.css";
import "./genz.css";
import "./polish.css";
import "./immersive-theme.css";
import "./cinematic-hero.css";
import "./monetization.css";
import "./theme-refinements.css";
import "./landing-extras.css";
import "./light-theme-final.css";
import "./tool-pastel-theme.css";
import "./passport-manual-controls.css";
import "./top-ad-placement.css";
import "./feature-fixes.css";
import "./mobile-header-fixes.css";
import "./watermark-tool.css";
import "./donate.css";
import "./watermark-remover-v2.css";
import "./github-stars.css";
import "./flythebg-redesign.css";
import "./flythebg-cinematic.css";
import "./flythebg-journey.css";
import { FlytheBGLogo } from "@/components/FlytheBGLogo";
import { GitHubStars } from "@/components/GitHubStars";
import { MonetizationHead, MonetizationScripts } from "@/components/MonetizationScripts";
import { MotionLayer } from "@/components/MotionLayer";
import { SceneUI } from "@/components/SceneUI";
import { appConfig } from "@/lib/config";

const instrumentSerif = Instrument_Serif({ subsets: ["latin"], weight: "400", style: ["normal", "italic"], display: "swap", variable: "--font-instrument-serif" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600"], display: "swap", variable: "--font-inter" });
const defaultTitle = `FlyThe BG | Free AI Background Remover & Passport Photo Maker`;
const defaultDescription = "FlyThe BG is a free browser-first image toolkit for background removal, passport photos, and authorized AI-media utilities. Supported working media stays on the user's device.";
const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim() || "";
const bingVerification = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION?.trim() || "";
export const metadata: Metadata = { metadataBase: new URL(appConfig.siteUrl), title: { default: defaultTitle, template: `%s | FlyThe BG` }, description: defaultDescription, applicationName: "FlyThe BG", keywords: ["FlyThe BG", "FlyTheBG", "background remover", "Gemini watermark remover", "passport photo maker", "browser image tools"], authors: [{ name: "FlyThe BG", url: appConfig.siteUrl }], creator: "FlyThe BG", publisher: "FlyThe BG", category: "Image editing tools", referrer: "origin-when-cross-origin", robots: { index: true, follow: true, nocache: false, googleBot: { index: true, follow: true, noimageindex: false, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 } }, openGraph: { title: defaultTitle, description: defaultDescription, siteName: "FlyThe BG", locale: "en_US", type: "website", url: "/" }, twitter: { card: "summary", title: defaultTitle, description: defaultDescription }, appleWebApp: { capable: true, title: "FlyThe BG", statusBarStyle: "black-translucent" }, verification: { ...(googleVerification ? { google: googleVerification } : {}), ...(bingVerification ? { other: { "msvalidate.01": bingVerification } } : {}) }, icons: { icon: [{ url: "/brand/flythebg-mark.svg", type: "image/svg+xml", sizes: "any" }], shortcut: "/brand/flythebg-mark.svg", apple: "/brand/flythebg-mark.svg" } };
export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#5a341f", colorScheme: "light" };
function GithubIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M12 .5a12 12 0 0 0-3.79 23.39c.6.73.82-.26.82-.58v-2.05c-3.34.73-4.47-1.61-4.47-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.84 2.8 1.31 3.49 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.94 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.4 11.4 0 0 1 6 0c2.29-1.23 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"/></svg>; }
function InstagramIcon() { return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M7.5 2h9A5.5 5.5 0 0 1 22 7.5v9a5.5 5.5 0 0 1-5.5 5.5h-9A5.5 5.5 0 0 1 2 16.5v-9A5.5 5.5 0 0 1 7.5 2Zm0 2A3.5 3.5 0 0 0 4 7.5v9A3.5 3.5 0 0 0 7.5 20h9a3.5 3.5 0 0 0 3.5-3.5v-9A3.5 3.5 0 0 0 16.5 4h-9Zm9.75 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0-3 0Z"/></svg>; }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><head><meta name="monetag" content="5e777e0aa6ce027ca2e1a8ec1c8325b3" /><MonetizationHead /><Script src="https://www.googletagmanager.com/gtag/js?id=G-S50DRFD37X" strategy="lazyOnload" /><Script id="google-analytics" strategy="lazyOnload">{`window.dataLayer = window.dataLayer || []; function gtag(){window.dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', 'G-S50DRFD37X');`}</Script></head><body className={`${instrumentSerif.variable} ${inter.variable}`}><MotionLayer /><header className="siteHeader"><div className="shell navShell"><FlytheBGLogo priority /><nav className="navLinks" aria-label="Primary navigation"><Link href="/remove-background">Remove BG</Link><Link href="/ai-watermark-remover">Watermark Remover</Link><Link href="/features/passport-photo">Passport Photo</Link><Link href="/features">Features</Link><Link href="/guides">Guides</Link><Link href="/faq">FAQ</Link><Link href="/donate">Donate</Link></nav><div className="navUtility"><GitHubStars /><Link className="navCta" href="/donate">Support FlyThe BG <span>↗</span></Link></div><Link className="mobileFeaturesButton" href="/features" aria-label="Open FlyThe BG features">Features <span>↗</span></Link></div></header><SceneUI />{children}<footer className="siteFooter"><div className="shell footerGrid"><div className="footerBrand"><FlytheBGLogo size={42}/><p>FlyThe BG — browser-first image and media tools.</p><div className="footerSocials"><a className="socialIconLink" href="https://github.com/StackPilotMAX" target="_blank" rel="noreferrer" aria-label="FlyThe BG GitHub"><GithubIcon /><span>GitHub</span></a><a className="socialIconLink" href="https://www.instagram.com/aadarshf1/" target="_blank" rel="noreferrer" aria-label="FlyThe BG owner Instagram @aadarshf1"><InstagramIcon /><span>@aadarshf1</span></a></div></div><div className="footerLinks"><GitHubStars /><Link href="/remove-background">Remove Background</Link><Link href="/ai-watermark-remover">Gemini Watermark Remover</Link><Link href="/features/passport-photo">Passport Photo</Link><Link href="/features">Features</Link><Link href="/guides">Guides</Link><Link href="/faq">FAQ</Link><Link href="/donate">Donate / Support</Link><Link href="/about">About</Link><Link href="/model-disclosure">Model Disclosure</Link><Link href="/privacy">Privacy & AI</Link><Link href="/terms">Terms</Link><Link href="/cookies">Cookies</Link><Link href="/contact">Contact</Link></div></div><div className="shell footerBottom"><span>© {new Date().getFullYear()} FlyThe BG</span>{appConfig.contactEmail && <span>{appConfig.contactEmail}</span>}</div></footer><MonetizationScripts /></body></html>; }