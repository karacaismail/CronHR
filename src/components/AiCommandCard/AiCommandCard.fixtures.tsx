import {
  CalendarBlank,
  ChartBar,
  ChartLineUp,
  Checks,
  Diamond,
  FileText,
  Funnel,
  Gear,
  Lifebuoy,
  PlusCircle,
  Tray,
  Users,
  Wrench,
} from "@phosphor-icons/react";
import type { ReactNode } from "react";
import {
  ClosedDealsReport,
  PageExplanationReport,
  PipelineDistributionReport,
  RevenueTrendReport,
  RiskyCustomersReport,
  TeamPerformanceReport,
} from "./AiCommandCard.reports";
import type {
  AiCommandBreadcrumbItem,
  AiCommandMenuItem,
  AiCommandProfileSummary,
  AiCommandQueryRequest,
  AiQuerySuggestion,
} from "./AiCommandCard.types";

/** Shared demo data for stories and tests. Exactly 12 menu items by contract.
 * Icons are Phosphor components — emoji are banned in this design system. */
export const demoLogo = <Diamond size={18} weight="fill" />;

export const demoBreadcrumbs: readonly AiCommandBreadcrumbItem[] = [
  { id: "home", label: "Ana Sayfa" },
  { id: "crm", label: "Müşteri Yönetimi" },
  { id: "deals", label: "Satış Fırsatları" },
  { id: "q3", label: "3. Çeyrek Kurumsal Satış Fırsatları Raporu" },
];

export const demoMenuItems: readonly AiCommandMenuItem[] = [
  { id: "new-record", label: "Yeni Kayıt", description: "Hızlı kayıt oluştur", icon: <PlusCircle size={18} /> },
  { id: "reports", label: "Raporlar", description: "Satış raporlarını görüntüle", icon: <ChartBar size={18} /> },
  { id: "tasks", label: "Görevler", description: "Bekleyen görevleri aç", icon: <Checks size={18} /> },
  { id: "calendar", label: "Takvim", description: "Toplantıları planla", icon: <CalendarBlank size={18} /> },
  { id: "contacts", label: "Kişiler", description: "Müşteri kişilerini yönet", icon: <Users size={18} /> },
  { id: "pipeline", label: "Satış Hattı", description: "Fırsat aşamalarını izle", icon: <Funnel size={18} /> },
  { id: "documents", label: "Belgeler", description: "Sözleşme ve teklifler", icon: <FileText size={18} /> },
  { id: "automation", label: "Otomasyon", description: "İş akışlarını düzenle", icon: <Gear size={18} /> },
  { id: "inbox", label: "Gelen Kutusu", description: "Müşteri mesajları", icon: <Tray size={18} />, badge: "Yeni" },
  { id: "analytics", label: "Analitik", description: "Dönüşüm metrikleri", icon: <ChartLineUp size={18} /> },
  { id: "settings", label: "Ayarlar", description: "Çalışma alanı ayarları", icon: <Wrench size={18} /> },
  { id: "help", label: "Yardım", description: "Destek merkezini aç", icon: <Lifebuoy size={18} />, disabled: true },
];

export const demoQuerySuggestions: readonly AiQuerySuggestion[] = [
  { id: "s1", label: "Bu çeyrekte kapanan fırsatları özetle" },
  { id: "s2", label: "Riskli müşterileri listele" },
  { id: "s3", label: "Bu sayfadaki raporu açıkla" },
  { id: "s4", label: "Aylık gelir trendini çiz" },
  { id: "s5", label: "Satış hattı dağılımını göster" },
  { id: "s6", label: "Ekip performansını karşılaştır" },
];

export const demoProfile: AiCommandProfileSummary = {
  name: "İsmail Karaca",
  initials: "İK",
};

const cannedReports: readonly { match: RegExp; render: () => ReactNode }[] = [
  { match: /kapanan fırsat/i, render: () => <ClosedDealsReport /> },
  { match: /riskli müşteri/i, render: () => <RiskyCustomersReport /> },
  { match: /gelir trend/i, render: () => <RevenueTrendReport /> },
  { match: /satış hattı|dağılım/i, render: () => <PipelineDistributionReport /> },
  { match: /ekip performans/i, render: () => <TeamPerformanceReport /> },
  { match: /rapor/i, render: () => <PageExplanationReport /> },
];

/**
 * Fake backend + AI integration for stories/demos: waits like a real network
 * round-trip, then returns either a rich canned report (charts, tables, KPI
 * tiles) or a streamed text answer for the card's response area.
 */
export async function simulateAiQuery(
  request: AiCommandQueryRequest,
): Promise<string | ReactNode> {
  await new Promise((resolve) => setTimeout(resolve, 1400));
  const canned = cannedReports.find((entry) => entry.match.test(request.query));
  if (canned) return canned.render();
  return (
    `"${request.currentPageLabel ?? "bu sayfa"}" bağlamında "${request.query}" ` +
    "sorgunuzu inceledim. Sayfadaki verilere göre önce satış hattındaki bekleyen " +
    "fırsatları gözden geçirmenizi, ardından raporun aşama dağılımı bölümüne " +
    "bakmanızı öneririm."
  );
}
