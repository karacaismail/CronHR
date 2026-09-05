import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Masaüstünde kenar çubuğu varsayılan olarak ~72px'lik yarı saydam bir ikon
 * rayıdır; sol üstteki burger (.menu-btn) tıklanınca aynı .sidebar tam
 * genişliğe büyür. Mobil çekmece ile aynı `data-drawer` durumu paylaşılır.
 */
const ROOT = join(__dirname, "..");
const globalCss = () => readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
const desktopBlock = (css: string) => {
  const blocks = [...css.matchAll(/@media \(min-width: 64em\) \{([\s\S]*?)\n\}/g)].map((m) => m[1]);
  const block = blocks.find((b) => /\.sidebar\s*\{/.test(b));
  if (!block) throw new Error("64em .sidebar bloğu bulunamadı");
  return block;
};

describe("Masaüstü mini ray + burger (sol üst) ile aç/kapa", () => {
  it("AdminLayout.astro: sol üstte bir burger düğmesi var, .sidebar'ı kontrol eder", () => {
    const html = readFileSync(join(ROOT, "src/layouts/AdminLayout.astro"), "utf8");
    expect(html).toMatch(/class="icon-btn menu-btn"/);
    expect(html).toMatch(/data-drawer-toggle/);
    expect(html).toMatch(/aria-controls="kenar-cubugu"/);
  });

  it("64em bloğunda .menu-btn artık gizlenmez (masaüstünde de burger görünür)", () => {
    const css = globalCss();
    const block = desktopBlock(css);
    expect(block).not.toMatch(/\.menu-btn\s*[,{]/);
  });

  it("64em bloğunda .sidebar varsayılan olarak ~72px ve yarı saydam (color-mix %10)", () => {
    const block = desktopBlock(globalCss());
    const rule = block.match(/\.sidebar\s*\{([^}]*)\}/)![1];
    expect(rule).toMatch(/inline-size:\s*72px/);
    expect(rule).toMatch(/color-mix\(in srgb, var\(--surface\) 10%, transparent\)/);
  });

  it("[data-drawer='open'] .sidebar tam genişliğe (--sidebar-w) ve dolu yüzeye geçer", () => {
    const block = desktopBlock(globalCss());
    const rule = block.match(/:root\[data-drawer="open"\] \.sidebar\s*\{([^}]*)\}/);
    expect(rule, "[data-drawer='open'] .sidebar kuralı bulunamadı").not.toBeNull();
    expect(rule![1]).toMatch(/inline-size:\s*var\(--sidebar-w\)/);
    expect(rule![1]).toMatch(/background:\s*var\(--surface\)/);
  });

  it("mini rayda menü (.nav, tüm ikonlarıyla) tamamen gizlenir — yalnızca burger ile açılan tam genişlikte geri görünür", () => {
    const block = desktopBlock(globalCss());
    const hideRule = block.match(/:root:not\(\[data-drawer="open"\]\) \.sidebar \.brand-name,[\s\S]*?\{ display: none; \}/);
    expect(hideRule, "mini ray gizleme kuralı bulunamadı").not.toBeNull();
    for (const cls of [".brand-name", ".brand-quote", ".nav", ".context-text"]) {
      expect(hideRule![0]).toContain(cls);
    }
  });

  it("Sidebar.astro: nav etiketleri artık .nav-label sınıfıyla işaretli (mini rayda gizlenebilsin)", () => {
    const html = readFileSync(join(ROOT, "src/components/Sidebar.astro"), "utf8");
    expect(html).toMatch(/<span class="nav-label">\{group\.label\}<\/span>/);
    expect(html).toMatch(/<span class="nav-label">\{leaf\.label\}<\/span>/);
  });

  it("regresyon: .sidebar taşmayı kesmez (overflow:visible) — tek eksenli overflow-y:auto olsaydı mini rayda TenantSwitcher/AccountMenu açılır menüleri kırpılırdı", () => {
    const css = globalCss();
    const baseRule = css.match(/\n\.sidebar\s*\{([^}]*)\}/)![1];
    expect(baseRule).toMatch(/overflow:\s*visible/);
    expect(baseRule).not.toMatch(/overflow-y:/);
  });

  it("uzun liste yalnızca .nav içinde kayar (flex + min-block-size:0 + overflow-y:auto)", () => {
    const css = globalCss();
    const navRule = css.match(/\n\.nav\s*\{([^}]*)\}/)![1];
    expect(navRule).toMatch(/flex:\s*1 1 auto/);
    expect(navRule).toMatch(/min-block-size:\s*0/);
    expect(navRule).toMatch(/overflow-y:\s*auto/);
  });

  it("AccountMenu.module.css ve Select.module.css: mini rayda açılır menüler .sidebar genişliğine değil sabit bir genişliğe açılır", () => {
    const accountCss = readFileSync(join(ROOT, "src/islands/AccountMenu.module.css"), "utf8");
    expect(accountCss).toMatch(/:global\(:root:not\(\[data-drawer="open"\]\)\) \.menu\s*\{[^}]*inline-size:\s*220px/);
    const selectCss = readFileSync(join(ROOT, "src/islands/Select.module.css"), "utf8");
    expect(selectCss).toMatch(/:global\(:root:not\(\[data-drawer="open"\]\) \.sidebar\) \.list\s*\{[^}]*inline-size:\s*240px/);
  });
});
