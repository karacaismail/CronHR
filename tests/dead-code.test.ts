import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Kaldırılan özelliklerin kalıntısı kalmasın: AI zaten AiCommandCard'ın
 * arama/komuta yüzeyinden erişilebildiği için ayrı bir "Copilot" sohbet
 * çekmecesi kaldırıldı (bileşen, motor, layout bağlantısı, mobil giriş).
 * Bu test onun bir daha sessizce geri gelmediğini doğrular.
 */
const ROOT = join(__dirname, "..");

function walk(dir: string, exts: string[], out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, exts, out);
    else if (exts.some((e) => p.endsWith(e))) out.push(p);
  }
  return out;
}

describe("Kaldırılan Copilot sohbeti — kalıntı kalmadı", () => {
  it("bileşen ve motor dosyaları yoktur", () => {
    expect(existsSync(join(ROOT, "src/islands/Copilot.tsx"))).toBe(false);
    expect(existsSync(join(ROOT, "src/islands/Copilot.module.css"))).toBe(false);
    expect(existsSync(join(ROOT, "src/ai/copilot.ts"))).toBe(false);
  });

  it("hiçbir kaynakta 'cronhr:copilot' olayına veya Copilot bileşenine referans yoktur", () => {
    const files = walk(join(ROOT, "src"), [".astro", ".tsx", ".ts", ".css"]);
    const bad = files.filter((f) => /cronhr:copilot|from ["'].*\/Copilot["']|<Copilot\b/.test(readFileSync(f, "utf8")));
    expect(bad.map((f) => f.replace(ROOT, ""))).toEqual([]);
  });

  it("mobil alt gezinme dört öğeye göre ayarlıdır (Copilot yuvası kalmadı)", () => {
    const css = readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
    expect(css).toMatch(/\.bottom-nav\s*\{[^}]*repeat\(4,/);
    expect(css).not.toMatch(/\.bn-ai/);
    expect(css).not.toMatch(/\.copilot-desktop-btn/);
  });
});
