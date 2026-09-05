import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Tasarım sistemi sözleşmesi: gradient yok, emoji yok, kontrast AA/AAA. */

const ROOT = join(__dirname, "..");

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
}

function lum(hex: string): number {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);
  const f = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: string, b: string): number {
  const la = lum(a);
  const lb = lum(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

function tokens(block: string): Record<string, string> {
  return Object.fromEntries([...block.matchAll(/--([a-z0-9-]+): (#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2]]));
}

const global = readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
const themes = readFileSync(join(ROOT, "src/styles/themes.css"), "utf8");
const light = tokens(global.split(":root {")[1].split("}")[0]);
const dark = { ...light, ...tokens(themes.split(':root[data-theme="dark"] {')[1].split("}")[0]) };
const a11y = { ...light, ...tokens(themes.split(':root[data-theme="a11y"] {')[1].split("}")[0]) };

const TEXT_PAIRS: [string, string][] = [
  ["ink", "surface"], ["ink-2", "surface"], ["ink-muted", "surface"], ["ink-faint", "surface"],
  ["ink-muted", "surface-muted"], ["ink-faint", "surface-muted"], ["ink-muted", "surface-sunken"],
  ["ink", "bg"], ["ink-muted", "bg"], ["accent", "surface"], ["accent-ink", "accent-soft"], ["accent-ink", "surface"],
  ["on-accent", "accent-bg"], ["good-ink", "good-soft"], ["warning-ink", "warning-soft"], ["serious-ink", "serious-soft"],
  ["critical-ink", "critical-soft"], ["info-ink", "info-soft"], ["good-ink", "surface"], ["critical-ink", "surface"],
  ["accent-ink", "ai-surface"], ["ink", "ai-surface"], ["ink-2", "ai-surface"], ["ink-muted", "ai-surface"],
];
const UI_PAIRS: [string, string][] = [
  ["border-control", "surface"], ["accent-bg", "surface"], ["focus-ring", "surface"], ["focus-ring", "bg"],
  ["good", "surface"], ["warning", "surface"], ["critical", "surface"], ["info", "surface"], ["accent", "bg"],
  ["series-1", "surface"], ["series-2", "surface"], ["series-3", "surface"], ["series-4", "surface"],
];

describe("renk sözleşmesi", () => {
  it.each([
    ["light", light, 4.5, 3],
    ["dark", dark, 4.5, 3],
    ["a11y", a11y, 7, 4.5],
  ] as const)("%s teması metin ve UI kontrastını sağlar", (_name, t, textMin, uiMin) => {
    const fails: string[] = [];
    for (const [fg, bg] of TEXT_PAIRS) {
      expect(t[fg], `${fg} tanımlı`).toBeDefined();
      expect(t[bg], `${bg} tanımlı`).toBeDefined();
      const r = contrast(t[fg], t[bg]);
      if (r < textMin) fails.push(`${fg}/${bg}=${r.toFixed(2)}`);
    }
    for (const [fg, bg] of UI_PAIRS) {
      const r = contrast(t[fg], t[bg]);
      if (r < uiMin) fails.push(`ui ${fg}/${bg}=${r.toFixed(2)}`);
    }
    expect(fails).toEqual([]);
  });
});

describe("Flat 2.0 sözleşmesi", () => {
  const files = walk(join(ROOT, "src"), [".css", ".astro", ".tsx", ".ts"]);

  it("hiçbir kaynakta gradient, blur, iç gölge, text-shadow yok (tek istisna: modal perdesi .overlay-scrim)", () => {
    const bad = files.filter((f) => {
      let content = readFileSync(f, "utf8");
      if (f.endsWith("global.css")) {
        // .overlay-scrim: her modalın ortak arka plan perdesi (blur 2px + soğuk
        // gri %30). Flat 2.0'ın gradient/blur yasağının tek, kasıtlı istisnası;
        // bkz. tests/overlay.test.ts.
        content = content.replace(/\.overlay-scrim\s*{[^}]*}/g, "");
      }
      return /gradient\(|backdrop-filter|filter: ?blur|text-shadow|inset 0 [1-9-]/.test(content);
    });
    expect(bad.map((f) => f.replace(ROOT, ""))).toEqual([]);
  });

  it("hiçbir kaynakta emoji yok (ikonlar Phosphor)", () => {
    const emoji = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}]/u;
    const bad = files.filter((f) => emoji.test(readFileSync(f, "utf8")));
    expect(bad.map((f) => f.replace(ROOT, ""))).toEqual([]);
  });

  it("global CSS mobile-first: max-width medya sorgusu yok, akışkan tip tokenları var", () => {
    const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
    expect(css).not.toMatch(/@media \(max-width/);
    expect(css).toMatch(/--fs-body: clamp\(/);
    expect(css).toMatch(/--space-4: clamp\(/);
    expect(css).toMatch(/@media \(min-width: 48em\)/);
    expect(css).toMatch(/@media \(min-width: 64em\)/);
  });

  it("sayfalarda yerel <select> kullanılmaz; standart Select bileşeni kullanılır", () => {
    const pages = walk(join(ROOT, "src/pages"), [".astro"]);
    const bad = pages.filter((f) => /<select\b/.test(readFileSync(f, "utf8")));
    expect(bad.map((f) => f.replace(ROOT, ""))).toEqual([]);
  });

  it("kenar çubuğu her kırılımda viewport'a sabittir (fixed + inset-block:0), üstten kaymaz", () => {
    const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
    // Taban kural (medya sorgusuz, mobil-öncelikli): position:fixed + inset-block:0
    // masaüstünde de (64em bloğu position'ı bir daha ezmez) kenar çubuğunu tepeye
    // sabitler — 72px mini ray ↔ tam genişlik geçişi yalnızca inline-size ile
    // olur, position değişmez (regresyon: eskiden 64em'de sticky'e geri dönüyordu).
    const baseRuleMatch = css.match(/\n\.sidebar\s*\{([^}]*)\}/);
    expect(baseRuleMatch, "taban .sidebar kuralı bulunamadı").not.toBeNull();
    const baseRule = baseRuleMatch![1];
    expect(baseRule).toMatch(/position:\s*fixed/);
    expect(baseRule).toMatch(/inset-block:\s*0/);

    const desktopBlocks = [...css.matchAll(/@media \(min-width: 64em\) \{([\s\S]*?)\n\}/g)];
    expect(desktopBlocks.length, "64em kırılım bloğu bulunamadı").toBeGreaterThan(0);
    const desktopBlock = desktopBlocks.map((m) => m[1]).find((b) => /\.sidebar\s*\{/.test(b));
    expect(desktopBlock, ".sidebar kuralını içeren 64em bloğu bulunamadı").toBeTruthy();
    const sidebarRuleMatch = desktopBlock!.match(/\.sidebar\s*\{([^}]*)\}/);
    expect(sidebarRuleMatch, ".sidebar kuralı 64em bloğunda bulunamadı").not.toBeNull();
    const rule = sidebarRuleMatch![1];
    // 64em bloğu position'ı yeniden tanımlamaz (taban fixed geçerliliğini korur).
    expect(rule).not.toMatch(/position:/);
    expect(rule).not.toMatch(/(?<!-)inset(-block-start)?:\s*auto/);
  });

  it("mobil alt gezinme viewport'a sabittir: fixed + inset-block-end:0, bir transform/sticky ile yer değiştirmez", () => {
    const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
    const ruleMatch = css.match(/\.bottom-nav\s*\{([^}]*)\}/);
    expect(ruleMatch, ".bottom-nav kuralı bulunamadı").not.toBeNull();
    const rule = ruleMatch![1];
    expect(rule).toMatch(/position:\s*fixed/);
    expect(rule).toMatch(/inset-block-end:\s*0/);
    expect(rule).toMatch(/inset-inline:\s*0/);
    expect(rule).not.toMatch(/position:\s*sticky/);
    // GSAP parallax yalnızca bu iki hedefi kullanır; .app/.content/body'de
    // transform oluşmaz — oluşsaydı fixed öğenin konum bağlamı bozulurdu.
    const motion = readFileSync(join(ROOT, "src/scripts/motion.ts"), "utf8");
    const parallaxTargets = motion.match(/const orb = .*\n.*const head = .*\n.*const targets = \[([^\]]*)\]/);
    expect(parallaxTargets).not.toBeNull();
    expect(parallaxTargets![1]).toMatch(/orb, head/);
  });

  it("html/body'de overflow-x:hidden YOKTUR (regresyon: bu, sticky header/sidebar'ı ve pencere kaydırmasını kırar)", () => {
    // CSS'in "interlocking" kuralı: bir eksende overflow visible değilse
    // diğer eksen de otomatik olarak "auto" sayılır. html/body'ye
    // overflow-x:hidden koymak overflow-y:auto'yu da tetikler; bu da
    // window.scrollY'nin hiç ilerlememesine ve .topbar/.sidebar'daki
    // position:sticky'nin bozulmasına yol açtı (gerçek regresyon, ölçüldü).
    // Yatay taşma varsa kaynağında (ör. .row-between gibi) düzeltilmeli.
    const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
    const htmlRule = css.match(/(?<!\.)\bhtml\s*\{([^}]*)\}/);
    const bodyRule = css.match(/(?<!\.)\bbody\s*\{([^}]*)\}/);
    expect(htmlRule, "html kuralı bulunamadı").not.toBeNull();
    expect(bodyRule, "body kuralı bulunamadı").not.toBeNull();
    expect(htmlRule![1]).not.toMatch(/overflow-x/);
    expect(bodyRule![1]).not.toMatch(/overflow-x/);
  });

  it("row-between esnemeyen bir satır yerine gerekirse sarar (dar/uzun içerik taşırmaz)", () => {
    const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
    const rule = css.match(/\.row-between\s*\{([^}]*)\}/);
    expect(rule, ".row-between kuralı bulunamadı").not.toBeNull();
    expect(rule![1]).toMatch(/flex-wrap:\s*wrap/);
  });

  it("üst çubuğun (.topbar) sayfa zemininden ayrı, belirgin bir sınırı vardır (yüzey rengi + alt kenarlık)", () => {
    const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
    const rule = css.match(/\.topbar\s*\{([^}]*)\}/);
    expect(rule, ".topbar kuralı bulunamadı").not.toBeNull();
    const body = rule![1];
    // Sayfa zemini (--bg) ile aynı renk kullanılırsa üst çubuğun nerede
    // başlayıp bittiği belirsizleşir (regresyon).
    expect(body).toMatch(/background:\s*var\(--surface\)/);
    expect(body).not.toMatch(/background:\s*var\(--bg\)/);
    expect(body).toMatch(/border-bottom:\s*1px solid var\(--border\)/);
  });
});

