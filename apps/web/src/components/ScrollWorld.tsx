"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

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
                <div className="subjectHalo" />
                <svg viewBox="0 0 300 360" className="subjectSilhouette">
                  <path d="M150 44c40 0 72 32 72 72 0 34-23 63-55 70 62 9 103 60 103 132H30c0-72 41-123 103-132-32-7-55-36-55-70 0-40 32-72 72-72Z" fill="currentColor" />
                  <path d="M72 330c17-63 39-98 78-98s61 35 78 98" fill="none" stroke="rgba(255,255,255,.55)" strokeWidth="3" />
                </svg>
                <div className="subjectLabel">FOREGROUND</div>
              </div>
              <div className="scenePlane resultPlane">
                <div className="checkerMini" />
                <svg viewBox="0 0 300 360" className="subjectSilhouette resultSubject">
                  <path d="M150 44c40 0 72 32 72 72 0 34-23 63-55 70 62 9 103 60 103 132H30c0-72 41-123 103-132-32-7-55-36-55-70 0-40 32-72 72-72Z" fill="currentColor" />
                </svg>
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
