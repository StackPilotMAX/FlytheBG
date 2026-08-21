"use client";

import { useEffect } from "react";

const REVEAL_SELECTOR = [
  "main:not(.cinematicHero) > section > .shell > *",
  "main:not(.cinematicHero) > .shell > *",
  ".landingReveal",
  ".sectionHeading",
  ".trustGrid article",
  ".toolFeatureCard",
  ".workflowSteps li",
  ".faqItem",
  ".infoCards article",
  ".principleList article",
  ".passportPanel",
  ".sheetPreviewSection",
  ".toolSurface",
  ".pageHeroGrid > *",
  ".footerGrid > *",
].join(",");

export function MotionLayer() {
  useEffect(() => {
    const root = document.documentElement;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    root.classList.add("motion-ready");

    const backdropVideo = document.querySelector<HTMLVideoElement>(".siteBackdropVideo");
    if (reducedMotion && backdropVideo) backdropVideo.pause();

    const revealNodes = Array.from(new Set(document.querySelectorAll<HTMLElement>(REVEAL_SELECTOR)));
    revealNodes.forEach((node, index) => {
      node.classList.add("revealItem");
      if (index % 4 === 1) node.classList.add("reveal-left");
      if (index % 4 === 2) node.classList.add("reveal-right");
      node.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 55}ms`);
    });

    let observer: IntersectionObserver | null = null;
    if (!reducedMotion && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              (entry.target as HTMLElement).classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          }
        },
        { threshold: 0.1, rootMargin: "0px 0px -7% 0px" },
      );
      revealNodes.forEach((node) => observer?.observe(node));
    } else {
      revealNodes.forEach((node) => node.classList.add("is-visible"));
    }

    let raf = 0;
    const updateScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        const progress = Math.min(1, window.scrollY / max);
        root.style.setProperty("--scroll-progress", String(progress));
        root.style.setProperty("--video-y", `${Math.max(-46, -window.scrollY * .04)}px`);
        root.style.setProperty("--video-scale", String(1.035 + progress * .025));
      });
    };

    const updatePointer = (event: PointerEvent) => {
      if (reducedMotion || event.pointerType === "touch") return;
      root.style.setProperty("--pointer-x", `${event.clientX}px`);
      root.style.setProperty("--pointer-y", `${event.clientY}px`);
      root.style.setProperty("--pointer-rx", `${((event.clientY / Math.max(1, window.innerHeight)) - .5) * -7}deg`);
      root.style.setProperty("--pointer-ry", `${((event.clientX / Math.max(1, window.innerWidth)) - .5) * 9}deg`);
    };

    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    window.addEventListener("resize", updateScroll, { passive: true });
    window.addEventListener("pointermove", updatePointer, { passive: true });

    return () => {
      observer?.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      window.removeEventListener("scroll", updateScroll);
      window.removeEventListener("resize", updateScroll);
      window.removeEventListener("pointermove", updatePointer);
      root.classList.remove("motion-ready");
    };
  }, []);

  return (
    <>
      <div className="scrollProgress" aria-hidden="true" />
      <div className="cursorGlow" aria-hidden="true" />
    </>
  );
}
