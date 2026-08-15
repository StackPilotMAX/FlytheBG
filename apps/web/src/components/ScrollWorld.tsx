"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { AskFlytheBG } from "@/components/AskFlytheBG";

const clamp = (value: number, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function ScrollWorld() {
  const rootRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
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
      const next = clamp(-rect.top / scrollable);
      setProgress(next);

      const video = videoRef.current;
      if (video && Number.isFinite(video.duration) && video.duration > 0) {
        const target = Math.min(video.duration - 0.04, Math.max(0, next * video.duration));
        if (Math.abs(video.currentTime - target) > 0.075) video.currentTime = target;
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onPointer = (event: PointerEvent) => {
      setPointer({
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      });
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
  const askLift = progress < 0.62 ? Math.sin((progress / 0.62) * Math.PI) : 0;
  const style = {
    "--world-p": progress,
    "--world-sep": separation,
    "--world-finish": finish,
    "--world-fade": fade,
    "--mouse-x": pointer.x,
    "--mouse-y": pointer.y,
  } as CSSProperties;

  return (
    <section ref={rootRef} className="scrollWorld videoWorld" style={style} aria-label="FlytheBG interactive product story">
      <div className="worldSticky">
        <div className="worldNoise" aria-hidden="true" />
        <div className="cursorAura" aria-hidden="true" />
        <div className="worldGrid shell">
          <div className="worldCopy">
            <div className="worldChapter chapterOne">
              <span className="eyebrow"><i /> AI background remover</span>
              <h1>Your subject was never <em>the background.</em></h1>
              <p>Scroll through a real background-removal demo, then upload your own image and export a clean transparent PNG.</p>
              <div className="heroActions">
                <a className="primaryButton magnetic" href="#remove">Remove a background <span>↗</span></a>
                <a className="ghostButton" href="#story">Scroll to play the demo <span>↓</span></a>
              </div>
              <div className="heroTrustLine">
                <span><b>01</b> No account</span><span><b>02</b> &lt; 1h run metadata</span><span><b>03</b> Adaptive quality</span>
              </div>
            </div>
            <div className="worldChapter chapterTwo">
              <span className="worldNumber">01 / WATCH</span>
              <h2>Scroll it.<br/>Watch it happen.</h2>
              <p>The portrait demo stays fully framed while your scroll position scrubs through the clip. FlytheBG UI lives around the source rather than altering its attribution.</p>
            </div>
            <div className="worldChapter chapterThree">
              <span className="worldNumber">02 / REFINE</span>
              <h2>Real feedback.<br/>Safer learning.</h2>
              <p>Rate a result and FlytheBG can adjust bounded aggregate edge calibration. Your raw photo is not added to a training-image database.</p>
            </div>
            <div className="worldChapter chapterFour">
              <span className="worldNumber">03 / RELEASE</span>
              <h2>Keep the cutout.<br/>Lose the baggage.</h2>
              <p>Image bytes are released after processing. PostgreSQL stores only short-lived anonymous run metadata used for feedback and expiry.</p>
            </div>
          </div>

          <div className="worldVisual videoVisual">
            <div className="orbitRing ringA" aria-hidden="true" />
            <div className="orbitRing ringB" aria-hidden="true" />
            <div className="demoVideoRig">
              <div className="videoDepthPanel panelBack" aria-hidden="true" />
              <div className="videoDepthPanel panelMid" aria-hidden="true" />
              <div className="demoVideoFrame">
                <div className="videoBrandRail">
                  <span className="videoBrand"><img src="/brand/flythebg-mark.svg" alt="" width="22" height="22" /> FlytheBG</span>
                  <span className="videoMode">SCROLL-SCRUB DEMO</span>
                </div>
                <div className="demoVideoViewport">
                  <video
                    ref={videoRef}
                    className="heroDemoVideo"
                    src="/media/flythebg-car-demo.mp4"
                    muted
                    playsInline
                    preload="auto"
                    aria-label="Background-removal demonstration video"
                    onLoadedMetadata={() => {
                      const video = videoRef.current;
                      if (video && video.duration > 0) video.currentTime = Math.min(video.duration - 0.04, progress * video.duration);
                    }}
                  />
                  <div className="videoGlass" aria-hidden="true" />
                </div>
                <div className="videoMetaRail">
                  <span><i /> SOURCE CLIP</span>
                  <span>ATTRIBUTION PRESERVED</span>
                </div>
              </div>
              <div className="videoProgress" aria-hidden="true"><i /></div>
            </div>
            <div className="worldMeter"><span>SCROLL DEPTH</span><i><b /></i><strong>{Math.round(progress * 100).toString().padStart(2, "0")}%</strong></div>
          </div>
        </div>
        <AskFlytheBG lift={askLift} />
        <div className="worldScrollCue"><span>SCROLL</span><i /></div>
      </div>
    </section>
  );
}
