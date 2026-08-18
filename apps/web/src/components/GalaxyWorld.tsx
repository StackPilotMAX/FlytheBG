"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type GalaxyState = "loading" | "ready" | "fallback";
type Particle = { radius: number; angle: number; drift: number; size: number; alpha: number; color: string };
type Star = { x: number; y: number; size: number; alpha: number };

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function GalaxyWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<GalaxyState>("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      setState("fallback");
      return;
    }

    let frame = 0;
    let disposed = false;
    let markedReady = false;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 720px)").matches;
    const random = seeded(824731);
    const particleCount = compact ? 1800 : 3600;
    const starCount = compact ? 260 : 520;
    const colors = ["#eaf6ff", "#a7dcff", "#a993ff", "#ff9ccf", "#ffd6a1"];

    const particles: Particle[] = Array.from({ length: particleCount }, (_, index) => {
      const radius = Math.pow(random(), .62);
      const arm = index % 4;
      const spread = (random() - .5) * (.22 + radius * .62);
      return {
        radius,
        angle: arm * Math.PI / 2 + radius * 6.15 + spread,
        drift: .018 + random() * .018,
        size: .45 + random() * 1.55,
        alpha: .22 + random() * .72,
        color: colors[Math.floor(random() * colors.length)],
      };
    });

    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: random(),
      y: random(),
      size: .35 + random() * 1.15,
      alpha: .16 + random() * .6,
    }));

    let width = 1;
    let height = 1;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (timeMs = 0) => {
      if (disposed) return;
      ctx.clearRect(0, 0, width, height);

      const backdrop = ctx.createLinearGradient(0, 0, width, height);
      backdrop.addColorStop(0, "rgba(5,7,13,.12)");
      backdrop.addColorStop(.56, "rgba(7,9,18,.02)");
      backdrop.addColorStop(1, "rgba(3,4,10,.18)");
      ctx.fillStyle = backdrop;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        ctx.globalAlpha = star.alpha;
        ctx.fillStyle = "#dbeeff";
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      const centerX = compact ? width * .56 : width * .69;
      const centerY = compact ? height * .46 : height * .48;
      const maxRadius = Math.min(width * (compact ? .67 : .52), height * .69);
      const rotation = reducedMotion ? .2 : timeMs * .000018;

      const halo = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * .73);
      halo.addColorStop(0, "rgba(255,226,182,.34)");
      halo.addColorStop(.12, "rgba(255,170,207,.18)");
      halo.addColorStop(.38, "rgba(143,109,255,.12)");
      halo.addColorStop(1, "rgba(84,123,255,0)");
      ctx.globalAlpha = 1;
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, maxRadius * 1.08, maxRadius * .48, -.16, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalCompositeOperation = "lighter";
      for (const particle of particles) {
        const angle = particle.angle + rotation * particle.drift * 42;
        const radius = particle.radius * maxRadius;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius * .42 + (particle.radius - .5) * 5;
        const edgeFade = Math.max(.18, 1 - particle.radius * .62);
        ctx.globalAlpha = particle.alpha * edgeFade;
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      const core = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * .13);
      core.addColorStop(0, "rgba(255,250,226,.96)");
      core.addColorStop(.24, "rgba(255,215,166,.76)");
      core.addColorStop(1, "rgba(255,157,200,0)");
      ctx.globalAlpha = .9;
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * .15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (!markedReady) {
        markedReady = true;
        setState("ready");
      }
      if (!reducedMotion) frame = window.requestAnimationFrame(draw);
    };

    try {
      resize();
      draw(0);
      window.addEventListener("resize", resize, { passive: true });
    } catch (error) {
      console.error("FlytheBG galaxy canvas fallback", error);
      setState("fallback");
    }

    return () => {
      disposed = true;
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="galaxyHero" aria-labelledby="galaxy-title">
      <div className="galaxyVisual" aria-hidden="true">
        <div className="galaxyFallback" />
        <canvas ref={canvasRef} className="galaxyCanvas" />
        <div className="galaxyVignette" />
      </div>

      <div className="shell galaxyHeroLayout">
        <div className="galaxyHeroCopy">
          <span className="eyebrow"><i/> Browser-first image tools</span>
          <h1 id="galaxy-title">Remove the background.<br/><em>Keep the photo private.</em></h1>
          <p>FlytheBG removes backgrounds, crops transparent PNGs, and builds passport-photo sheets directly in your browser—without an image-processing server.</p>
          <div className="heroActions">
            <Link className="buttonPrimary" href="/remove-background">Remove background <span>↗</span></Link>
            <Link className="buttonSecondary" href="/features/passport-photo">Passport Photo Maker</Link>
          </div>
          <div className="heroProof">
            <span><strong>Browser</strong><small>image processing</small></span>
            <span><strong>2 models</strong><small>quantized → FP16</small></span>
            <span><strong>0</strong><small>image DB uploads</small></span>
          </div>
        </div>

        <aside className="galaxyStatusCard" aria-label="Production architecture">
          <span className="statusLabel"><i className={state === "ready" ? "online" : ""}/> {state === "ready" ? "Visual ready" : "CSS fallback active"}</span>
          <h2>Static host.<br/>Local image compute.</h2>
          <ul>
            <li><span>01</span>IMG.LY quantized first</li>
            <li><span>02</span>FP16 automatic fallback</li>
            <li><span>03</span>Canvas galaxy never blocks controls</li>
          </ul>
        </aside>
      </div>
    </section>
  );
}
