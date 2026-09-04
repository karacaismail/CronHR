/**
 * Proaktif AI içgörü akışı — verinin kendisinden üretilmiş uyarı/öneri kartları.
 * Her içgörü Dashboard'da ve ilgili sayfalarda görünür; kullanıcı Uygula,
 * Ertele veya Kapat seçebilir (durum tarayıcıda tutulur, bkz. AiInsightFeed).
 */
import { GEN } from "../data/generate";

export type Severity = "critical" | "warning" | "info" | "good";

export interface Insight {
  id: string;
  severity: Severity;
  title: string;
  body: string;
  pageIds: string[];
  actionLabel: string;
  actionHref: string;
  applyResult: string;
}

function compute(): Insight[] {
  const highRisk = GEN.employees.filter((e) => e.attritionRisk >= 75 && e.status !== "Ayrılıyor");
  const nearOt = GEN.timesheet.filter((t) => t.overtime >= 55);
  const badAuto = GEN.automations.filter((a) => a.status === "Hatalı");
  const docsExpired = GEN.docs.filter((d) => d.status === "Süresi doldu");
  const readyLeaves = GEN.leaves.filter((l) => l.status === "Bekliyor" && l.aiVerdict === "Onayla");
  const openHighCases = GEN.cases.filter((c) => c.priority === "Yüksek" && (c.state === "Açık" || c.state === "İnceleme"));
  const openPositionsLong = GEN.positions.filter((p) => p.status === "Boş");
  const probationNoReview = GEN.employees.filter((e) => e.status === "Deneme");
  const posFor = (id: string) => GEN.employees.find((e) => e.id === id)?.name ?? id;

  const out: Insight[] = [];
  if (highRisk.length) out.push({ id: "risk", severity: "critical", title: `${highRisk.length} çalışanda ayrılma riski çok yüksek`, body: `${highRisk.slice(0, 3).map((e) => e.name).join(", ")}${highRisk.length > 3 ? " ve diğerleri" : ""} için risk skoru 75'in üstünde. Ortak sinyal: ünvan durağanlığı ve fazla mesai.`, pageIds: ["panel", "calisanlar"], actionLabel: "Görüşmeleri planla", actionHref: "/calisanlar/", applyResult: `${highRisk.length} çalışan için yönetici görüşmesi göreve eklendi.` });
  if (badAuto.length) out.push({ id: "auto", severity: "critical", title: `${badAuto.length} entegrasyon hatalı`, body: `${badAuto.map((a) => a.name).join(", ")}. Bekleyen kayıtlar senkronize olamıyor.`, pageIds: ["panel", "entegrasyonlar", "otomasyonlar"], actionLabel: "Yeniden bağla", actionHref: "/entegrasyonlar/", applyResult: `${badAuto.length} entegrasyon yeniden bağlandı.` });
  if (nearOt.length) out.push({ id: "ot", severity: "warning", title: `${nearOt.length} çalışan fazla mesai sınırına yakın`, body: `En yüksek: ${nearOt.slice(0, 2).map((t) => `${posFor(t.employeeId)} (${t.overtime} sa)`).join(", ")}. Politika sınırı 72 saat.`, pageIds: ["panel", "puantaj", "fazla-mesai"], actionLabel: "Vardiya devri öner", actionHref: "/vardiya/", applyResult: "Sınıra yakın çalışanlar için vardiya devri taslaklandı." });
  if (docsExpired.length) out.push({ id: "docs", severity: "warning", title: `${docsExpired.length} belgenin süresi doldu`, body: `${docsExpired.slice(0, 2).map((d) => d.title).join(", ")}. Sertifikalar İSG zorunluluğu içerebilir.`, pageIds: ["panel", "belgeler"], actionLabel: "Yenileme başlat", actionHref: "/belgeler/", applyResult: `${docsExpired.length} belge için yenileme süreci başlatıldı.` });
  if (readyLeaves.length) out.push({ id: "leaves", severity: "info", title: `${readyLeaves.length} izin talebi onaya hazır`, body: "Politika içinde ve ekip takviminde çakışma yok; tek tıkla onaylanabilir.", pageIds: ["panel", "izinler", "gorevler"], actionLabel: "Toplu onayla", actionHref: "/izin-devam/", applyResult: `${readyLeaves.length} izin talebi onaylandı.` });
  if (openHighCases.length) out.push({ id: "cases", severity: "warning", title: `${openHighCases.length} yüksek öncelikli HR vakası açık`, body: openHighCases.slice(0, 2).map((c) => c.title).join(", "), pageIds: ["panel", "vakalar"], actionLabel: "Vakaları aç", actionHref: "/hr-vakalari/", applyResult: "Yüksek öncelikli vakalar için görüşme takvimi oluşturuldu." });
  if (openPositionsLong.length) out.push({ id: "pos", severity: "info", title: `${openPositionsLong.length} pozisyon boş`, body: "Bazı ilanlar 30 günü aşıyor; başlık ve ücret aralığı güncellemesi başvuru kalitesini artırabilir.", pageIds: ["panel", "ise-alim", "pozisyonlar"], actionLabel: "İlanları gözden geçir", actionHref: "/pozisyonlar/", applyResult: "Açık pozisyonlar için ilan yenileme önerisi oluşturuldu." });
  if (probationNoReview.length) out.push({ id: "probation", severity: "info", title: `${probationNoReview.length} çalışan deneme süresinde`, body: "İlk değerlendirme formları zamanında doldurulmalı.", pageIds: ["panel", "calisanlar", "onboarding"], actionLabel: "Yöneticilere hatırlat", actionHref: "/calisanlar/", applyResult: "Deneme süresi değerlendirme hatırlatması gönderildi." });
  out.push({ id: "good", severity: "good", title: "Devamsızlık yıl ortalamasının altında", body: "Son 3 ayda istikrarlı düşüş; Destek ekibinin yeni vardiya düzeni etkili oldu.", pageIds: ["panel", "izinler"], actionLabel: "Raporu gör", actionHref: "/raporlar/", applyResult: "Rapor panosuna eklendi." });
  return out;
}

export const INSIGHTS: Insight[] = compute();

const SEVERITY_ORDER: Record<Severity, number> = { critical: 0, warning: 1, info: 2, good: 3 };

export function rankInsights(pageId: string): Insight[] {
  const scoped = INSIGHTS.filter((i) => i.pageIds.includes(pageId));
  const pool = scoped.length ? scoped : INSIGHTS;
  return [...pool].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
