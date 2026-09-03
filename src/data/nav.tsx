import type { Icon } from "@phosphor-icons/react";
import {
  ArrowsClockwise,
  Briefcase,
  ChartBar,
  Clock,
  Gear,
  GraduationCap,
  IdentificationBadge,
  Money,
  Plugs,
  Scales,
  SquaresFour,
  Target,
  Tray,
  Users,
} from "@phosphor-icons/react";

/**
 * CronHR bilgi mimarisi — "işgücü işletim sistemi" menüsü.
 * Kenar çubuğu gruplu ağacı, AiCommandCard ise 12 üst grubu (sözleşme: tam
 * 12 komut kartı) gösterir. Portallar ve Entegrasyonlar kenar çubuğundan ve
 * Ayarlar üzerinden erişilir.
 */
export interface NavLeaf {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  readonly description: string;
  readonly badge?: string;
  readonly badgeTone?: "accent" | "warning";
  readonly suggestions?: readonly string[];
}

export interface NavGroup {
  readonly id: string;
  readonly label: string;
  readonly icon: Icon;
  readonly description: string;
  /** Tek sayfalık grup: doğrudan bağlantı. */
  readonly href?: string;
  readonly children?: readonly NavLeaf[];
  readonly badge?: string;
  readonly badgeTone?: "accent" | "warning";
  /** Komuta kartındaki 12 karttan biri mi? */
  readonly inCommandCard: boolean;
  readonly suggestions: readonly string[];
}

