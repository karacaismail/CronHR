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

## Modal perdesi (tek kaynak)

- Herhangi bir modal aktifken arkada kalan içerik `blur(2px)` + soğuk gri (slate)
  `%30` opaklıkla kaplanır: tek kaynak `.overlay-scrim` (`src/styles/global.css`), Flat 2.0'ın
  gradient/blur yasağının kasıtlı tek istisnası (`tests/tokens.test.ts` bu istisnayı tanır).
  Kullanan modallar: mobil çekmece menüsü, CronHR Copilot sohbeti, `DataTable` filtre modalı.
  Her modal Escape ile kapanır, arka plana tıklamak kapatır, odak tetikleyiciye döner.
  Komuta kartının kendi genişleme perdesi (`AiCommandCard`) kasıtlı olarak hariç: o bir modal
  değil, kartın "tek yüzey" sözleşmesinin parçası (bkz. `tests/overlay.test.ts`).
- **DataTable filtreleri artık modal**: "Filtreler" düğmesi `role="dialog"` bir pencere açar;
  filtreleme yine canlıdır (kapatma uygulanan filtreleri geri almaz), "Filtreleri temizle"
  yalnızca filtreleri sıfırlar, arama/sıralama korunur.

## AI etkileşim örnekleri (yeni)

- **CronHR Copilot** (`src/islands/Copilot.tsx`, motor `src/ai/copilot.ts`): sayfa genelinde
  sohbet çekmecesi. Çok turlu ("onlara ne önerirsin?" önceki konuya bağlanır), aksiyon üretir
  (git / uygula — geri alınabilir), güven yüzdesi ve kaynak gösterir, kapsam dışı sorularda
  dürüstçe "yardımcı olamam" der, beğen/beğenme geri bildirimi alır. Üst çubukta masaüstü
  düğmesi, alt gezinmede mobil "AI" düğmesi.
- **Proaktif AI içgörü akışı** (`src/ai/insights.ts`, `AiInsightFeed.tsx`): veriden hesaplanan
  kartlar (kritik/uyarı/bilgi/iyi), her biri Uygula / Ertele / Kapat alır; durum kalıcıdır.
  Dashboard'da görünür.
- **Serbest metinden çalışan kaydı** (`src/ai/quickCreate.ts`, `QuickCreate.tsx`): ad, tarih,
  departman, ünvan, konum, yönetici çıkarımı; alan bazında güven yüzdesi, düşük güvenli alanlar
  sarı ile işaretlenip elle düzeltilebilir. Çalışanlar sayfasında.
- **Bordro "ne olur?" simülatörü** (`src/ai/whatIf.ts`, `WhatIf.tsx`): fazla mesai sınırı, zam,
  kadro kaydırıcılarıyla anlık tahmin ve açıklama; hiçbir şey kaydetmez.
- **Grafik sapma tespiti** (`src/ai/anomaly.ts`): z-skoru ile uç noktalar işaretlenir
  (`AreaChart` `markAnomalies`).
- **Yazı asistanı** (`src/ai/composer.ts`): kısalt / resmileştir / çevir / taslak yaz.
- **Toplu AI değerlendirme** (`src/ai/bulk.ts`): `DataTable`'da satır seçip "AI ile değerlendir";
  Çalışanlar ve İzinler tablolarında `selectable` açık.

## Tablolar, veri ve AI simülasyonları

- **DataTable** (`src/islands/DataTable.tsx`): arama, sütun filtreleri (çoklu seçim, sayısal aralık),
  sıralama (aria-sort), sayfalama, dışa aktarma, **doğal dille AI filtre** ("mühendislik riski 60
  üstü riske göre sırala"), tablo durumundan **AI özeti**, satır başına AI önerisi. 320px'te kart
  listesi, 48em'den itibaren tablo. Presetler `src/islands/tablePresets.tsx` (12 tablo).
- **Veri**: `src/data/generate.ts` deterministik üreteç — 120 çalışan, 48 aday, 40 izin, 120 puantaj,
  36 istisna, 30 mesai, 28 pozisyon, 40 belge, 24 vaka, 30 değişken ödeme, 20 kesinti, 19 otomasyon.
- **AI**: komuta kartında 17 hazır rapor (istisnalar, mesai sınırı, puantaj hazırlığı, boş pozisyon,
  belge süreleri, vakalar, otomasyonlar, mülakat kuyruğu …), tablo içi AI filtre/özet, satır AI.

## Mobile-first

- CSS taban 320px; yalnız `min-width` kırılımları (40/48/64/80em), `clamp()` ile akışkan tip ve boşluk.
- Mobil UX: çekmece menü (Escape, arka plan, odak), alt gezinme çubuğu (Panel, Görevler, AI, İnsanlar,
  Menü), 44px hedefler, iOS yakınlaştırma önleyen 16px girişler, kart tabloları.

## Bileşen standardı, hareket ve ölçek

- **Dropdown:** yerel `<select>` kullanılmaz; `src/islands/Select.tsx` (APG select-only combobox)
  her tarayıcı ve cihazda aynı görünür; klavye, typeahead, viewport'a göre yukarı/aşağı açılır.
  Form kontrolleri (`appearance: none`), onay/radyo kutuları ve kaydırma çubukları standarttır.
- **Hareket:** `src/scripts/motion.ts` (GSAP + ScrollTrigger): akış sırasıyla giriş, KPI sayaç,
  grafik çizimi, kaydırmayla ortaya çıkma, 0,08 parallax; CSS mikro-etkileşimler (hover/press,
  sekme çizgisi, anahtar yayı). `prefers-reduced-motion`, erişilebilirlik modu ve
  `localStorage cronhr-motion=off` hareketi tamamen kapatır; güvenlik payı içeriği asla gizli bırakmaz.
- **Ölçek:** 320px (iPhone 4) tabanlı; 1600/1920/2560/3840/5120 kırılımlarında içerik genişliği ve
  arayüz oranı (zoom) adaptif büyür.
- **Testler:** `npm test` (vitest: token kontrastı, Flat 2.0/emoji/select sözleşmesi, Select
  bileşeni klavye davranışı, hareket çekirdeği), `npm run verify` (derleme + dist sözleşmesi).

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
