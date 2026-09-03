# AiCommandCard

Yerinde genişleyen (morphing expandable) AI komuta yüzeyi. Kapalı durumda ~52px
yüksekliğinde bir arama çubuğunu andırır; açıldığında **aynı DOM node'u** yanlara
ve aşağıya doğru büyüyerek AI sorgu alanını, sorgu önerilerini, 12 komut kartını,
tam breadcrumb'ı, bildirim ve profil kontrollerini ortaya çıkarır.

## Tek yüzey invariant'ı (en kritik kural)

> Collapsed ve expanded görünümler, aynı `AiCommandCardShell` DOM node'unun
> CSS state'leridir. Modal, dialog, drawer, sheet, popover, portal, backdrop
> veya ikinci bir expanded component **asla** kullanılmaz. Shell state
> değişiminde key almaz, klonlanmaz, değiştirilmez.

Bu invariant `AiCommandCard.test.tsx` içinde `toBe` kimlik karşılaştırması ve
"tek shell" sorgusu ile, Storybook `ExpandInteraction` play fonksiyonunda da
aynı kontrollerle doğrulanır.

## Anatomi

```
AiCommandCardHost                (data-slot="ai-command-card-host")
└─ AiCommandCardShell            (data-slot="ai-command-card-shell", data-state=...)
   ├─ AiCommandCardHeader        (logo · breadcrumb · AI trigger · bildirim · profil)
   │  ├─ AiCommandCardBreadcrumb (collapsed: yalnız current page; expanded: tam yol)
   │  ├─ AiCommandTrigger        (aria-expanded / aria-controls; breathing + particles)
   │  ├─ AiNotificationAction
   │  └─ AiProfileAction         (yalnız expanded'da görünür/odaklanabilir)
   └─ expanded region            (data-slot="ai-command-card-expanded-region")
      ├─ AiSearchComposer        (AI input + orb yuvası; Enter submit)
      ├─ AiCommandCardStatus     (aria-live sorgu durumu)
      ├─ AiResponseArea          (metin: daktilo; zengin rapor: grafik/tablo)
      ├─ AiQuerySuggestionList   (6 pill; beckon dalgası; tıklayınca otomatik submit)
      └─ AiCommandMenuGrid       (12 item; 2/3/4 kolon container query)
```

**Orb göçü:** AI trigger (Atom ikonlu liquid-glass orb, 5 sn kalp atışı döngüsü)
tek kalıcı button'dır. Kart açılınca ölçülen bir FLIP vektörüyle (`--orb-travel-*`)
composer'daki submit yuvasına süzülür: input doluyken tıklaması sorguyu gönderir
(`submitLabel` erişilebilir adı olur), boşken kartı kapatır; Escape her zaman kapatır.

Expanded içerik her zaman shell içinde **mounted** kalır; collapsed durumda
`aria-hidden` + `inert` + CSS ile gizlenir (portal/sibling panel yok).

## State machine

`AiCommandCard.machine.ts` — saf geçiş fonksiyonu:

```
collapsed -> expanding -> expanded -> collapsing -> collapsed
```

Kesintiler mevcut görsel konumdan tersine döner (`expanding` sırasında kapatma
isteği doğrudan `collapsing`e geçer); CSS transition'ları retarget ettiği için
görsel sıçrama olmaz. Query yaşam döngüsü ayrıdır:
`idle | typing | submitting | success | error` (`data-query-state`).

## Responsive geometri

Tokenlar `AiCommandCard.module.css` `.host` üzerinde tanımlıdır:

| Token | Değer |
|---|---|
| collapsed yükseklik | 52px |
| collapsed maks. genişlik | 700px |
| expanded maks. genişlik | 1050px (~%50 yatay büyüme) |
| expanded yükseklik | `min(520px, 100dvh - gutters)` |
| mobil gutter | 8px |

Shell normal document flow'da kalır; gerçek `inline-size`/`block-size`
transition edilir (transform: scale **yok**), üst-merkez referansıyla iki yana
ve aşağıya büyür. 320×480'de yatay taşma yoktur; gereğinde yalnızca expanded
içerik gövdesi dikey scroll alır (body scroll lock yok).

## Radius sistemi

- Kural: `border-radius` en fazla **8px** (0.5rem) — shell, menü kartları,
  yanıt alanı, logo, rapor kartları, modallar, tüm diğer yüzeyler.
- **İstisnalar (tam yuvarlak kalır):** AI sorgu alanı (`AiSearchComposer`
  kapsülü), öneri pill'leri (`AiQuerySuggestionList`) ve AI orb + yuvarlak
  aksiyon butonları/noktalar (`100%`).
