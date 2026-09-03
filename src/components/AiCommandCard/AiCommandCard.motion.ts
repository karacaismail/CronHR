import { useEffect, useState } from "react";

/** Motion durations, mirrored in AiCommandCard.module.css tokens. Kept here
 * so the controller can schedule its animation-complete fallback timers.
 * KEMİK KURAL: açılışta önce radius morph'u (RADIUS_MORPH_MS), sonra büyüme —
 * toplam süreler bu yüzden iki fazın toplamıdır. */
export const RADIUS_MORPH_MS = 700;
export const EXPAND_DURATION_MS = 700 + RADIUS_MORPH_MS;
export const COLLAPSE_DURATION_MS = 700 + RADIUS_MORPH_MS;
export const REVEAL_DELAY_MS = 150;
export const ITEM_STAGGER_MS = 35;

export type ResolvedMotion = "full" | "reduced";

/**
 * Resolves the effective motion mode. "system" tracks prefers-reduced-motion
 * live so toggling the OS setting takes effect without a remount.
 */
export function useResolvedMotion(
  preference: "system" | "full" | "reduced",
): ResolvedMotion {
  const [systemReduced, setSystemReduced] = useState<boolean>(() =>
    typeof window !== "undefined" && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (event: MediaQueryListEvent) => setSystemReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  if (preference === "reduced") return "reduced";
  if (preference === "full") return "full";
  return systemReduced ? "reduced" : "full";
}
