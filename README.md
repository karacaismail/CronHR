# CronHR — AI-first işgücü işletim sistemi (İK paneli)

Her şeyin içinde AI olan bir insan kaynakları admin paneli. Yalnızca frontend
(Astro + React island'ları); veriler sahte fixture'lardan gelir, AI yanıtları
simüle edilir.

- Canlı: https://karacaismail.github.io/CronHR/
- Komuta kartı: [codexpanelaicard](https://github.com/karacaismail/codexpanelaicard) reposundaki
  `AiCommandCard` (tek yüzey, yerinde morph) olduğu gibi taşındı; 12 komut kartı ana menüdür.

## Komutlar

```bash
npm install     # bağımlılıklar
npm run dev     # http://localhost:4321/CronHR/
npm run build   # astro check + statik dist/
npm run preview # dist/ önizleme
```

## Yapı

| Yol | Sorumluluk |
|---|---|
| `src/components/AiCommandCard/` | Kaynak repodan taşınan komuta kartı (dokunulmaz sözleşme) |
| `src/islands/CommandBar.tsx` | Kartın CronHR bağlayıcısı: menü, breadcrumb, öneri, navigasyon |
| `src/islands/AiHint.tsx` | Satır/alan/kart düzeyinde AI yardımcısı (inline + popover) |
| `src/islands/hrReports.tsx` | Kartın zengin AI yanıtları (grafik/tablo) ve sahte sorgu motoru |
| `src/components/*.astro` | Sidebar, AiBrief, Kpi, Panel, grafikler, rozet, avatar |
| `src/data/nav.tsx` | Gruplu menü ağacı (14 grup, ~35 sayfa); 12 üst grup komuta kartında |
| `src/data/hr2.ts` | Organizasyon, özlük 360, PDKS, puantaj, bordro alt alanları, yaşam döngüsü, vakalar |
| `docs/ARCHITECTURE.md` | Ürün ve mimari referansı: çekirdekler, domain sınırları, fazlar, öncelik |
| `src/data/hr.ts` | Sahte İK verisi |
| `src/pages/**` | Dashboard, Görevlerim, İnsanlar, Zaman, Bordro, Yaşam Döngüsü, İşe Alım, Performans, Eğitim, HR Vakaları, Raporlar, Portallar, Entegrasyonlar, Ayarlar, Mimari |

Mimari omurga: **Vardiya planlar → PDKS ölçer → İzin açıklar → Puantaj hesaplar → Bordro paraya çevirir.**
Ayrıntı: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Temalar ve erişilebilirlik

- Üç görünüm: **Açık** ve **Koyu** (WCAG 2.2 AA), **Erişilebilirlik** (WCAG 2.2 AAA: 7:1
  kontrast, 16px taban yazı, 44px hedefler, hareket yok, altı çizili bağlantılar, 3px odak
  halkası). Değiştirici üst çubukta ve kenar çubuğunda; seçim `localStorage`'da,
  varsayılan sistem tercihi (`prefers-contrast`, `prefers-color-scheme`).
- Tokenlar `src/styles/global.css` (light) ve `src/styles/themes.css` (dark, a11y). Hiçbir
  temada gradient yok. Kontrast her token çifti için ölçülür; axe-core taraması üç temada
  sıfır ihlal.
- Skip link, landmark'lar, `scope="col"` başlıklar, odaklanabilir kaydırma alanları,
  `aria-live` AI yanıtları, Escape ile kapanma ve odak geri dönüşü.

Kurallar: emoji yok (Phosphor), radius en fazla 8px (kapsül/daire istisnası),
AI önerisi asla onaysız uygulanmaz.

Deploy: `main`'e push → GitHub Actions build → GitHub Pages.
