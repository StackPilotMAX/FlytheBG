"use client";

import { usePathname } from "next/navigation";
import { SceneUI } from "@/components/SceneUI";

export function ConditionalSceneUI() {
  const pathname = usePathname();

  // Homepage has its own cinematic scene switcher inside FlyTheBGJourney.
  // Never render shared scenery above homepage content.
  if (pathname === "/") return null;

  return <SceneUI />;
}
