"use client";

import { useEffect, useState } from "react";

const storageKey = "flythebg-october-2026-feature-notice-dismissed";

export function FeatureAnnouncement() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      setVisible(window.localStorage.getItem(storageKey) !== "1");
    } catch {
      setVisible(true);
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      window.localStorage.setItem(storageKey, "1");
    } catch {
      // The notice still dismisses for this page view if storage is unavailable.
    }
  }

  if (!visible) return null;

  return (
    <aside className="featureAnnouncement" role="status" aria-label="FlytheBG product announcement">
      <span className="featureAnnouncementSpark" aria-hidden="true">✦</span>
      <div className="featureAnnouncementCopy">
        <strong>New FlytheBG features are coming in October 2026.</strong>
        <span>More browser-first image tools and workflow upgrades are on the way.</span>
      </div>
      <button type="button" onClick={dismiss} aria-label="Dismiss October feature announcement">×</button>
    </aside>
  );
}
