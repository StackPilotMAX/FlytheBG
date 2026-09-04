"use client";

import { useState } from "react";

const scenes = [
  { label: "Golden Hour", src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081127_0992a171-d3c6-4978-8213-0ec5df8b6d63.mp4" },
  { label: "Still Water", src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_092026_dd05b805-ea0f-40b2-8c52-332b88502592.mp4" },
  { label: "Deep Woods", src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_081042_df7202bf-bd80-4b2b-bbc6-1f09ba2870e9.mp4" },
  { label: "Quiet Dawn", src: "https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260702_080959_4cac5234-3573-464e-a5b7-76b94b8a7d61.mp4" },
];

export function SceneUI() {
  const [active, setActive] = useState(0);
  const scene = scenes[active];
  return (
    <section className="sharedSceneUI" aria-label="Choose a FlyThe BG scene">
      <video key={scene.src} className="sharedSceneVideo" src={scene.src} autoPlay muted loop playsInline preload="metadata" aria-hidden="true" />
      <div className="sharedSceneShade" aria-hidden="true" />
      <div className="sharedSceneInner shell">
        <div className="sharedSceneCopy"><span>FlyThe BG scenes</span><strong>{scene.label}</strong><small>A consistent visual workspace across every tool.</small></div>
        <div className="sharedSceneOptions" role="tablist" aria-label="Scene options">
          {scenes.map((item, index) => <button key={item.label} type="button" role="tab" aria-selected={index === active} className={index === active ? "active" : ""} onClick={() => setActive(index)}>{String(index + 1).padStart(2, "0")} <span>{item.label}</span></button>)}
        </div>
      </div>
    </section>
  );
}
