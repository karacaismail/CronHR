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

  it("masaüstünde kenar çubuğu yapışkandır: top:0 bir inset kısayoluyla ezilmez", () => {
    const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
    const desktopBlockMatch = css.match(/@media \(min-width: 64em\) \{([\s\S]*?)\n\}/);
    expect(desktopBlockMatch, "64em kırılım bloğu bulunamadı").not.toBeNull();
    const desktopBlock = desktopBlockMatch![1];
    const sidebarRuleMatch = desktopBlock.match(/\.sidebar\s*\{([^}]*)\}/);
    expect(sidebarRuleMatch, ".sidebar kuralı 64em bloğunda bulunamadı").not.toBeNull();
    const rule = sidebarRuleMatch![1];
    expect(rule).toMatch(/position:\s*sticky/);
    expect(rule).toMatch(/top:\s*0/);
    // `inset:` kısayolu, ondan önce gelen `top: 0` bildirimini sessizce ezer
    // (regresyon: sidebar bir daha yapışkanlığını kaybetmesin).
    expect(rule).not.toMatch(/(?<!-)inset:\s*auto/);
  });
});
