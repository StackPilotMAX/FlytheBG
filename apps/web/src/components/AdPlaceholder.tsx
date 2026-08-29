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
      // AdSense may reject a request while the site/ad unit is under review.
    }
  }, [canRenderManualAd, adSenseSlot]);

  if (!canRenderManualAd) return null;

  const adFormat =
    format === "rectangle" ? "rectangle" : format === "leaderboard" ? "horizontal" : "auto";

  return (
    <aside
      className={`adPlacement adPlacement--${format}`}
      aria-label="Advertisements"
      data-ad-placeholder="true"
      data-ad-providers="adsense monetag"
      data-adsense-placeholder="true"
      data-monetag-placeholder="true"
      data-ad-provider="adsense"
      data-ad-placement={slot}
    >
      <span className="adPlacementLabel">Advertisements</span>
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
