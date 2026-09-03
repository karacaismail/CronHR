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
    expect(html).toMatch(/data-theme-switch/);
  });

  it("CSS paketlerinde gradient yoktur", () => {
    const css = readdirSync(join(DIST, "_astro")).filter((f) => f.endsWith(".css"));
    for (const f of css) expect(readFileSync(join(DIST, "_astro", f), "utf8")).not.toMatch(/gradient\(/);
  });
});
