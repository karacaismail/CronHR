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

describe("Kaldırılan 'Sistem' menüsü — Entegrasyonlar/Otomasyonlar artık Ayarlar içinde", () => {
  it("standalone /entegrasyonlar/ ve /otomasyonlar/ sayfaları yoktur", () => {
    expect(existsSync(join(ROOT, "src/pages/entegrasyonlar/index.astro"))).toBe(false);
    expect(existsSync(join(ROOT, "src/pages/otomasyonlar/index.astro"))).toBe(false);
  });

  it("nav.tsx'te 'sistem' grubu yoktur", () => {
    const nav = readFileSync(join(ROOT, "src/data/nav.tsx"), "utf8");
    expect(nav).not.toMatch(/id:\s*"sistem"/);
  });

  it("Ayarlar sayfası Entegrasyonlar ve Otomasyonlar bölümlerini barındırır", () => {
    const ayarlar = readFileSync(join(ROOT, "src/pages/ayarlar/index.astro"), "utf8");
    expect(ayarlar).toMatch(/id="entegrasyonlar"/);
    expect(ayarlar).toMatch(/id="otomasyonlar"/);
    expect(ayarlar).toMatch(/preset="automations"/);
  });

  it("eski /entegrasyonlar/ ve /otomasyonlar/ sayfalarına referans kalmamıştır", () => {
    const files = walk(join(ROOT, "src"), [".astro", ".tsx", ".ts"]);
    const bad = files.filter((f) => /["'`]\/(entegrasyonlar|otomasyonlar)\/["'`]/.test(readFileSync(f, "utf8")));
    expect(bad.map((f) => f.replace(ROOT, ""))).toEqual([]);
  });
});

describe("Yardım düğmesi üst çubuktan kaldırıldı — tek kaynak: sol alt hesap menüsü", () => {
  it("AdminLayout.astro topbar'da artık ayrı bir yardım ikon düğmesi yoktur", () => {
    const layout = readFileSync(join(ROOT, "src/layouts/AdminLayout.astro"), "utf8");
    expect(layout).not.toMatch(/Yardım ve mimari/);
    expect(layout).not.toMatch(/\bQuestion\b/);
  });

  it("Sidebar.astro AccountMenu'yü render eder, yardım bağlantısını içerir", () => {
    const sidebar = readFileSync(join(ROOT, "src/components/Sidebar.astro"), "utf8");
    expect(sidebar).toMatch(/from ["'].*islands\/AccountMenu["']/);
    expect(sidebar).toMatch(/<AccountMenu\b/);
  });

  it("AccountMenu.tsx ayarlar, profil ve hesap öğelerini içerir", () => {
    const menu = readFileSync(join(ROOT, "src/islands/AccountMenu.tsx"), "utf8");
    expect(menu).toMatch(/\bAyarlar\b/);
    expect(menu).toMatch(/Profilim/);
    expect(menu).toMatch(/Hesabım/);
  });
});

describe("Kaldırılan '/mimari/' sayfası — geliştirici/platform mimarisi son kullanıcı panelinde gösterilmez", () => {
  it("src/pages/mimari/ yoktur", () => {
    expect(existsSync(join(ROOT, "src/pages/mimari/index.astro"))).toBe(false);
  });

  it("hiçbir kaynakta '/mimari/' rotasına referans kalmamıştır", () => {
    const files = walk(join(ROOT, "src"), [".astro", ".tsx", ".ts"]);
    const bad = files.filter((f) => /["'`]\$\{base\}mimari\/["'`]|["'`]\/mimari\/["'`]/.test(readFileSync(f, "utf8")));
    expect(bad.map((f) => f.replace(ROOT, ""))).toEqual([]);
  });

  it("AccountMenu artık 'mimari' kelimesini içermez", () => {
    const menu = readFileSync(join(ROOT, "src/islands/AccountMenu.tsx"), "utf8");
    expect(menu.toLowerCase()).not.toMatch(/mimari/);
  });
});

describe("Görünüm (tema) anahtarı yalnızca Ayarlar'da — sol alt kenar çubuğunda değil", () => {
  it("Sidebar.astro artık ThemeSwitcher render etmez", () => {
    const sidebar = readFileSync(join(ROOT, "src/components/Sidebar.astro"), "utf8");
    expect(sidebar).not.toMatch(/ThemeSwitcher/);
    expect(sidebar).not.toMatch(/>Görünüm</);
  });

  it("Ayarlar sayfası ThemeSwitcher'ı render eder", () => {
    const ayarlar = readFileSync(join(ROOT, "src/pages/ayarlar/index.astro"), "utf8");
    expect(ayarlar).toMatch(/from ["'].*components\/ThemeSwitcher\.astro["']/);
    expect(ayarlar).toMatch(/<ThemeSwitcher\s*\/>/);
  });
});
