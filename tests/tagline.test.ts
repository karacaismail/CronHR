import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TAGLINES } from "../src/data/taglines";
import { nextIndex, pickInterval, startTagline } from "../src/scripts/tagline";

const ROOT = join(__dirname, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("Motto verisi (24 duayen tonlu slogan)", () => {
  it("tam 24 özgün, makul uzunlukta motto içerir", () => {
    expect(TAGLINES.length).toBe(24);
    expect(new Set(TAGLINES).size).toBe(24);
    for (const t of TAGLINES) {
      expect(t.length).toBeGreaterThan(8);
      expect(t.length).toBeLessThanOrEqual(48);
      expect(t.trim()).toBe(t);
    }
  });

  it("eski statik etiketi birebir tekrar etmez (gerçek bir rotasyon)", () => {
    expect(TAGLINES).not.toContain("İşgücü işletim sistemi");
  });
});

describe("Rotasyon mantığı (saf, DOM'suz)", () => {
  it("nextIndex bir öncekini tekrar etmez", () => {
    expect(nextIndex(0, 5, () => 0)).not.toBe(0);
    expect(nextIndex(3, 5, () => 0.6)).not.toBe(3);
  });

  it("tek elemanlı listede her zaman 0 döner", () => {
    expect(nextIndex(0, 1, () => 0.9)).toBe(0);
  });

  it("pickInterval her zaman 6000-9000 ms aralığındadır", () => {
    for (const r of [0, 0.25, 0.5, 0.75, 0.999]) {
      const v = pickInterval(6000, 9000, () => r);
      expect(v).toBeGreaterThanOrEqual(6000);
      expect(v).toBeLessThanOrEqual(9000);
    }
  });
});

describe("startTagline (DOM orkestrasyonu, sahte zamanlayıcı)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("aralık dolunca solar (opacity 0), geçiş süresi sonunda yeni metinle belirir (opacity 1)", () => {
    const el = document.createElement("span");
    el.textContent = TAGLINES[0];
    const seq = [0.999, 0.1, 0.999, 0.1];
    let i = 0;
    const random = () => seq[i++ % seq.length];
    const ctl = startTagline(el, TAGLINES, { minMs: 1000, maxMs: 2000, fadeMs: 100, random });

    expect(el.textContent).toBe(TAGLINES[0]);
    vi.advanceTimersByTime(2000);
    expect(el.style.opacity).toBe("0");
    expect(el.textContent).toBe(TAGLINES[0]);
    vi.advanceTimersByTime(100);
    expect(el.style.opacity).toBe("1");
    expect(el.textContent).not.toBe(TAGLINES[0]);
    ctl.stop();
  });

  it("stop() sonrası hiçbir zamanlayıcı metni değiştirmez", () => {
    const el = document.createElement("span");
    el.textContent = TAGLINES[0];
    const ctl = startTagline(el, TAGLINES, { minMs: 500, maxMs: 500, fadeMs: 50 });
    ctl.stop();
    vi.advanceTimersByTime(20000);
    expect(el.textContent).toBe(TAGLINES[0]);
  });

  it("geçiş için CSS transition (opacity) uygular — ani sıçrama değil", () => {
    const el = document.createElement("span");
    const ctl = startTagline(el, TAGLINES, { fadeMs: 400 });
    expect(el.style.transition).toMatch(/opacity 400ms ease/);
    ctl.stop();
  });
});

describe("Sidebar bağlantısı: motto yalnızca hareket açıkken döner", () => {
  it("Sidebar.astro TAGLINES ve startTagline'ı içe aktarır, hareket bağlamına göre başlatır/durdurur", () => {
    const sidebar = read("src/components/Sidebar.astro");
    expect(sidebar).toMatch(/from ["'].*data\/taglines["']/);
    expect(sidebar).toMatch(/from ["'].*scripts\/tagline["']/);
    expect(sidebar).toMatch(/shouldAnimate/);
    expect(sidebar).toMatch(/readMotionContext/);
    expect(sidebar).not.toMatch(/İşgücü işletim sistemi/);
  });
});

describe("Marka satırı: logo/ad, mottodan bağımsız sabit bir satırdır (regresyon)", () => {
  it("Sidebar.astro logoyu ve adı ayrı bir .brand-row içine koyar, motto ayrı satırdadır", () => {
    const sidebar = read("src/components/Sidebar.astro");
    expect(sidebar).toMatch(/<span class="brand-row">/);
    const rowMatch = sidebar.match(/<span class="brand-row">([\s\S]*?)<\/span>\s*<span class="brand-tag"/);
    expect(rowMatch, "brand-row, brand-tag'den önce kapanmalı").not.toBeNull();
    expect(rowMatch![1]).toMatch(/brand-mark/);
    expect(rowMatch![1]).toMatch(/brand-name/);
  });

  it("global.css: .brand dikey (column) yerleşimlidir; .brand-row motto yüksekliğinden etkilenmeyecek şekilde sabittir", () => {
    const css = read("src/styles/global.css");
    const brandRule = css.match(/\.brand\s*\{([^}]*)\}/);
    expect(brandRule, ".brand kuralı bulunamadı").not.toBeNull();
    expect(brandRule![1]).toMatch(/flex-direction:\s*column/);

    const rowRule = css.match(/\.brand-row\s*\{([^}]*)\}/);
    expect(rowRule, ".brand-row kuralı bulunamadı").not.toBeNull();
    expect(rowRule![1]).toMatch(/flex:\s*none/);

    const markRule = css.match(/\.brand-mark\s*\{([^}]*)\}/);
    expect(markRule![1]).toMatch(/flex:\s*none/);
  });

  it(".brand-tag için 3 satırlık sabit alan ayrılmıştır (kısa metin bile aynı yüksekliği kaplar)", () => {
    const css = read("src/styles/global.css");
    const tagRule = css.match(/\.brand-tag\s*\{([^}]*)\}/);
    expect(tagRule, ".brand-tag kuralı bulunamadı").not.toBeNull();
    const body = tagRule![1];
    // Sabit block-size (min DEĞİL): display:-webkit-box + line-clamp,
    // kısa metinde min-block-size'ı yok sayıp alanı 1 satıra küçültüyordu
    // (canlıda ölçülerek doğrulanan gerçek regresyon). Düz sabit yükseklik
    // + overflow:hidden hem kısayı doldurmaz bırakır hem taşanı keser.
    expect(body).not.toMatch(/-webkit-box|line-clamp/);
    expect(body).toMatch(/block-size:\s*calc\(1\.35em \* 3\)/);
    expect(body).toMatch(/overflow:\s*hidden/);
  });
});
