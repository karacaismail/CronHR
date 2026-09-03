import type { Icon } from "@phosphor-icons/react";
import {
  Briefcase,
  CalendarCheck,
  ChartBar,
  ClockCountdown,
  Files,
  GraduationCap,
  Gear,
  Money,
  SquaresFour,
  Target,
  Timer,
  Users,
} from "@phosphor-icons/react";

/**
 * CronHR ana menüsü — sözleşme gereği tam 12 madde. Aynı liste hem kenar
 * çubuğunu (statik) hem de AiCommandCard menü ızgarasını (island) besler.
 * Sayfa bağlamlı AI önerileri de burada tutulur.
 */
export interface NavPage {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly href: string;
  readonly icon: Icon;
  readonly badge?: string;
  readonly badgeTone?: "accent" | "warning";
  readonly group: "genel" | "insan" | "operasyon" | "sistem";
  readonly suggestions: readonly string[];
}

export const NAV_PAGES: readonly NavPage[] = [
  {
    id: "panel",
    label: "Panel",
    description: "Günün özeti ve öncelikler",
    href: "/",
    icon: SquaresFour,
    group: "genel",
    suggestions: [
      "Bugün dikkat etmem gereken 3 şey ne?",
      "Ayrılma riski yüksek çalışanları listele",
      "Bu ayın devamsızlık trendini çiz",
      "Bekleyen onayları özetle",
      "İşe alım hattının durumunu göster",
      "Ekip başına doluluk oranını karşılaştır",
    ],
  },
  {
    id: "calisanlar",
    label: "Çalışanlar",
    description: "Kadro, profiller ve risk sinyalleri",
    href: "/calisanlar/",
    icon: Users,
    group: "insan",
    suggestions: [
      "Ayrılma riski yüksek çalışanları listele",
      "Deneme süresi bu ay biten kişiler kim?",
      "Departman bazında kadro dağılımını göster",
      "Ünvanı 6 aydır değişmeyenleri bul",
      "Bu sayfayı açıkla",
      "Uzaktan çalışan oranını karşılaştır",
    ],
  },
  {
    id: "ise-alim",
    label: "İşe Alım",
    description: "İlanlar, adaylar ve AI puanlama",
    href: "/ise-alim/",
    icon: Briefcase,
    badge: "7",
    badgeTone: "accent",
    group: "insan",
    suggestions: [
      "İşe alım hattının durumunu göster",
      "En güçlü 5 adayı sırala",
      "Mülakat bekleyen adayları listele",
      "Backend ilanı için ilan metni taslağı yaz",
      "Aşama bazında dönüşüm oranını çiz",
      "Bu sayfayı açıkla",
    ],
  },
  {
    id: "izin-devam",
    label: "İzin ve Devam",
    description: "Talepler, bakiye ve devamsızlık",
    href: "/izin-devam/",
    icon: CalendarCheck,
    badge: "5",
    badgeTone: "warning",
    group: "operasyon",
    suggestions: [
      "Bekleyen izin taleplerini özetle",
      "Bu ayın devamsızlık trendini çiz",
      "Çakışan izinleri bul",
      "İzin bakiyesi en yüksek 5 kişi kim?",
      "Bu sayfayı açıkla",
      "Geç kalma örüntülerini analiz et",
    ],
  },
  {
    id: "vardiya",
    label: "Vardiya Planı",
    description: "Haftalık plan ve çakışma kontrolü",
    href: "/vardiya/",
    icon: ClockCountdown,
    group: "operasyon",
    suggestions: [
      "Bu haftaki boş vardiyaları doldur",
      "Çakışan vardiyaları bul",
      "Fazla mesai riski olan kişileri listele",
      "Gece vardiyası dağılımını dengele",
      "Bu sayfayı açıkla",
      "Gelecek haftanın planını taslak olarak oluştur",
    ],
  },
  {
    id: "bordro",
    label: "Bordro",
    description: "Dönem hesabı ve anomali kontrolü",
    href: "/bordro/",
    icon: Money,
    group: "operasyon",
    suggestions: [
      "Bu dönemin bordro anomalilerini göster",
      "Toplam maliyet trendini çiz",
      "Fazla mesai maliyetini departmana göre kır",
      "Geçen döneme göre farkları açıkla",
      "Bu sayfayı açıkla",
      "Bordroyu onaya hazırla",
    ],
  },
  {
    id: "performans",
    label: "Performans",
    description: "Hedefler, OKR ve değerlendirme",
    href: "/performans/",
    icon: Target,
    group: "insan",
    suggestions: [
      "Ekip başına hedef ilerlemesini karşılaştır",
      "Geride kalan hedefleri listele",
      "Ahmet Yıldız için değerlendirme taslağı yaz",
      "Performans dağılımını çiz",
      "Bu sayfayı açıkla",
      "Terfi adaylarını öner",
    ],
  },
  {
    id: "egitim",
    label: "Eğitim",
    description: "Programlar ve öğrenme yolları",
    href: "/egitim/",
    icon: GraduationCap,
    group: "insan",
    suggestions: [
      "Zorunlu eğitimi tamamlamayanları listele",
      "Satış ekibi için öğrenme yolu öner",
      "Tamamlama oranı trendini çiz",
      "Süresi dolacak sertifikaları göster",
      "Bu sayfayı açıkla",
      "Eğitim bütçesi kullanımını özetle",
    ],
  },
  {
    id: "belgeler",
    label: "Belgeler",
    description: "Sözleşmeler, formlar ve süre takibi",
    href: "/belgeler/",
    icon: Files,
    badge: "3",
    badgeTone: "warning",
    group: "operasyon",
    suggestions: [
      "Süresi dolmak üzere olan belgeleri listele",
      "Eksik belgesi olan çalışanları bul",
      "Bu sözleşmeyi özetle",
      "Belge türlerine göre dağılımı göster",
      "Bu sayfayı açıkla",
      "Gizlilik sözleşmesi taslağı hazırla",
    ],
  },
  {
    id: "raporlar",
    label: "Raporlar",
    description: "Hazır raporlar ve AI ile rapor üretimi",
    href: "/raporlar/",
    icon: ChartBar,
    group: "genel",
    suggestions: [
      "Aylık İK özet raporu oluştur",
      "Ayrılma oranı trendini çiz",
      "Departman bazında maliyet raporu hazırla",
      "İşe alım hunisi raporunu göster",
      "Bu sayfayı açıkla",
      "Yönetim kuruluna sunum özeti yaz",
    ],
  },
  {
    id: "otomasyonlar",
    label: "Otomasyonlar",
    description: "Zamanlanmış görevler ve AI kuralları",
    href: "/otomasyonlar/",
    icon: Timer,
    group: "sistem",
    suggestions: [
      "Her pazartesi 09:00'da devamsızlık raporu gönder",
      "Deneme süresi bitmeden 7 gün önce yöneticiyi uyar",
      "Başarısız olan görevleri listele",
      "Bugün çalışacak otomasyonları göster",
      "Bu sayfayı açıkla",
      "Doğum günü kutlama mesajı otomasyonu kur",
    ],
  },
  {
    id: "ayarlar",
    label: "Ayarlar",
    description: "Şirket, roller ve AI tercihleri",
    href: "/ayarlar/",
    icon: Gear,
    group: "sistem",
    suggestions: [
      "AI asistanının izinlerini açıkla",
      "Hangi veriler AI ile paylaşılıyor?",
      "Onay akışlarını özetle",
      "Bu sayfayı açıkla",
      "Rol bazlı erişimleri listele",
      "Bildirim tercihlerimi öner",
    ],
  },
];

export const NAV_GROUPS: readonly { id: NavPage["group"]; label: string }[] = [
  { id: "genel", label: "Genel" },
  { id: "insan", label: "İnsan" },
  { id: "operasyon", label: "Operasyon" },
  { id: "sistem", label: "Sistem" },
];

export function findPage(id: string): NavPage {
  return NAV_PAGES.find((page) => page.id === id) ?? NAV_PAGES[0];
}
