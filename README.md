# CronHR — AI-first İK yönetim paneli

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
| `src/data/nav.tsx` | 12 modül + sayfa bazlı AI önerileri |
| `src/data/hr.ts` | Sahte İK verisi |
| `src/pages/**` | 12 modül sayfası + bildirimler |

Kurallar: emoji yok (Phosphor), radius en fazla 8px (kapsül/daire istisnası),
AI önerisi asla onaysız uygulanmaz.

Deploy: `main`'e push → GitHub Actions build → GitHub Pages.
