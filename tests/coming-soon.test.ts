import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { NAV_TREE } from "../src/data/nav";

/**
 * Kenar çubuğu item'larına "Yeni"/"Yakında" pill'i (nav.tsx: status alanı).
 * "Yakında" işaretli sayfalar kalıcı bir iskelette kalır (motion.ts:
 * lockSkeleton) — veri DOM'da durur, silinmez, yalnızca hiç görünmez.
 */
const ROOT = join(__dirname, "..");

const ACTIVE_MUST_HAVE_IDS = ["ayarlar", "calisanlar", "ozluk", "belgeler", "pdks", "vardiya", "bordrolar", "ucretler", "odemeler", "onboarding", "raporlar"];
const SOON_MUST_HAVE_IDS = ["beyannameler", "terfiler", "offboarding", "performans", "egitim", "vakalar", "portallar"];

function allEntries(): { id: string; status?: "new" | "soon" }[] {
  const out: { id: string; status?: "new" | "soon" }[] = [];
  for (const g of NAV_TREE) {
    out.push({ id: g.id, status: g.status });
    for (const l of g.children ?? []) out.push({ id: l.id, status: l.status });
  }
  return out;
}

describe("nav.tsx: 'Yeni'/'Yakında' sınıflandırması", () => {
  it("kullanıcının belirttiği 'aktif olmazsa olmaz' item'lar status taşımaz (Yakında değildir)", () => {
    const entries = allEntries();
    for (const id of ACTIVE_MUST_HAVE_IDS) {
      const e = entries.find((x) => x.id === id);
      expect(e, `${id} nav.tsx'te bulunamadı`).toBeTruthy();
      expect(e!.status, `${id} 'aktif olmazsa olmaz' listesinde ama status='soon'`).not.toBe("soon");
    }
  });

  it("kullanıcının belirttiği 'pasif olmazsa olmaz' item'lar (MVP'de olmasa da olur) 'soon' işaretlidir", () => {
    const entries = allEntries();
    for (const id of SOON_MUST_HAVE_IDS) {
      const e = entries.find((x) => x.id === id);
      expect(e, `${id} nav.tsx'te bulunamadı`).toBeTruthy();
      expect(e!.status).toBe("soon");
    }
    // Portallar grubunun her iki çocuğu da (grup "soon" olduğu için) kilitli olmalı.
    const portalChildren = entries.filter((x) => x.id === "calisan-portali" || x.id === "yonetici-portali");
    expect(portalChildren).toHaveLength(2);
    for (const c of portalChildren) expect(c.status).toBe("soon");
  });

  it("'soon' işaretli HR Vakaları artık gerçek zamanlı sayı rozeti taşımıyor (veri gizli kalmalı — sahte bir sayı göstermemeli)", () => {
    const vakalar = NAV_TREE.find((g) => g.id === "vakalar")!;
    expect(vakalar.status).toBe("soon");
    expect(vakalar.badge).toBeUndefined();
  });

  it("her nav item'ı en fazla bir status taşır ve yalnızca 'new' | 'soon' değerlerini alır", () => {
    for (const e of allEntries()) {
      if (e.status !== undefined) expect(["new", "soon"]).toContain(e.status);
    }
  });
});

describe("Sidebar.astro: status pill render", () => {
  const html = () => readFileSync(join(ROOT, "src/components/Sidebar.astro"), "utf8");

  it("standalone item, grup özeti ve alt menü linkinin üçünde de nav-status render edilir", () => {
    const src = html();
    expect(src).toMatch(/STATUS_LABEL = \{ new: "Yeni", soon: "Yakında" \}/);
    const occurrences = src.match(/<span class="nav-status" data-status=\{[^}]+\.status\}>\{STATUS_LABEL\[[^\]]+\.status\]\}<\/span>/g) ?? [];
    expect(occurrences.length, "nav-status render'ı 3 yerde (standalone, summary, leaf) bekleniyor").toBe(3);
  });
});

describe("global.css: .nav-status pill stilleri", () => {
  const css = () => readFileSync(join(ROOT, "src/styles/global.css"), "utf8");

  it(".nav-status[data-status='new'] ve [data-status='soon'] görsel olarak ayırt edilebilir", () => {
    const c = css();
    const newRule = c.match(/\.nav-status\[data-status="new"\]\s*\{([^}]*)\}/);
    const soonRule = c.match(/\.nav-status\[data-status="soon"\]\s*\{([^}]*)\}/);
    expect(newRule, ".nav-status[data-status='new'] kuralı bulunamadı").not.toBeNull();
    expect(soonRule, ".nav-status[data-status='soon'] kuralı bulunamadı").not.toBeNull();
    expect(newRule![1]).not.toEqual(soonRule![1]);
  });
});

