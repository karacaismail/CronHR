import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Regresyon: "AI'ya sor" çipleri (data-ask-ai) `cronhr:ask` olayını sorgu
 * metniyle fırlatıyordu ama CommandBar bu metni hiç kullanmıyor, yalnızca
 * kartı boş açıyordu (kullanıcı: "panel açılıyor ama ai simülasyonu yok").
 * CommandBar artık genişledikten sonra sorguyu kompozitöre yazıp formu
 * gönderiyor.
 */
const ROOT = join(__dirname, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("'AI'ya sor' çipleri artık sorguyu gerçekten gönderir", () => {
  it("CommandBar.tsx, cronhr:ask olayının detail.query'sini okur ve kompozitöre yazıp gönderir", () => {
    const content = read("src/islands/CommandBar.tsx");
    expect(content).toMatch(/\.detail\?\.query/);
    expect(content).toMatch(/data-slot="ai-search-composer"/);
    expect(content).toMatch(/requestSubmit\(\)/);
  });

  it("kart zaten açıksa geçiş animasyonu beklemeden gönderir (expandedRef)", () => {
    const content = read("src/islands/CommandBar.tsx");
    expect(content).toMatch(/expandedRef/);
  });

  it("AdminLayout.astro hâlâ data-ask-ai tıklamalarını query ile cronhr:ask olarak fırlatır", () => {
    const content = read("src/layouts/AdminLayout.astro");
    expect(content).toMatch(/data-ask-ai/);
    expect(content).toMatch(/detail:\s*\{\s*query:/);
  });
});
