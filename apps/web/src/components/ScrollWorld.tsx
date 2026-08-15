"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

function GenericCar({ id, result = false }: { id: string; result?: boolean }) {
  const paintId = `${id}-paint`;
  const glassId = `${id}-glass`;
  const lightId = `${id}-light`;
  const metalId = `${id}-metal`;

  return (
    <svg viewBox="0 0 520 300" className={`genericCar${result ? " resultCar" : ""}`} role="presentation">
      <defs>
        <linearGradient id={paintId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f8fbff" />
          <stop offset="0.22" stopColor="#b7d7ea" />
          <stop offset="0.5" stopColor="#35556d" />
          <stop offset="0.72" stopColor="#172c3d" />
          <stop offset="1" stopColor="#08131d" />
        </linearGradient>
        <linearGradient id={glassId} x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0" stopColor="#dff5ff" stopOpacity="0.9" />
          <stop offset="0.35" stopColor="#6ba4c4" stopOpacity="0.78" />
          <stop offset="1" stopColor="#142b3e" stopOpacity="0.96" />
        </linearGradient>
        <radialGradient id={lightId} cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.35" stopColor="#c8f3ff" />
          <stop offset="1" stopColor="#5dc9ff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={metalId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#dbe8f0" />
          <stop offset="0.45" stopColor="#6f8798" />
          <stop offset="1" stopColor="#1c2b36" />
        </linearGradient>
      </defs>

      <ellipse className="carGroundShadow" cx="260" cy="247" rx="194" ry="29" fill="#02070c" opacity="0.48" />

      <g className="carMotionBody">
        <path className="carBody" d="M72 202c8-30 25-48 55-58l54-18 49-55c12-13 28-20 46-20h73c24 0 42 7 58 23l45 46 25 7c26 7 42 21 49 45l7 23c3 10-3 20-14 22l-44 8H102c-21 0-34-7-38-21l8-2Z" fill={`url(#${paintId})`} />
        <path className="carLowerBody" d="M78 194c81 11 263 11 374-2l56-7 5 21c2 9-4 17-14 19l-42 7H103c-24 0-37-8-40-23l15-15Z" fill="#07131c" opacity="0.86" />
        <path className="carRoof" d="M181 126l48-54c11-12 27-19 43-19h74c18 0 34 6 47 18l43 46-255 9Z" fill={`url(#${glassId})`} stroke="#d5f4ff" strokeOpacity="0.36" strokeWidth="2" />
        <path className="carPillar" d="M298 55l-20 68" stroke="#102638" strokeWidth="9" strokeLinecap="round" />
        <path className="carPillar rear" d="M390 74l-28 47" stroke="#102638" strokeWidth="8" strokeLinecap="round" />
        <path className="carDoorLine" d="M270 128l-17 84M362 123l10 83" fill="none" stroke="#d9f1ff" strokeOpacity="0.18" strokeWidth="2" />
        <path className="carReflection" d="M112 163c103-37 245-43 333-19-74-5-157 5-228 27-45 14-78 17-105 10Z" fill="#effaff" opacity="0.28" />
        <path className="carShoulder" d="M110 176c110-25 250-27 346-8" fill="none" stroke="#9bdcff" strokeOpacity="0.34" strokeWidth="4" strokeLinecap="round" />
        <path className="carFrontIntake" d="M421 177c34-5 61-2 79 7l-7 18-59 5-13-30Z" fill="#02090e" opacity="0.9" />
        <path className="carRearDetail" d="M95 174l49-8-6 19-50 5 7-16Z" fill="#6ccfff" opacity="0.62" />

        <g className="carHeadlights">
          <path d="M431 157c31-4 52 0 65 10-22 0-43 5-63 14l-2-24Z" fill="#dff8ff" />
          <ellipse className="headlightGlow" cx="472" cy="164" rx="54" ry="31" fill={`url(#${lightId})`} />
        </g>

        <g className="carWheel carWheelRear" transform="translate(157 218)">
          <circle r="49" fill="#02060a" />
          <circle r="35" fill={`url(#${metalId})`} />
          <circle r="12" fill="#0b1720" />
          <path d="M0-29V-13M0 13V29M-29 0H-13M13 0H29M-21-21l10 10M11 11l10 10M21-21L11-11M-11 11l-10 10" stroke="#d9e6ee" strokeOpacity="0.66" strokeWidth="4" strokeLinecap="round" />
        </g>
        <g className="carWheel carWheelFront" transform="translate(407 218)">
          <circle r="49" fill="#02060a" />
          <circle r="35" fill={`url(#${metalId})`} />
          <circle r="12" fill="#0b1720" />
          <path d="M0-29V-13M0 13V29M-29 0H-13M13 0H29M-21-21l10 10M11 11l10 10M21-21L11-11M-11 11l-10 10" stroke="#d9e6ee" strokeOpacity="0.66" strokeWidth="4" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

export function ScrollWorld() {
  const rootRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      const scrollable = Math.max(1, root.offsetHeight - window.innerHeight);
      setProgress(clamp(-rect.top / scrollable));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onPointer = (event: PointerEvent) => {
      const x = (event.clientX / window.innerWidth - 0.5) * 2;
      const y = (event.clientY / window.innerHeight - 0.5) * 2;
      setPointer({ x, y });
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  const separation = clamp((progress - 0.12) / 0.5);
  const finish = clamp((progress - 0.58) / 0.32);
  const fade = clamp((progress - 0.82) / 0.18);
  const style = {
    "--world-p": progress,
    "--world-sep": separation,
    "--world-finish": finish,
    "--world-fade": fade,
    "--mouse-x": pointer.x,
    "--mouse-y": pointer.y,
  } as CSSProperties;

  return (
    <section ref={rootRef} className="scrollWorld" style={style} aria-label="FlytheBG interactive product story">
      <div className="worldSticky">
        <div className="worldNoise" aria-hidden="true" />
        <div className="cursorAura" aria-hidden="true" />
        <div className="worldGrid shell">
          <div className="worldCopy">
            <div className="worldChapter chapterOne">
              <span className="eyebrow"><i /> AI background remover</span>
              <h1>Your subject was never <em>the background.</em></h1>
              <p>FlytheBG separates the part you care about from everything behind it — then gives you a clean, editable transparent PNG.</p>
              <div className="heroActions">
                <a className="primaryButton magnetic" href="#remove">Remove a background <span>↗</span></a>
                <a className="ghostButton" href="#story">Scroll to see the cut <span>↓</span></a>
              </div>
              <div className="heroTrustLine">
                <span><b>01</b> No account</span><span><b>02</b> ≤ 1h temporary retention</span><span><b>03</b> Adaptive quality</span>
              </div>
            </div>
            <div className="worldChapter chapterTwo">
              <span className="worldNumber">01 / SEPARATE</span>
              <h2>One image.<br/>Two realities.</h2>
              <p>The foreground moves toward you while the old scene falls away. That same separation happens in the private inference service.</p>
            </div>
            <div className="worldChapter chapterThree">
              <span className="worldNumber">02 / REFINE</span>
              <h2>Edges that learn from feedback.</h2>
              <p>Rate a result and FlytheBG adjusts aggregate mask calibration. Your raw photo is not added to a training database.</p>
            </div>
            <div className="worldChapter chapterFour">
              <span className="worldNumber">03 / RELEASE</span>
              <h2>Keep the cutout.<br/>Lose the baggage.</h2>
              <p>Processing bytes are released after the request. Any temporary run identifier expires within one hour.</p>
            </div>
          </div>

          <div className="worldVisual" aria-hidden="true">
            <div className="orbitRing ringA" />
            <div className="orbitRing ringB" />
            <div className="sceneDeck">
              <div className="sceneShadow" />
              <div className="scenePlane backgroundPlane">
                <div className="skyGlow" />
                <div className="horizon" />
                <div className="mountain mountainA" />
                <div className="mountain mountainB" />
                <div className="sceneBadge">ORIGINAL</div>
              </div>
              <div className="scenePlane subjectPlane">
                <div className="subjectHalo carHalo" />
                <GenericCar id="source-car" />
                <div className="subjectLabel">GENERIC · UNBRANDED</div>
              </div>
              <div className="scenePlane resultPlane">
                <div className="checkerMini" />
                <GenericCar id="result-car" result />
                <div className="resultBadge">PNG · ALPHA</div>
              </div>
              {Array.from({ length: 12 }).map((_, index) => (
                <i key={index} className={`pixelShard shard${index + 1}`} />
              ))}
            </div>
            <div className="worldMeter"><span>SCROLL DEPTH</span><i><b /></i><strong>{Math.round(progress * 100).toString().padStart(2, "0")}%</strong></div>
          </div>
        </div>
        <div className="worldScrollCue"><span>SCROLL</span><i /></div>
      </div>
    </section>
  );
}