describe("AdminLayout.astro + motion.ts: 'Yakında' sayfaları kalıcı iskelette kalır, veri silinmez", () => {
  const layout = () => readFileSync(join(ROOT, "src/layouts/AdminLayout.astro"), "utf8");
  const motion = () => readFileSync(join(ROOT, "src/scripts/motion.ts"), "utf8");

  it("AdminLayout: isComingSoon nav.tsx status='soon'den türetilir ve .content'e data-coming-soon olarak geçilir", () => {
    const src = layout();
    expect(src).toMatch(/const isComingSoon = \(page\.leaf\?\.status \?\? page\.group\.status\) === "soon";/);
    expect(src).toMatch(/data-coming-soon=\{isComingSoon \? "true" : undefined\}/);
  });

  it("AdminLayout: 'Yakında' sayfasında ekran okuyucu için görsel olarak gizli bir not var (sr-only)", () => {
    expect(layout()).toMatch(/\{isComingSoon \? <p class="sr-only">[^<]+<\/p> : null\}/);
  });

  it("motion.ts: lockSkeleton, DOM'u SİLMEDEN yalnızca .is-skeleton-locked ekler; skeletonThenReveal 'yakında' sayfasında hiç çağrılmaz", () => {
    const ts = motion();
    expect(ts).toMatch(/function lockSkeleton\(\)[\s\S]*?classList\.add\("is-skeleton-locked"\)/);
    expect(ts).not.toMatch(/\.remove\("is-skeleton-locked"\)/);
    expect(ts).not.toMatch(/\.removeChild|\.remove\(\);|innerHTML\s*=\s*""/);
    expect(ts).toMatch(/if \(comingSoon\) lockSkeleton\(\);/);
    expect(ts).toMatch(/if \(!comingSoon\) skeletonThenReveal\(\);/);
  });

  it("motion.ts: isComingSoon .content[data-coming-soon='true'] okur", () => {
    expect(motion()).toMatch(/function isComingSoon\(\)[\s\S]*?getAttribute\("data-coming-soon"\) === "true"/);
  });
});

describe("global.css: .is-skeleton-locked HER kutuda görünür 'Yakında' yazısı gösterir (yalnızca .is-skeleton değil)", () => {
  const css = () => readFileSync(join(ROOT, "src/styles/global.css"), "utf8");

  it(".is-skeleton-locked::before içerik olarak 'Yakında' ekler, ortalanmış ve şeffaf katmandan (color:transparent) etkilenmez", () => {
    const c = css();
    const rule = c.match(/\.is-skeleton-locked::before\s*\{([^}]*)\}/);
    expect(rule, ".is-skeleton-locked::before kuralı bulunamadı").not.toBeNull();
    expect(rule![1]).toMatch(/content:\s*"Yakında"/);
    expect(rule![1]).toMatch(/display:\s*flex/);
    expect(rule![1]).toMatch(/align-items:\s*center/);
    expect(rule![1]).toMatch(/justify-content:\s*center/);
    // .is-skeleton-locked * { color: transparent !important } yalnızca gerçek
    // DOM soyundan gelenleri hedefler, ::before kendi rengini taşımalı.
    expect(rule![1]).toMatch(/color:\s*var\(--ink-faint\)/);
  });

  it("'Yakında' yazısı, kayan parlaklık bandının (::after) ÜSTÜNDE kalır (z-index)", () => {
    const c = css();
    const before = c.match(/\.is-skeleton-locked::before\s*\{([^}]*)\}/)![1];
    const after = c.match(/\.is-skeleton::after,\s*\n\.is-skeleton-locked::after\s*\{([^}]*)\}/)![1];
    const beforeZ = Number(before.match(/z-index:\s*(\d+)/)![1]);
    const afterZ = Number(after.match(/z-index:\s*(\d+)/)![1]);
    expect(beforeZ).toBeGreaterThan(afterZ);
  });

  it("normal (geçici) .is-skeleton kutularında 'Yakında' yazısı YOK — yalnızca kalıcı .is-skeleton-locked'da", () => {
    const c = css();
    expect(c).not.toMatch(/\.is-skeleton::before/);
  });
});
