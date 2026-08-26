type AdPlaceholderProps = {
  slot: string;
  format?: "leaderboard" | "rectangle" | "responsive";
};

/**
 * Monetag ad channels are injected by the provider's tag configured in
 * MonetizationScripts. The supplied sw.js is the Monetag site-verification /
 * service-worker file and is served from /sw.js.
 *
 * Keep this component as a no-op until the exact Monetag ad-channel tag is
 * supplied for a placement. This prevents accidentally inventing a zone or
 * provider script and avoids leaving any AdSense code in the application.
 */
export function AdPlaceholder(_props: AdPlaceholderProps) {
  return null;
}
