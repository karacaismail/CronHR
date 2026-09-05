import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { randomSkeletonDelay, SKELETON_DELAY_MAX_MS, SKELETON_DELAY_MIN_MS } from "../src/scripts/motion-core";

/**
 * Her sayfa yüklendiğinde/gezinildiğinde içerik rastgele bir süre (550–2550ms
 * arası, her seferinde farklı) gerçek boyutlarıyla aynı bir "skeleton
 * shimmer" olarak görünür, sonra mevcut giriş koreografisiyle (motion.ts:
 * revealPage) ortaya çıkar. Statik demo veri gerçekten yüklenmiyor — gecikme
 * kasıtlı, his için.
 */
const ROOT = join(__dirname, "..");
const globalCss = () => readFileSync(join(ROOT, "src/styles/global.css"), "utf8");
const motionTs = () => readFileSync(join(ROOT, "src/scripts/motion.ts"), "utf8");

describe("randomSkeletonDelay (saf, DOM'suz)", () => {
  it("her zaman 550–2550ms aralığındadır", () => {
    for (let i = 0; i < 200; i++) {
      const ms = randomSkeletonDelay();
      expect(ms).toBeGreaterThanOrEqual(SKELETON_DELAY_MIN_MS);
      expect(ms).toBeLessThanOrEqual(SKELETON_DELAY_MAX_MS);
    }
  });

  it("rastgele üreticiye bağlıdır (enjekte edilebilir) ve sınır değerlerde uçları verir", () => {
    expect(randomSkeletonDelay(() => 0)).toBe(SKELETON_DELAY_MIN_MS);
    expect(randomSkeletonDelay(() => 1)).toBe(SKELETON_DELAY_MAX_MS);
  });

  it("sabit bir değer değil — art arda çağrılar değişkenlik gösterir", () => {
    const values = new Set(Array.from({ length: 20 }, () => randomSkeletonDelay()));
    expect(values.size).toBeGreaterThan(1);
  });
});

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

  it("motion-core.ts: SKELETON_DELAY_MIN_MS 550, SKELETON_DELAY_MAX_MS 2550", () => {
    expect(SKELETON_DELAY_MIN_MS).toBe(550);
    expect(SKELETON_DELAY_MAX_MS).toBe(2550);
  });

  it("motion.ts: sayfa yüklenince önce .is-skeleton eklenir, randomSkeletonDelay() ile rastgele bir gecikmeden sonra kaldırılıp mevcut giriş koreografisi (revealPage/countUp/drawCharts/parallax) tetiklenir", () => {
    const ts = motionTs();
    expect(ts).toMatch(/randomSkeletonDelay[\s\S]*?\}\s*from\s*"\.\/motion-core"/);
    expect(ts).toMatch(/function skeletonThenReveal/);
    expect(ts).toMatch(/classList\.add\("is-skeleton"\)/);
    expect(ts).toMatch(/window\.setTimeout\([\s\S]*?classList\.remove\("is-skeleton"\)[\s\S]*?revealPage\(\);[\s\S]*?countUp\(\);[\s\S]*?drawCharts\(\);[\s\S]*?parallax\(\);[\s\S]*?\},\s*randomSkeletonDelay\(\)\)/);
    expect(ts).toMatch(/startMotion[\s\S]*?skeletonThenReveal\(\)/);
  });

  it("motion.ts: reduced-motion/a11y'de iskelet hiç eklenmez (startMotion erken döner) ve güvenlik ağı/temayı kapatma yolu iskeleti temizler", () => {
    const ts = motionTs();
    expect(ts).toMatch(/if \(!shouldAnimate\(ctx\)\) return;\s*\n\s*safetyNet\(\);\s*\n\s*skeletonThenReveal\(\);/);
    expect(ts).toMatch(/function finishAll\(\) \{\s*\n\s*clearSkeletons\(\);/);
    expect(ts).toMatch(/if \(!shouldAnimate\(next\)\) \{\s*\n\s*clearSkeletons\(\);/);
  });
});
