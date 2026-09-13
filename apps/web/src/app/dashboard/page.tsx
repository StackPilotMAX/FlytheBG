"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = { stars: number | null; forks: number | null };

const primaryTools = [
  { index: "01", href: "/remove-background", name: "Background Remover", icon: "✦", desc: "Private rembg via Hugging Face.", tag: "Live" },
  { index: "02", href: "/features/passport-photo", name: "Passport & Visa Photos", icon: "▣", desc: "Exact-size crop frames and print sheets.", tag: "Live" },
  { index: "03", href: "/ai-watermark-remover", name: "Watermark Cleanup", icon: "◈", desc: "Conservative inpainting with previews.", tag: "Beta" },
  { index: "04", href: "/tools/video-compressor", name: "Video Compressor", icon: "▶", desc: "Local H.264 compression in-browser.", tag: "Live" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ stars: null, forks: null });

  useEffect(() => {
    fetch("https://api.github.com/repos/StackPilotMAX/FlytheBG")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setStats({ stars: d.stargazers_count, forks: d.forks_count });
      })
      .catch(() => {});
  }, []);

  return (
    <main className="launcherPage dashboardPage">
      <section className="launcherHero">
        <div className="shell launcherHeroInner">
          <div>
            <span className="launcherEyebrow"><i /> FlyThe BG Dashboard</span>
            <h1>Project pulse <em>at a glance.</em></h1>
            <p>A simple dashboard for everything FlyThe BG — jump into a tool, see how the open-source project is doing, or read up on how the private Hugging Face rembg pipeline works.</p>
            <div className="launcherCtas">
              <Link className="buttonPrimary" href="/remove-background">Open Background Remover <span>↗</span></Link>
              <Link className="buttonGhost" href="/features">Browse all tools</Link>
            </div>
          </div>
          <aside className="launcherStats">
            <article><span>GitHub stars</span><strong>{stats.stars === null ? "…" : stats.stars.toLocaleString()}</strong><small>Live from the FlyThe BG repository.</small></article>
            <article><span>Forks</span><strong>{stats.forks === null ? "…" : stats.forks.toLocaleString()}</strong><small>Public forks across the community.</small></article>
            <article><span>Tools live</span><strong>4+</strong><small>Remove BG · Passport · Watermark · Video</small></article>
          </aside>
        </div>
      </section>

      <section className="launcherSection">
        <div className="shell">
          <div className="launcherSectionHead">
            <div><h2>Launch a <em>tool</em></h2><p>Pick a workspace. Each opens in its own focused page.</p></div>
          </div>

          <div className="toolGrid">
            {primaryTools.map((tool) => (
              <Link key={tool.name} href={tool.href} className="toolCard">
                <div className="toolTop">
                  <span className="toolIndex">{tool.index}</span>
                  <span className={`statusPill ${tool.tag === "Live" ? "live" : "beta"}`}>{tool.tag}</span>
                </div>
                <div className="toolIcon" aria-hidden="true">{tool.icon}</div>
                <h3>{tool.name}</h3>
                <p>{tool.desc}</p>
                <span className="toolCta">Open</span>
              </Link>
            ))}
          </div>

          <div className="privacyBand" style={{ marginTop: 32 }}>
            <h3>Private by <em>architecture.</em></h3>
            <div className="privacyGrid">
              <div><strong>Secret token</strong><span>HF_TOKEN is a server-only env var. Client JavaScript never sees it.</span></div>
              <div><strong>rembg engine</strong><small style={{display:"block",color:"rgba(255,255,255,.7)",fontSize:11,marginTop:6}}>The Space runs rembg behind a Gradio endpoint — no third-party API proxy.</small></div>
              <div><strong>No accounts</strong><span>No logins, no tracking profiles, no uploaded image gallery.</span></div>
              <div><strong>Open source</strong><span>Audit the entire pipeline on GitHub under AGPL-3.0.</span></div>
            </div>
          </div>

          <div className="launcherSectionHead" style={{ marginTop: 36 }}>
            <div><h2>Project <em>links</em></h2><p>Quick shortcuts to the pages visitors ask for most.</p></div>
          </div>

          <div className="toolGrid">
            <Link href="/faq" className="toolCard">
              <div className="toolTop"><span className="toolIndex">05</span><span className="statusPill live">Live</span></div>
              <div className="toolIcon" aria-hidden="true">?</div>
              <h3>Frequently Asked</h3>
              <p>Answers about privacy, quality, supported formats, and how the private AI path works.</p>
              <span className="toolCta">Read FAQ</span>
            </Link>
            <Link href="/blogs" className="toolCard">
              <div className="toolTop"><span className="toolIndex">06</span><span className="statusPill live">Live</span></div>
              <div className="toolIcon" aria-hidden="true">❝</div>
              <h3>Blog</h3>
              <p>Short articles on image quality, passport photos, video compression, and shipping open-source tools.</p>
              <span className="toolCta">Read posts</span>
            </Link>
            <Link href="https://github.com/StackPilotMAX/FlytheBG" target="_blank" rel="noreferrer" className="toolCard">
              <div className="toolTop"><span className="toolIndex">07</span><span className="statusPill live">Live</span></div>
              <div className="toolIcon" aria-hidden="true">◐</div>
              <h3>GitHub Repository</h3>
              <p>Star the repo, file issues, or fork it to run your own rembg-backed image tools.</p>
              <span className="toolCta">Open GitHub</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