- Teknik not: daire (kare kutu) için `100%`, kapsül (dikdörtgen kutu) için
  `999px` kullanılır — kare olmayan kutuda `100%` elips bozulması yaratır.

## Motion koreografisi

Expand 560ms / collapse 380ms, `cubic-bezier(0.22, 1, 0.36, 1)`. Reveal
sırası: shell geometry → header detayları → breadcrumb → profil → composer →
öneriler → 35ms stagger ile menü kartları. Yalnızca AI trigger sürekli ambient
animasyon taşır (4s breathing 1.00→1.07; expanded'da 1.00→1.035; typing/
submitting sırasında durur). Partiküller deterministik, `aria-hidden`,
yalnız transform+opacity. `prefers-reduced-motion` (veya
`motionPreference="reduced"`) tüm sürekli animasyonu ve stagger'ı kaldırır.

## Erişilebilirlik

- Shell `section` + `aria-label` (root button değildir).
- `AiCommandTrigger` gerçek button; `aria-expanded` + `aria-controls`.
- Enter/Space açar, Escape kapatır; kart dışına tıklamak da kapatır
  (`outside-interaction`); kapanınca odak trigger'a döner.
- Açıkken host, kart ile sayfa arasına görsel bir orta katman koyar: 2px blur +
  cool-grey scrim (`.host::before`, `pointer-events: none`) — modal backdrop
  değildir; sayfa kaydırılabilir kalır ve kart document flow'dan çıkmaz.
- Trigger ile açılışta odak, animasyon **tamamlandıktan sonra** input'a gider.
- Collapsed'da gizli içerik `inert` + `aria-hidden`: odak ve SR dışı.
- Bildirim/logo tıklamaları expansion'ı tetiklemez (interactive child isolation).
- Durum mesajları ayrılmış `role="status"` live region'da.

## Public API

`AiCommandCardProps` için `AiCommandCard.types.ts` dosyasına bakın. Controlled
(`expanded` + `onExpandedChange`) ve uncontrolled (`defaultExpanded`) kullanım
desteklenir. Component veri fetch etmez; yalnızca callback üretir.
`onAiQuerySubmit`, sorguyla birlikte current page ve breadcrumb yolunu taşıyan
`AiCommandQueryRequest` alır.

## Storybook haritası

- `AiCommandCard/AiCommandCard`: CollapsedMobile320, ExpandedMobile320,
  CollapsedDesktop, ExpandedDesktop, ExpandInteraction (kimlik + geometri +
  12 item + dialog yokluğu asserts), RapidToggle, ReducedMotion,
  LongLocalizedContent, RTL, DarkTheme, QuerySubmitting, QueryError,
  NoHorizontalOverflowMobile320.
- `AiCommandCard/Parts`: her mikro bileşen için izole story'ler.

## Dosya sorumlulukları — lego kuralı

Her mikro parça **kendi üçlüsüyle** bağımsızdır: `parts/<Ad>.tsx` +
`parts/<Ad>.module.css` + `parts/<Ad>.stories.tsx`. Bir parçayı güncellemek
için yalnızca bu üç dosyaya dokunulur; parçalar birbirinin CSS'ine erişmez.
Parçalar durumu yalnızca kararlı sözleşmeden okur:
`[data-slot="ai-command-card-shell"][data-state=...]` ve host'tan miras alınan
`--ai-cc-*` / `--ai-command-card-*` tokenları. Ortak tek taban
`parts/actionBase.module.css` (yuvarlak aksiyon butonu).

| Dosya | Sorumluluk |
|---|---|
| `AiCommandCard.tsx` | Orkestrasyon: state, focus, callback'ler, orb FLIP |
| `AiCommandCard.machine.ts` | Saf expansion geçiş fonksiyonu |
| `AiCommandCard.motion.ts` | Süre sabitleri + reduced-motion çözümü |
| `AiCommandCard.module.css` | SADECE tokenlar, scrim, shell morph, expanded region |
| `AiCommandCard.types.ts` | Public sözleşmeler |
| `parts/<Ad>.{tsx,module.css,stories.tsx}` | Her lego parçasının tam sahipliği |

Storybook düzeni: `AiCommandCard/Bütün Kart` (montaj) ve
`AiCommandCard/Parçalar/<Ad>` (tek tek lego parçaları).

## Yapılmaması gerekenler

```tsx
// YASAK: state'e göre component değiştirmek
return expanded ? <ExpandedCard /> : <CollapsedCard />;

// YASAK: portal / modal / drawer / ikinci yüzey
createPortal(<ExpandedPanel />, document.body);

// YASAK: sahte büyüme
style={{ transform: "scale(1, 10)" }}

// YASAK: shell'i state'e göre yeniden mount etmek
<section key={expansionState} ... />
```
