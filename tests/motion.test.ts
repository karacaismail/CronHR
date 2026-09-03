import { describe, expect, it } from "vitest";
import { parseNumeric, formatLike, shouldAnimate, revealTargets } from "../src/scripts/motion-core";

describe("hareket çekirdeği", () => {
  it("reduced-motion veya a11y temasında animasyon kapalıdır", () => {
    expect(shouldAnimate({ reducedMotion: true, theme: "light" })).toBe(false);
    expect(shouldAnimate({ reducedMotion: false, theme: "a11y" })).toBe(false);
    expect(shouldAnimate({ reducedMotion: false, theme: "dark" })).toBe(true);
    expect(shouldAnimate({ reducedMotion: false, theme: "light" })).toBe(true);
    expect(shouldAnimate({ reducedMotion: false, theme: "light", userOff: true })).toBe(false);
  });

  it("KPI metnindeki sayıyı Türkçe biçimden okur", () => {
    expect(parseNumeric("120")).toEqual({ value: 120, decimals: 0 });
    expect(parseNumeric("%3,2")).toEqual({ value: 3.2, decimals: 1 });
    expect(parseNumeric("4.862.400 ₺")).toEqual({ value: 4862400, decimals: 0 });
    expect(parseNumeric("4,86 M ₺")).toEqual({ value: 4.86, decimals: 2 });
    expect(parseNumeric("Hazır")).toBeNull();
    expect(parseNumeric("17 / 20")).toEqual({ value: 17, decimals: 0 });
  });

  it("sayıyı orijinal metnin biçimine göre yazar", () => {
    expect(formatLike("4.862.400 ₺", 1234567)).toBe("1.234.567 ₺");
    expect(formatLike("%3,2", 2.8)).toBe("%2,8");
    expect(formatLike("120", 57)).toBe("57");
    expect(formatLike("4,86 M ₺", 2.5)).toBe("2,50 M ₺");
    expect(formatLike("17 / 20", 9)).toBe("9 / 20");
  });

  it("reveal hedefleri sayfa akışı sırasına göre gruplanır", () => {
    document.body.innerHTML = `
      <main class="content">
        <header class="page-head"></header>
        <section class="ai-brief"></section>
        <div class="grid"><div class="kpi"></div><div class="kpi"></div></div>
        <section class="panel"></section>
      </main>`;
    const groups = revealTargets(document.body);
    expect(groups.map((g) => g.length)).toEqual([1, 1, 2, 1]);
  });
});
