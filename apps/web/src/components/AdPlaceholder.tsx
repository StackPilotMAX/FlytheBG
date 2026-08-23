"use client";

import { useEffect, useRef } from "react";
import { getAdSlotConfig, monetizationConfig } from "@/lib/monetization";

type AdPlaceholderProps = {
  slot: string;
  format?: "leaderboard" | "rectangle" | "responsive";
};

const validAdSenseSlot = /^\d+$/;

export function AdPlaceholder({ slot, format = "responsive" }: AdPlaceholderProps) {
  const adRef = useRef<HTMLModElement | null>(null);
  const adSenseSlot = getAdSlotConfig(slot).adsense.trim();
  const canRenderManualAd =
    monetizationConfig.adsenseEnabled &&
    monetizationConfig.adsenseClientValid &&
    validAdSenseSlot.test(adSenseSlot);

  useEffect(() => {
    if (!canRenderManualAd || !adRef.current) return;
    if (adRef.current.dataset.adsbygoogleStatus) return;

    try {
      const adsWindow = window as Window & {
        adsbygoogle?: Array<Record<string, unknown>>;
      };
      adsWindow.adsbygoogle = adsWindow.adsbygoogle || [];
      adsWindow.adsbygoogle.push({});
    } catch {
      // AdSense can reject a request while the site/unit is still being reviewed.
      // The global loader remains active, including for Auto Ads.
    }
  }, [canRenderManualAd, adSenseSlot]);

  // Never emit a visual placeholder or provider-neutral ad object. If this site
  // uses AdSense Auto Ads, the global AdSense loader handles placement itself.
  // A reserved manual placement appears only after a real AdSense ad-unit slot
  // ID is configured for it.
  if (!canRenderManualAd) return null;

  const adFormat =
    format === "rectangle" ? "rectangle" : format === "leaderboard" ? "horizontal" : "auto";

  return (
    <aside
      className={`adPlacement adPlacement--${format}`}
      aria-label="Advertisement"
      data-ad-provider="adsense"
      data-ad-placement={slot}
    >
      <span className="adPlacementLabel">Advertisement</span>
      <ins
        ref={adRef}
        className="adsbygoogle adPlacementSlot"
        style={{ display: "block" }}
        data-ad-client={monetizationConfig.adsenseClient}
        data-ad-slot={adSenseSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </aside>
  );
}
