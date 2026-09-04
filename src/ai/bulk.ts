/**
 * Toplu AI değerlendirme — DataTable'da seçilen satırlar için tek seferde
 * karar ve özet üretir (ör. çoklu izin talebini birlikte değerlendirme).
 * Karar asla otomatik uygulanmaz; yalnızca öneri döner.
 */
export interface BulkVerdict {
  id: string;
  verdict: "Onayla" | "Dikkat" | "Reddet";
  reason: string;
}

export interface BulkResult {
  verdicts: BulkVerdict[];
  summary: string;
}

type Row = Record<string, unknown>;

const HANDLERS: Record<string, (rows: Row[]) => BulkResult> = {
  leaves: (rows) => {
    const verdicts = rows.map((r) => ({ id: String(r.id), verdict: (r.aiVerdict as BulkVerdict["verdict"]) ?? "Dikkat", reason: String(r.aiReason ?? "Politika kontrolü yapıldı") }));
    const approve = verdicts.filter((v) => v.verdict === "Onayla").length;
    return { verdicts, summary: `${rows.length} talepten ${approve} tanesi onaya hazır; kalan ${rows.length - approve} tanesi dikkat veya red gerektiriyor.` };
  },
  employees: (rows) => {
    const verdicts = rows.map((r) => ({ id: String(r.id), verdict: (Number(r.attritionRisk) >= 55 ? "Dikkat" : "Onayla") as BulkVerdict["verdict"], reason: Number(r.attritionRisk) >= 55 ? "Ayrılma riski yüksek; görüşme önerilir" : "Stabil" }));
    return { verdicts, summary: `${rows.length} çalışandan ${verdicts.filter((v) => v.verdict === "Dikkat").length} tanesi için görüşme önerilir.` };
  },
  default: (rows) => {
    const verdicts = rows.map((r) => ({ id: String(r.id ?? Math.random()), verdict: "Dikkat" as const, reason: "Manuel inceleme önerilir" }));
    return { verdicts, summary: `${rows.length} kayıt incelendi.` };
  },
};

export function bulkVerdicts(kind: string, rows: Row[]): BulkResult {
  const handler = HANDLERS[kind] ?? HANDLERS.default;
  return handler(rows);
}