export const NAV_TREE: readonly NavGroup[] = [
  {
    id: "panel",
    label: "Dashboard",
    icon: SquaresFour,
    description: "Günün özeti ve öncelikler",
    href: "/",
    inCommandCard: true,
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
    id: "gorevler",
    label: "Görevlerim",
    icon: Tray,
    description: "Onaylar, talepler, hatalar",
    href: "/gorevler/",
    badge: "11",
    badgeTone: "warning",
    inCommandCard: true,
    suggestions: [
      "Bekleyen onayları özetle",
      "Bugün süresi dolan görevleri listele",
      "Hazır olan onayları tek seferde onayla",
      "Hatalı entegrasyonları göster",
      "Bu sayfayı açıkla",
      "Görevleri önceliğe göre sırala",
    ],
  },
  {
    id: "insanlar",
    label: "İnsanlar",
    icon: Users,
    description: "Çalışan, organizasyon, özlük",
    inCommandCard: true,
    suggestions: [
      "Ayrılma riski yüksek çalışanları listele",
      "Departman bazında kadro dağılımını göster",
      "Boş pozisyonları listele",
      "Eksik özlük belgesi olanları bul",
      "Bu sayfayı açıkla",
      "Deneme süresi bu ay biten kişiler kim?",
    ],
    children: [
      { id: "calisanlar", label: "Çalışanlar", href: "/calisanlar/", description: "Kadro listesi ve risk sinyalleri" },
      { id: "organizasyon", label: "Organizasyon", href: "/organizasyon/", description: "Şirket, işyeri, departman, ekip" },
      { id: "pozisyonlar", label: "Pozisyonlar", href: "/pozisyonlar/", description: "Pozisyon, kademe, bütçe" },
      { id: "ozluk", label: "Özlük", href: "/ozluk/", description: "Employee 360 dosyaları" },
      { id: "belgeler", label: "Belgeler", href: "/belgeler/", description: "Sözleşme, sertifika, form", badge: "3", badgeTone: "warning" },
    ],
  },
  {
    id: "zaman",
    label: "Zaman",
    icon: Clock,
    description: "İzin, vardiya, PDKS, puantaj",
    inCommandCard: true,
    badge: "5",
    badgeTone: "warning",
    suggestions: [
      "Bekleyen izin taleplerini özetle",
      "Çakışan vardiyaları bul",
      "Eksik giriş/çıkış hareketlerini listele",
      "Bu ayın puantajını bordroya hazırla",
      "Fazla mesai sınırına yaklaşanları göster",
      "Bu sayfayı açıkla",
    ],
    children: [
      { id: "izinler", label: "İzinler", href: "/izin-devam/", description: "Talep, bakiye, yokluk", badge: "5", badgeTone: "warning" },
      { id: "vardiya", label: "Vardiyalar", href: "/vardiya/", description: "Planlanan çalışma zamanı" },
      { id: "pdks", label: "PDKS", href: "/pdks/", description: "Cihazlar ve ham hareketler" },
      { id: "puantaj", label: "Puantaj", href: "/puantaj/", description: "Hesaplanmış çalışma" },
      { id: "fazla-mesai", label: "Fazla Mesai", href: "/fazla-mesai/", description: "Talep, onay, sınır" },
      { id: "takvim", label: "Takvim", href: "/takvim/", description: "Çalışma ve tatil takvimleri" },
    ],
  },
  {
    id: "bordro",
    label: "Bordro",
    icon: Money,
    description: "Hesaplama motoru ve yasal çıktılar",
    inCommandCard: true,
    suggestions: [
      "Bu dönemin bordro anomalilerini göster",
      "Bordro öncesi doğrulamayı çalıştır",
      "Toplam maliyet trendini çiz",
      "SGK parametrelerinin sürüm geçmişini göster",
      "Bu sayfayı açıkla",
      "Bordroyu onaya hazırla",
    ],
    children: [
      { id: "bordrolar", label: "Bordrolar", href: "/bordro/", description: "Dönem çalıştırmaları" },
      { id: "ucretler", label: "Ücretler", href: "/ucretler/", description: "Ücret yapısı ve tarihli geçmiş" },
      { id: "degisken-odemeler", label: "Değişken Ödemeler", href: "/degisken-odemeler/", description: "Prim, bonus, komisyon" },
      { id: "kesintiler", label: "Kesintiler", href: "/kesintiler/", description: "Avans, icra, borç" },
      { id: "sgk", label: "SGK", href: "/sgk/", description: "İşyeri, meslek kodu, oranlar" },
      { id: "beyannameler", label: "Beyannameler", href: "/beyannameler/", description: "E-Bildirge, MUHSGK" },
      { id: "odemeler", label: "Ödemeler", href: "/odemeler/", description: "Banka dosyaları, muhasebe fişi" },
    ],
  },
  {
    id: "yasam",
    label: "Yaşam Döngüsü",
    icon: ArrowsClockwise,
    description: "İşe giriş, transfer, terfi, çıkış",
    inCommandCard: true,
    suggestions: [
      "Bu hafta başlayanların oryantasyonunu özetle",
      "Bekleyen transfer taleplerini listele",
      "Terfi adaylarını öner",
      "Ayrılış sürecindeki eksik adımları göster",
      "Bu sayfayı açıkla",
      "Deneme süresi biten kişiler için kontrol listesi oluştur",
    ],
    children: [
      { id: "onboarding", label: "Onboarding", href: "/onboarding/", description: "İşe giriş kontrol listeleri" },
      { id: "transferler", label: "Transferler", href: "/transferler/", description: "Departman ve konum değişimi" },
      { id: "terfiler", label: "Terfiler", href: "/terfiler/", description: "Ünvan ve kademe değişimi" },
      { id: "offboarding", label: "Offboarding", href: "/offboarding/", description: "Ayrılış ve çıkış mülakatı" },
    ],
  },
  {
    id: "ise-alim",
    label: "İşe Alım",
    icon: Briefcase,
    description: "İlanlar, adaylar ve AI puanlama",
    href: "/ise-alim/",
    badge: "7",
    badgeTone: "accent",
    inCommandCard: true,
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
    id: "performans",
    label: "Performans",
    icon: Target,
    description: "Hedefler, OKR ve değerlendirme",
    href: "/performans/",
    inCommandCard: true,
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
    icon: GraduationCap,
    description: "Programlar, sertifika, yetkinlik",
    href: "/egitim/",
    inCommandCard: true,
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
    id: "vakalar",
    label: "HR Vakaları",
    icon: Scales,
    description: "Disiplin, şikayet, talep, yardım masası",
    href: "/hr-vakalari/",
    badge: "2",
    badgeTone: "warning",
    inCommandCard: true,
    suggestions: [
      "Açık vakaları önceliğe göre sırala",
      "Uyarı yazısı taslağı hazırla",
      "SLA'sı dolmak üzere olan talepleri göster",
      "Vaka türlerine göre dağılımı çiz",
      "Bu sayfayı açıkla",
      "Bu ayki disiplin süreçlerini özetle",
    ],
  },
  {
    id: "raporlar",
    label: "Raporlar",
    icon: ChartBar,
    description: "Hazır raporlar ve AI ile rapor üretimi",
    href: "/raporlar/",
    inCommandCard: true,
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
    id: "portallar",
    label: "Portallar",
    icon: IdentificationBadge,
    description: "Çalışan ve yönetici self-servis",
    inCommandCard: false,
    suggestions: ["İzin bakiyemi göster", "Bu ayki bordromu açıkla", "Ekibimde bugün kim izinli?", "Bu sayfayı açıkla", "Onay bekleyen taleplerimi listele", "Vardiya değişimi talep et"],
    children: [
      { id: "calisan-portali", label: "Çalışan Portalı", href: "/calisan-portali/", description: "ESS: benim bilgilerim ve taleplerim" },
      { id: "yonetici-portali", label: "Yönetici Portalı", href: "/yonetici-portali/", description: "MSS: ekibim ve onaylarım" },
    ],
  },
  {
    id: "sistem",
    label: "Sistem",
    icon: Plugs,
    description: "Entegrasyonlar ve otomasyonlar",
    inCommandCard: false,
    suggestions: ["Hatalı entegrasyonları göster", "Son 24 saatteki webhook hatalarını listele", "Başarısız olan görevleri listele", "Bu sayfayı açıkla", "API anahtarı kullanımını özetle", "Muhasebe aktarımının durumunu göster"],
    children: [
      { id: "entegrasyonlar", label: "Entegrasyonlar", href: "/entegrasyonlar/", description: "Bağlı uygulamalar, SSO/SCIM, API, webhook" },
      { id: "otomasyonlar", label: "Otomasyonlar", href: "/otomasyonlar/", description: "Zamanlanmış görevler ve AI kuralları", suggestions: ["Her pazartesi 09:00'da devamsızlık raporu gönder", "Deneme süresi bitmeden 7 gün önce yöneticiyi uyar", "Başarısız olan görevleri listele", "Bugün çalışacak otomasyonları göster", "Bu sayfayı açıkla", "Doğum günü kutlama mesajı otomasyonu kur"] },
    ],
  },
  {
    id: "ayarlar",
    label: "Ayarlar",
    icon: Gear,
    description: "Şirket, roller, güvenlik, AI, faturalama",
    href: "/ayarlar/",
    inCommandCard: true,
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

export interface ResolvedPage {
  readonly group: NavGroup;
  readonly leaf?: NavLeaf;
  readonly label: string;
  readonly description: string;
  readonly href: string;
  readonly suggestions: readonly string[];
}

/** Sayfa kimliğini (grup ya da yaprak) çözer. */
export function resolvePage(id: string): ResolvedPage {
  for (const group of NAV_TREE) {
    if (group.id === id) {
      return {
        group,
        label: group.label,
        description: group.description,
        href: group.href ?? group.children?.[0]?.href ?? "/",
        suggestions: group.suggestions,
      };
    }
    const leaf = group.children?.find((c) => c.id === id);
    if (leaf) {
      return { group, leaf, label: leaf.label, description: leaf.description, href: leaf.href, suggestions: leaf.suggestions ?? group.suggestions };
    }
  }
  return resolvePage("panel");
}

/** Komuta kartı için tam 12 üst grup. */
export const COMMAND_CARD_ITEMS: readonly NavGroup[] = NAV_TREE.filter((g) => g.inCommandCard);
