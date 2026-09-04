import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Modal arka plan sözleşmesi: herhangi bir modal açıkken arkada kalan içerik
 * blur(2px) + soğuk gri %30 opaklıkta bir perde ile kaplanır. Tek kaynak:
 * global.css ".overlay-scrim"; her modal bu sınıfı kullanır (Flat 2.0
 * gradient/blur yasağının tek, kasıtlı istisnası).
 */
const ROOT = join(__dirname, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("Modal arka plan perdesi (.overlay-scrim)", () => {
  const css = read("src/styles/global.css");
  const rule = css.match(/\.overlay-scrim\s*{([^}]*)}/);

  it("tek kaynakta tanımlıdır: blur(2px) ve soğuk gri %30", () => {
    expect(rule).not.toBeNull();
    const body = rule![1];
    expect(body).toMatch(/backdrop-filter: ?blur\(2px\)/);
    expect(body).toMatch(/-webkit-backdrop-filter: ?blur\(2px\)/);
    // Soğuk gri (mavimsi gri) %30 opaklık — slate/cool-grey tonu, alfa 0.3.
    expect(body).toMatch(/rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\.3\s*\)/);
  });

  it("mobil çekmece perdesi bu sınıfı kullanır", () => {
    const layout = read("src/layouts/AdminLayout.astro");
    expect(layout).toMatch(/class="drawer-backdrop[^"]*overlay-scrim[^"]*"|class="[^"]*overlay-scrim[^"]*drawer-backdrop[^"]*"/);
  });

  it("DataTable filtre modalı bu sınıfı kullanır", () => {
    const table = read("src/islands/DataTable.tsx");
    expect(table).toMatch(/overlay-scrim/);
  });

  it("AiCommandCard'ın kendi sözleşmeli scrim'i (modal değildir) dokunulmadan kalır", () => {
    const card = read("src/components/AiCommandCard/AiCommandCard.module.css");
    expect(card).not.toMatch(/overlay-scrim/);
    expect(card).not.toMatch(/backdrop-filter/);
  });
});
