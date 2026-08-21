type AdPlaceholderProps = {
  slot: string;
  format?: "leaderboard" | "rectangle" | "responsive";
};

export function AdPlaceholder({ slot, format = "responsive" }: AdPlaceholderProps) {
  return (
    <aside
      className={`adPlacement adPlacement--${format}`}
      aria-label="Advertisement"
      data-ad-placeholder="true"
      data-ad-slot={slot}
      data-ad-providers="adsense monetag"
    >
      <span className="adPlacementLabel">Advertisement</span>
      <div
        className="adPlacementSlot"
        data-adsense-placeholder={slot}
        data-monetag-placeholder={slot}
        aria-hidden="true"
      />
    </aside>
  );
}
