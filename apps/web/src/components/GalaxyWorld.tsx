"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type HeroState = "loading" | "ready" | "fallback";
type Star = { x: number; y: number; size: number; alpha: number; phase: number };

function seeded(seed: number) {
  let value = seed >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

export function GalaxyWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState<HeroState>("loading");

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) {
      setState("fallback");
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const compact = window.matchMedia("(max-width: 720px)").matches;
    const random = seeded(824731);
    const stars: Star[] = Array.from({ length: compact ? 210 : 430 }, () => ({
      x: random(),
      y: random(),
      size: .35 + random() * 1.2,
      alpha: .12 + random() * .62,
      phase: random() * Math.PI * 2,
    }));

    let width = 1;
    let height = 1;
    let dpr = 1;
    let frame = 0;
    let disposed = false;
    let markedReady = false;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time = 0) => {
      if (disposed) return;
      ctx.clearRect(0, 0, width, height);

      const sky = ctx.createLinearGradient(0, 0, width, height);
      sky.addColorStop(0, "rgba(3,6,11,.22)");
      sky.addColorStop(.55, "rgba(4,9,17,.04)");
      sky.addColorStop(1, "rgba(2,5,10,.20)");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        const twinkle = reducedMotion ? 1 : .68 + Math.sin(time * .001 + star.phase) * .32;
        ctx.globalAlpha = star.alpha * twinkle;
        ctx.fillStyle = star.size > 1.1 ? "#b7e9ff" : "#dceeff";
        ctx.beginPath();
        ctx.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      const aurora = ctx.createRadialGradient(width * .76, height * .46, 0, width * .76, height * .46, Math.min(width, height) * .48);
      aurora.addColorStop(0, "rgba(84,180,255,.09)");
      aurora.addColorStop(.35, "rgba(119,112,255,.045)");
      aurora.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = aurora;
      ctx.fillRect(0, 0, width, height);

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
      console.error("FlytheBG hero canvas fallback", error);
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
          <span className="eyebrow"><i/> AI image studio · flythebg.com</span>
          <h1 id="galaxy-title">Make the background disappear.<br/><em>Keep the subject.</em></h1>
          <p>Drop a portrait, product shot, landscape, square, vertical image, or panorama. FlytheBG preserves the original aspect ratio and creates a transparent PNG without forcing your photo into a preset frame.</p>
          <div className="heroActions">
            <Link className="buttonPrimary" href="/remove-background">Remove background <span>↗</span></Link>
            <Link className="buttonSecondary" href="/features/passport-photo">Passport Photo Maker</Link>
          </div>
          <div className="heroProof">
            <span><strong>Any normal ratio</strong><small>portrait · landscape · square · panorama</small></span>
            <span><strong>Small AI model</strong><small>quantized browser download</small></span>
            <span><strong>GPU → CPU</strong><small>WebGPU first · automatic fallback</small></span>
          </div>
        </div>

        <div className="heroEarthStage" aria-label="Animated Earth visual">
          <span className="orbitRing one" aria-hidden="true" />
          <span className="orbitRing two" aria-hidden="true" />
          <span className="orbitDot" aria-hidden="true" />

          <Link className="earthLink" href="/remove-background" aria-label="Open FlytheBG background remover">
            <span className="earthSphere" aria-hidden="true">
              <span className="land a" />
              <span className="land b" />
              <span className="land c" />
              <span className="land d" />
              <span className="atmosphere" />
            </span>
            <span className="earthLabel">Click Earth to start removing</span>
          </Link>

          <span className="floatChip ratio"><strong>Any aspect ratio</strong><small>No forced square crop</small></span>
          <span className="floatChip compute"><strong>{state === "ready" ? "Motion ready" : "Safe fallback"}</strong><small>Native canvas + CSS</small></span>
          <span className="floatChip output"><strong>Transparent PNG</strong><small>Original dimensions preserved</small></span>
        </div>
      </div>
    </section>
  );
}
