import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/** Derleme çıktısı sözleşmesi (npm run build sonrası çalışır). */
const DIST = join(__dirname, "..", "dist");

function htmlFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) htmlFiles(p, out);
    else if (p.endsWith(".html")) out.push(p);
  }
  return out;
}

const skip = !existsSync(DIST);

describe.skipIf(skip)("dist çıktısı", () => {
  const files = skip ? [] : htmlFiles(DIST);

  it("46 sayfa üretilmiştir", () => {
    expect(files.length).toBeGreaterThanOrEqual(46);
  });

  it.each(files.map((f) => [f.replace(DIST, "")]))("%s: dil, skip link, ana içerik, yerel select yok, gradient yok", (rel) => {
    const html = readFileSync(join(DIST, rel), "utf8");
    expect(html).toMatch(/<html lang="tr"/);
    expect(html).toContain('class="skip-link"');
    expect(html).toContain('id="icerik"');
    expect(html).not.toMatch(/<select\b/);
    expect(html).not.toMatch(/gradient\(/);
  });

  it("CSS paketlerinde gradient yoktur (istisna: .is-skeleton parlaklık bandı — bkz. tests/tokens.test.ts)", () => {
    const css = readdirSync(join(DIST, "_astro")).filter((f) => f.endsWith(".css"));
    for (const f of css) {
      const content = readFileSync(join(DIST, "_astro", f), "utf8").replace(/\.is-skeleton:{1,2}after\{[^}]*\}/g, "");
      expect(content).not.toMatch(/gradient\(/);
    }
  });

  it.skipIf(skip)("Görünüm (tema) anahtarı yalnızca Ayarlar sayfasındadır", () => {
    const rels = files.map((f) => f.replace(DIST, ""));
    const ayarlarRel = rels.find((r) => r.includes("ayarlar") && r.endsWith("index.html"));
    expect(ayarlarRel, "ayarlar/index.html bulunamadı").toBeTruthy();
    expect(readFileSync(join(DIST, ayarlarRel!), "utf8")).toMatch(/data-theme-switch/);
    const withSwitch = rels.filter((r) => r !== ayarlarRel && readFileSync(join(DIST, r), "utf8").includes("data-theme-switch"));
    expect(withSwitch).toEqual([]);
  });
});