describe("Primary ölçek ('cold black') ve kategorik gökkuşağı paleti", () => {
  it("light temada --accent-1..9 basamaklı bir ölçek tanımlıdır; primary (--accent) ölçeğin en koyusudur", () => {
    for (let i = 1; i <= 9; i++) {
      expect(light[`accent-${i}`], `--accent-${i} tanımlı`).toBeDefined();
    }
    expect(light.accent.toLowerCase()).toBe(light["accent-9"].toLowerCase());
    expect(light["accent-9"].toLowerCase()).toBe("#0b0f19");
  });

  it("9 kategorik avatar tonu vardır, her biri beyaz baş harfle AA (>=4.5:1) sağlar", () => {
    const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
    const hues = [...css.matchAll(/\.avatar\[data-hue="(\d)"\]\s*\{\s*background:\s*(#[0-9a-fA-F]{6});/g)];
    expect(hues.length).toBe(9);
    const seen = new Set<string>();
    for (const [, idx, hex] of hues) {
      seen.add(idx);
      const r = contrast(hex, "#ffffff");
      expect(r, `hue ${idx} (${hex}) beyaz üstünde >=4.5:1`).toBeGreaterThanOrEqual(4.5);
    }
    expect(seen.size).toBe(9);
  });

  it("a11y temasında 9 avatar tonunun da AAA (>=7:1) karşılığı vardır", () => {
    const themesCss = readFileSync(join(ROOT, "src/styles/themes.css"), "utf8");
    const hues = [...themesCss.matchAll(/:root\[data-theme="a11y"\] \.avatar\[data-hue="(\d)"\]\s*\{\s*background:\s*(#[0-9a-fA-F]{6});/g)];
    expect(hues.length).toBe(9);
    for (const [, idx, hex] of hues) {
      const r = contrast(hex, "#ffffff");
      expect(r, `a11y hue ${idx} (${hex}) beyaz üstünde >=7:1`).toBeGreaterThanOrEqual(7);
    }
  });

  it("avatar bileşenleri artık 9 tona göre döngüye giriyor (% 6 kalmadı)", () => {
    const files = [
      "src/components/Avatar.astro",
      "src/pages/calisanlar/[id]/index.astro",
      "src/islands/tablePresets.tsx",
    ];
    for (const f of files) {
      const content = readFileSync(join(ROOT, f), "utf8");
      expect(content, `${f} içinde % 9 bekleniyor`).toMatch(/% 9/);
    }
  });

  it("series-1..4 (grafik) renkleri birbirinden farklıdır ve yüzeyde >=3:1 sağlar", () => {
    const values = [1, 2, 3, 4].map((i) => light[`series-${i}`]);
    expect(new Set(values.map((v) => v.toLowerCase())).size).toBe(4);
    for (const v of values) {
      expect(contrast(v, light.surface)).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("Seçili/aktif durum sınırları (WCAG 1.4.11) — komşu yüzeyden ayırt edilebilir", () => {
  // Regresyon: "background: var(--accent-soft)" (ya da salt var(--surface))
  // seçili durumu, bitiştiği gerçek komşu yüzeyden (sidebar/content zemini,
  // segment/theme-switch konteyneri) ölçülerek ~1,0-1,3:1 kadar ayırt
  // ediliyordu — WCAG 1.4.11 ihlali. Artık dolu accent-bg + on-accent
  // kullanılıyor; üç temada da >=3:1 olduğu burada kilitlenir.
  const cases: [string, Record<string, string>][] = [
    ["light", light],
    ["dark", dark],
    ["a11y", a11y],
  ];

  it.each(cases)("%s: .switch açık durumu (--good) yüzeyle >=3:1", (_name, t) => {
    expect(contrast(t.good, t.surface)).toBeGreaterThanOrEqual(3);
  });

  it.each(cases)("%s: .nav-item aktif sayfa arka planı (--accent-bg) kenar çubuğu yüzeyiyle >=3:1, metin (--on-accent) >=4.5:1", (_name, t) => {
    expect(contrast(t["accent-bg"], t.surface)).toBeGreaterThanOrEqual(3);
    expect(contrast(t["on-accent"], t["accent-bg"])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(cases)("%s: .segment/.theme-switch seçili arka planı (--accent-bg) konteyner yüzeyiyle (--surface-muted) >=3:1", (_name, t) => {
    expect(contrast(t["accent-bg"], t["surface-muted"])).toBeGreaterThanOrEqual(3);
  });

  it.each(cases)("%s: .settings-rail-item aktif arka planı (--accent-bg) sayfa zeminiyle (--bg) >=3:1", (_name, t) => {
    expect(contrast(t["accent-bg"], t.bg)).toBeGreaterThanOrEqual(3);
  });

  it("global.css: .switch/.segment/.nav-item/.settings-rail-item artık zayıf accent-soft/salt-surface yerine dolu accent-bg kullanır", () => {
    const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
    const switchRule = css.match(/\.switch\[aria-checked="true"\]\s*\{([^}]*)\}/);
    expect(switchRule![1]).toMatch(/background:\s*var\(--good\)/);

    const segmentRule = css.match(/\.segment > button\[aria-pressed="true"\]\s*\{([^}]*)\}/);
    expect(segmentRule![1]).toMatch(/background:\s*var\(--accent-bg\)/);

    const navRule = css.match(/\.nav-item\[aria-current="page"\]\s*\{([^}]*)\}/);
    expect(navRule![1]).toMatch(/background:\s*var\(--accent-bg\)/);

    const railRule = css.match(/\.settings-rail-item\[aria-current="true"\]\s*\{([^}]*)\}/);
    expect(railRule![1]).toMatch(/background:\s*var\(--accent-bg\)/);
  });

  it("themes.css: .theme-switch buton aktif durumu dolu accent-bg kullanır", () => {
    const css = readFileSync(join(ROOT, "src/styles/themes.css"), "utf8");
    const rule = css.match(/\.theme-switch button\[aria-pressed="true"\]\s*\{([^}]*)\}/);
    expect(rule![1]).toMatch(/background:\s*var\(--accent-bg\)/);
  });
});
