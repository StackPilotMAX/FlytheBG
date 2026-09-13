"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

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
      <AnimatePresence initial={false}>
        <motion.video
          key={scene.src}
          className="sharedSceneVideo"
          src={scene.src}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-hidden="true"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 0.34, scale: 1.01 }}
          exit={{ opacity: 0, scale: 1.08 }}
          transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
        />
      </AnimatePresence>
      <div className="sharedSceneShade" aria-hidden="true" />
      <div className="sharedSceneInner shell">
        <div className="sharedSceneCopy">
          <span>FlyThe BG scenes</span>
          <AnimatePresence mode="wait">
            <motion.strong
              key={scene.label}
              initial={{ y: 14, opacity: 0, filter: "blur(6px)" }}
              animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
              exit={{ y: -14, opacity: 0, filter: "blur(6px)" }}
              transition={{ duration: 0.5, ease: [0.2, 0.9, 0.25, 1] }}
            >
              {scene.label}
            </motion.strong>
          </AnimatePresence>
          <small>A consistent visual workspace across every tool.</small>
        </div>
        <div className="sharedSceneOptions" role="tablist" aria-label="Scene options">
          {scenes.map((item, index) => (
            <motion.button
              key={item.label}
              type="button"
              role="tab"
              aria-selected={index === active}
              className={index === active ? "active" : ""}
              onClick={() => setActive(index)}
              whileTap={{ scale: 0.97, y: -1 }}
              transition={{ type: "spring", stiffness: 420, damping: 22 }}
            >
              {String(index + 1).padStart(2, "0")} <span>{item.label}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
