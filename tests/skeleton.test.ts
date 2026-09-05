import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Her sayfa yüklendiğinde/gezinildiğinde içerik kısa bir süre (550ms) gerçek
 * boyutlarıyla aynı bir "skeleton shimmer" olarak görünür, sonra mevcut giriş
 * koreografisiyle (motion.ts: revealPage) ortaya çıkar. Statik demo veri
 * gerçekten yüklenmiyor — gecikme kasıtlı, his için.
 */
const ROOT = join(__dirname, "..");
const globalCss = () => readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
const motionTs = () => readFileSync(join(ROOT, "src/scripts/motion.ts"), "utf8");

describe("İskelet (skeleton) shimmer — gecikmeli ön yükleme", () => {
  it("global.css: .is-skeleton içeriği görünmez kılar (boyut/düzen korunur), * için renk/arka plan şeffaf", () => {
    const css = globalCss();
    const root = css.match(/\n\.is-skeleton\s*\{([^}]*)\}/);
    expect(root, ".is-skeleton kuralı bulunamadı").not.toBeNull();
    expect(root![1]).toMatch(/background:\s*var\(--skeleton-base\)/);
    expect(root![1]).toMatch(/pointer-events:\s*none/);

    const children = css.match(/\n\.is-skeleton \*\s*\{([^}]*)\}/);
    expect(children, ".is-skeleton * kuralı bulunamadı").not.toBeNull();
    expect(children![1]).toMatch(/color:\s*transparent/);

    const placeholder = css.match(/\n\.is-skeleton input::placeholder,\s*\n\.is-skeleton textarea::placeholder\s*\{([^}]*)\}/);
    expect(placeholder, ".is-skeleton input/textarea::placeholder kuralı bulunamadı (regresyon: gerçek yer tutucu metni şeffaf katmanın altından sızardı)").not.toBeNull();
  });

  it("global.css: kayan parlaklık bandı @keyframes skeleton-shimmer ile animasyonlu, reduced-motion'da durur", () => {
    const css = globalCss();
    expect(css).toMatch(/@keyframes skeleton-shimmer/);
    expect(css).toMatch(/\.is-skeleton::after\s*\{[^}]*animation:\s*skeleton-shimmer/);
    const reducedBlock = css.match(/@media \(prefers-reduced-motion: reduce\) \{\s*\.is-skeleton::after \{ animation: none; \}/);
    expect(reducedBlock, "reduced-motion'da .is-skeleton::after animasyonu durdurulmuyor").not.toBeNull();
  });

  it("her temada --skeleton-base ve --skeleton-shine tanımlıdır (light/dark/a11y)", () => {
    const global = globalCss();
    expect(global).toMatch(/--skeleton-base:/);
    expect(global).toMatch(/--skeleton-shine:/);
    const themes = readFileSync(join(ROOT, "src/styles/themes.css"), "utf8");
    const darkBlock = themes.match(/:root\[data-theme="dark"\]\s*\{[\s\S]*?\n\}/)![0];
    const a11yBlock = themes.match(/:root\[data-theme="a11y"\]\s*\{[\s\S]*?\n\}/)![0];
    expect(darkBlock).toMatch(/--skeleton-base:/);
    expect(a11yBlock).toMatch(/--skeleton-base:/);
  });

  it("motion.ts: sayfa yüklenince önce .is-skeleton eklenir, kasıtlı bir gecikmeden sonra kaldırılıp mevcut giriş koreografisi (revealPage/countUp/drawCharts/parallax) tetiklenir", () => {
    const ts = motionTs();
    expect(ts).toMatch(/function skeletonThenReveal/);
    expect(ts).toMatch(/classList\.add\("is-skeleton"\)/);
    expect(ts).toMatch(/window\.setTimeout\([\s\S]*?classList\.remove\("is-skeleton"\)[\s\S]*?revealPage\(\);[\s\S]*?countUp\(\);[\s\S]*?drawCharts\(\);[\s\S]*?parallax\(\);[\s\S]*?\},\s*SKELETON_DELAY_MS\)/);
    expect(ts).toMatch(/startMotion[\s\S]*?skeletonThenReveal\(\)/);
  });

  it("motion.ts: reduced-motion/a11y'de iskelet hiç eklenmez (startMotion erken döner) ve güvenlik ağı/temayı kapatma yolu iskeleti temizler", () => {
    const ts = motionTs();
    expect(ts).toMatch(/if \(!shouldAnimate\(ctx\)\) return;\s*\n\s*safetyNet\(\);\s*\n\s*skeletonThenReveal\(\);/);
    expect(ts).toMatch(/function finishAll\(\) \{\s*\n\s*clearSkeletons\(\);/);
    expect(ts).toMatch(/if \(!shouldAnimate\(next\)\) \{\s*\n\s*clearSkeletons\(\);/);
  });
});
