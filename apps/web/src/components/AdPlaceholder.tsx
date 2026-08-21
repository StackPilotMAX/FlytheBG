import { getAdSlotConfig } from "@/lib/monetization";

type AdPlaceholderProps = {
  slot: string;
  format?: "leaderboard" | "rectangle" | "responsive";
};

export function AdPlaceholder({ slot, format = "responsive" }: AdPlaceholderProps) {
  const providerSlots = getAdSlotConfig(slot);
  return (
    <aside
      className={`adPlacement adPlacement--${format}`}
      aria-label="Advertisements"
      data-ad-placeholder="true"
      data-ad-slot={slot}
      data-ad-providers="adsense monetag"
    >
      <span className="adPlacementLabel">Advertisements</span>
      <div
        className="adPlacementSlot"
        data-adsense-placeholder={slot}
        data-adsense-slot-id={providerSlots.adsense || undefined}
        data-monetag-placeholder={slot}
        data-monetag-zone-id={providerSlots.monetag || undefined}
        aria-hidden="true"
      />
    </aside>
  );
}
