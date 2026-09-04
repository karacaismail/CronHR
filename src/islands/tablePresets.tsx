import type { ReactNode } from "react";
import { AiHint } from "./AiHint";
import type { ColumnDef, Row } from "./tableTypes";
import { employeeById } from "../data/generate";
import { formatDate, initials, riskLabel, riskTone, tl } from "../data/hr";

/**
 * Tablo presetleri: Astro sayfaları island'a yalnızca `preset` adı ve satırları
 * geçirir (seri hale getirilebilir). Sütunlar, hücre render'ı, satır AI'sı ve
 * AI özeti burada (React tarafında) tanımlıdır. Tüm görsel sınıflar global
 * tasarım sisteminden gelir (badge, person, avatar, meter).
 */

export interface TablePreset {
  columns: ColumnDef[];
  rowKey: string;
  defaultSort?: { key: string; dir: "asc" | "desc" };
  renderCell?: (row: Row, col: ColumnDef) => ReactNode | undefined;
  rowAi?: (row: Row) => ReactNode;
  aiSummary?: (rows: Row[]) => string;
  aiChips?: string[];
  aiPlaceholder?: string;
}

type Tone = "good" | "warning" | "serious" | "critical" | "info" | "neutral" | "ai";

function Badge({ tone, children, plain }: { tone: Tone; children: ReactNode; plain?: boolean }) {
  return <span className={`badge${plain ? " badge-plain" : ""}`} data-tone={tone}>{children}</span>;
}

function Person({ name, sub, hue }: { name: string; sub?: string; hue?: number }) {
  return (
    <span className="person">
      <span className="avatar" data-hue={(hue ?? 0) % 6} aria-hidden="true" style={{ inlineSize: 28, blockSize: 28 }}>{initials(name)}</span>
      <span style={{ minWidth: 0 }}>
        <span className="person-name">{name}</span>
        {sub ? <span className="person-sub" style={{ display: "block" }}>{sub}</span> : null}
      </span>
    </span>
  );
}

function Meter({ value, tone, label }: { value: number; tone?: "good" | "warning" | "critical"; label?: string }) {
  return (
    <span className="row" style={{ gap: 8, minInlineSize: 120 }}>
      <span className="meter" data-tone={tone} style={{ inlineSize: 64 }}><span style={{ inlineSize: `${Math.max(0, Math.min(100, value))}%` }} /></span>
      <span className="small strong">{value}</span>
      {label ? <span className="small muted">{label}</span> : null}
    </span>
  );
}

const employeeCell = (row: Row, subKey?: string) => {
  const e = employeeById(String(row.employeeId));
  return <Person name={e.name} sub={subKey ? String(row[subKey] ?? e.department) : e.department} hue={e.hue} />;
};

const STATUS_TONE: Record<string, Tone> = {
  Aktif: "good", Deneme: "info", "İzinli": "neutral", "Ayrılıyor": "critical",
  Bekliyor: "warning", "Onaylandı": "good", Reddedildi: "critical", "Onay bekliyor": "warning", "Hesaplandı": "neutral", Kilitli: "info",
  Normal: "neutral", "İstisna": "warning", "İnceleme": "info",
  Dolu: "good", "Boş": "warning", "Bütçelenmiş": "info", "Dondurulmuş": "neutral",
  "Geçerli": "good", "Süresi doluyor": "warning", "Süresi doldu": "critical", "İmza bekliyor": "info",
  "Açık": "warning", "Çözüldü": "good", "Kapandı": "neutral", Beklemede: "neutral", Aktif_: "info", "İtiraz": "warning",
  "Duraklatıldı": "neutral", "Hatalı": "critical", "Yüksek": "critical", Orta: "warning", "Düşük": "neutral",
};
const badgeCell = (v: unknown) => <Badge tone={STATUS_TONE[String(v)] ?? "neutral"}>{String(v)}</Badge>;

export const PRESETS: Record<"employees" | "leaves" | "timesheet" | "exceptions" | "overtime" | "positions" | "docs" | "cases" | "variablePayments" | "deductions" | "automations" | "candidates", TablePreset> = {
  employees: {
    rowKey: "id",
    columns: [
      { key: "name", label: "Çalışan", type: "person", subKey: "title", sortable: true, primary: true },
      { key: "department", label: "Departman", type: "enum", options: ["Mühendislik", "Satış", "Destek", "Ürün", "Pazarlama", "Finans", "İnsan Kaynakları"], filter: true, sortable: true },
      { key: "location", label: "Konum", type: "enum", options: ["İstanbul", "Ankara", "İzmir", "Uzaktan"], filter: true, sortable: true },
      { key: "startDate", label: "Başlangıç", type: "date", sortable: true },
      { key: "status", label: "Durum", type: "enum", options: ["Aktif", "Deneme", "İzinli", "Ayrılıyor"], filter: true, sortable: true },
      { key: "attritionRisk", label: "Ayrılma riski", type: "meter", sortable: true, filter: true },
      { key: "engagement", label: "Katılım", type: "number", sortable: true, filter: true, hideOnCards: true },
    ],
    defaultSort: { key: "attritionRisk", dir: "desc" },
    renderCell: (row, col) => {
      if (col.key === "name") return <a href={`${basePath()}/calisanlar/${row.id}/`}><Person name={String(row.name)} sub={String(row.title)} hue={Number(row.hue)} /></a>;
      if (col.key === "startDate") return <span className="muted">{formatDate(String(row.startDate))}</span>;
      if (col.key === "status") return badgeCell(row.status);
      if (col.key === "attritionRisk") { const r = Number(row.attritionRisk); return <Meter value={r} tone={riskTone(r) === "good" ? "good" : riskTone(r) === "warning" ? "warning" : "critical"} label={riskLabel(r)} />; }
      return undefined;
    },
    rowAi: (row) => <AiHint title={`${row.name} · AI değerlendirmesi`} answer={`${row.riskReason}. Katılım ${row.engagement}/100. ${Number(row.attritionRisk) >= 55 ? "Önerilen adım: yöneticisiyle 30 dakikalık kariyer görüşmesi ve ücret bandı kontrolü." : "Şu an aksiyon gerekmiyor; 30 gün sonra yeniden değerlendirilecek."}`} actions={Number(row.attritionRisk) >= 55 ? ["Görüşme planla", "Ücret analizi"] : ["Not ekle"]} mode="popover" />,
    aiSummary: (rows) => {
      const high = rows.filter((r) => Number(r.attritionRisk) >= 55).length;
      const probation = rows.filter((r) => r.status === "Deneme").length;
      const top = [...rows].sort((a, b) => Number(b.attritionRisk) - Number(a.attritionRisk))[0];
      return `${rows.length} çalışan · ${high} yüksek risk · ${probation} deneme süresinde${top ? ` · en yüksek risk: ${top.name} (${top.attritionRisk})` : ""}`;
    },
    aiChips: ["riski yüksek riske göre sırala", "mühendislik uzaktan", "deneme süresinde", "satış katılım düşük"],
    aiPlaceholder: "Örn. 'mühendislik riski 60 üstü riske göre sırala'",
  },
  leaves: {
    rowKey: "id",
    columns: [
      { key: "employeeId", label: "Çalışan", type: "person", primary: true },
      { key: "type", label: "Tür", type: "enum", options: ["Yıllık İzin", "Hastalık", "Mazeret", "Uzaktan Çalışma", "Doğum"], filter: true, sortable: true },
      { key: "from", label: "Başlangıç", type: "date", sortable: true },
      { key: "days", label: "Gün", type: "number", sortable: true, filter: true, align: "end" },
      { key: "status", label: "Durum", type: "enum", options: ["Bekliyor", "Onaylandı", "Reddedildi"], filter: true, sortable: true },
      { key: "aiVerdict", label: "AI görüşü", type: "enum", options: ["Onayla", "Dikkat", "Reddet"], filter: true, sortable: true },
    ],
    defaultSort: { key: "status", dir: "asc" },
    renderCell: (row, col) => {
      if (col.key === "employeeId") return employeeCell(row);
      if (col.key === "from") return <span className="muted">{formatDate(String(row.from))}{Number(row.days) > 1 ? ` – ${formatDate(String(row.to))}` : ""}</span>;
      if (col.key === "status") return badgeCell(row.status);
      if (col.key === "aiVerdict") return <Badge tone={row.aiVerdict === "Onayla" ? "good" : row.aiVerdict === "Dikkat" ? "warning" : "critical"}>{String(row.aiVerdict)}</Badge>;
      return undefined;
    },
    rowAi: (row) => <AiHint title="AI gerekçesi" answer={`${row.aiReason}. ${row.aiVerdict === "Onayla" ? "Politika ve takvim kontrolü geçti." : "Alternatif tarih veya yedek atama önerilir."}`} actions={row.status === "Bekliyor" ? (row.aiVerdict === "Onayla" ? ["Onayla"] : ["Tarih öner", "Yöneticiye sor"]) : []} mode="popover" />,
    aiSummary: (rows) => `${rows.length} talep · ${rows.filter((r) => r.status === "Bekliyor").length} bekliyor · ${rows.filter((r) => r.status === "Bekliyor" && r.aiVerdict === "Onayla").length} tek tıkla onaylanabilir · ${rows.filter((r) => r.aiVerdict === "Dikkat").length} dikkat`,
    aiChips: ["bekliyor onayla", "dikkat", "yıllık izin gün 5 üstü", "hastalık"],
  },
  timesheet: {
    rowKey: "employeeId",
    columns: [
      { key: "employeeId", label: "Çalışan", type: "person", primary: true },
      { key: "workedDays", label: "Çalışılan gün", type: "number", sortable: true, align: "end" },
      { key: "normalHours", label: "Normal saat", type: "number", sortable: true, align: "end" },
      { key: "overtime", label: "Fazla mesai", type: "number", sortable: true, filter: true, align: "end" },
      { key: "night", label: "Gece", type: "number", sortable: true, align: "end", hideOnCards: true },
      { key: "absent", label: "Devamsız", type: "number", sortable: true, align: "end" },
      { key: "late", label: "Geç", type: "number", sortable: true, align: "end", hideOnCards: true },
      { key: "state", label: "Durum", type: "enum", options: ["Hesaplandı", "Onay bekliyor", "Onaylandı", "Kilitli"], filter: true, sortable: true },
    ],
    defaultSort: { key: "overtime", dir: "desc" },
    renderCell: (row, col) => {
      if (col.key === "employeeId") return employeeCell(row);
      if (col.key === "state") return badgeCell(row.state);
      if (col.key === "overtime") { const v = Number(row.overtime); return <span style={{ fontWeight: v ? 700 : 400, color: v > 40 ? "var(--critical-ink)" : undefined }}>{v}</span>; }
      if (col.key === "absent") { const v = Number(row.absent); return <span style={{ fontWeight: v ? 700 : 400, color: v ? "var(--critical-ink)" : undefined }}>{v}</span>; }
      return undefined;
    },
    rowAi: (row) => { const issues = (row.issues as string[]) ?? []; return <AiHint title="Puantaj kontrolü" answer={issues.length ? `${issues.join(". ")}. ${row.state === "Onay bekliyor" ? "Onaylamadan önce düzeltme önerilir." : ""}` : "Plan, PDKS ve izin kayıtları tutarlı; sapma yok."} actions={issues.length ? ["Düzelt", "Yine de onayla"] : row.state === "Onaylandı" ? ["Kilitle"] : ["Onayla"]} mode="popover" />; },
    aiSummary: (rows) => `${rows.length} satır · ${rows.filter((r) => r.state === "Onay bekliyor").length} onay bekliyor · ${rows.filter((r) => Number(r.overtime) > 40).length} mesai sınırına yakın · toplam ${rows.reduce((s, r) => s + Number(r.overtime), 0)} sa fazla mesai`,
    aiChips: ["onay bekliyor", "fazla mesai 40 üstü", "devamsız 1 üstü", "kilitli"],
  },
  exceptions: {
    rowKey: "id",
    columns: [
      { key: "employeeId", label: "Çalışan", type: "person", primary: true },
      { key: "date", label: "Tarih", type: "text", sortable: true },
      { key: "kind", label: "Tür", type: "enum", options: ["Eksik OUT", "Eksik IN", "Geç kalma", "Erken çıkış", "Çift IN", "Vardiyasız hareket", "Cihaz hatası"], filter: true, sortable: true },
      { key: "detail", label: "Detay", type: "text", hideOnCards: false },
      { key: "state", label: "Durum", type: "enum", options: ["Normal", "İstisna", "İnceleme", "Onaylandı", "Reddedildi"], filter: true, sortable: true },
    ],
    defaultSort: { key: "state", dir: "asc" },
    renderCell: (row, col) => {
      if (col.key === "employeeId") return employeeCell(row);
      if (col.key === "state") return badgeCell(row.state);
      if (col.key === "detail") return <span className="muted" style={{ whiteSpace: "normal", minInlineSize: 200, display: "inline-block" }}>{String(row.detail)}</span>;
      return undefined;
    },
    rowAi: (row) => <AiHint title={`${row.kind} · AI önerisi`} answer={`${row.aiSuggestion}.`} actions={row.state === "İstisna" || row.state === "İnceleme" ? ["Öneriyi uygula", "Yöneticiye sor", "Reddet"] : []} mode="popover" />,
    aiSummary: (rows) => `${rows.length} kayıt · ${rows.filter((r) => r.state === "İstisna").length} açık istisna · ${rows.filter((r) => r.state === "İnceleme").length} incelemede · en sık: ${topValue(rows, "kind")}`,
    aiChips: ["istisna", "geç kalma", "eksik out inceleme", "cihaz hatası"],
  },
  overtime: {
    rowKey: "id",
    columns: [
      { key: "employeeId", label: "Çalışan", type: "person", primary: true },
      { key: "date", label: "Tarih", type: "text", sortable: true },
      { key: "hours", label: "Saat", type: "number", sortable: true, filter: true, align: "end" },
      { key: "kind", label: "Neden", type: "text", sortable: true },
      { key: "monthTotal", label: "Aylık toplam", type: "meter", sortable: true, filter: true },
      { key: "state", label: "Durum", type: "enum", options: ["Onay bekliyor", "Onaylandı", "Reddedildi"], filter: true, sortable: true },
    ],
    defaultSort: { key: "monthTotal", dir: "desc" },
    renderCell: (row, col) => {
      if (col.key === "employeeId") return employeeCell(row);
      if (col.key === "state") return badgeCell(row.state);
      if (col.key === "monthTotal") { const pct = Math.round((Number(row.monthTotal) / Number(row.limit)) * 100); return <Meter value={pct} tone={pct >= 90 ? "critical" : pct >= 70 ? "warning" : "good"} label={`${row.monthTotal}/${row.limit}`} />; }
      return undefined;
    },
    rowAi: (row) => <AiHint title="AI görüşü" answer={`${row.aiNote}.`} actions={row.state === "Onay bekliyor" ? ["Onayla", "Devret"] : []} mode="popover" />,
    aiSummary: (rows) => `${rows.length} talep · ${rows.filter((r) => r.state === "Onay bekliyor").length} bekliyor · ${rows.filter((r) => Number(r.monthTotal) + Number(r.hours) > 65).length} sınıra yakın · toplam ${rows.reduce((s, r) => s + Number(r.hours), 0)} sa`,
    aiChips: ["onay bekliyor", "toplam 60 üstü", "gece nöbeti", "saat 6 üstü"],
  },
  positions: {
    rowKey: "id",
    columns: [
      { key: "title", label: "Pozisyon", type: "text", sortable: true, primary: true },
      { key: "department", label: "Departman", type: "enum", options: ["Mühendislik", "Satış", "Destek", "Ürün", "Pazarlama", "Finans", "İnsan Kaynakları"], filter: true, sortable: true },
      { key: "grade", label: "Kademe", type: "enum", options: ["G3", "G4", "G5", "G6", "G7"], filter: true, sortable: true },
      { key: "holder", label: "Sahibi", type: "text" },
      { key: "budget", label: "Bütçe", type: "money", sortable: true, filter: true, align: "end" },
      { key: "status", label: "Durum", type: "enum", options: ["Dolu", "Boş", "Bütçelenmiş", "Dondurulmuş"], filter: true, sortable: true },
    ],
    defaultSort: { key: "status", dir: "asc" },
    renderCell: (row, col) => {
      if (col.key === "holder") return row.holder ? employeeById(String(row.holder)).name : <span className="muted">—</span>;
      if (col.key === "budget") return tl(Number(row.budget));
      if (col.key === "status") return badgeCell(row.status);
      if (col.key === "grade") return <Badge tone="neutral" plain>{String(row.grade)}</Badge>;
      return undefined;
    },
    rowAi: (row) => <AiHint title={`${row.title} · AI notu`} answer={`${row.aiNote}.`} actions={row.status === "Boş" ? ["İlana çıkar", "Dondur"] : row.status === "Bütçelenmiş" ? ["Onaya gönder"] : ["Detay"]} mode="popover" />,
    aiSummary: (rows) => `${rows.length} pozisyon · ${rows.filter((r) => r.status === "Boş").length} boş · boş bütçe ${tl(rows.filter((r) => r.status === "Boş").reduce((s, r) => s + Number(r.budget), 0))}/ay`,
    aiChips: ["boş", "mühendislik g6", "bütçe 80000 üstü bütçeye göre sırala", "dondurulmuş"],
  },
  docs: {
    rowKey: "id",
    columns: [
      { key: "title", label: "Belge", type: "text", sortable: true, primary: true },
      { key: "kind", label: "Tür", type: "enum", options: ["Sözleşme", "Politika", "Sertifika", "Form", "Bordro"], filter: true, sortable: true },
      { key: "updated", label: "Güncelleme", type: "text", sortable: true, hideOnCards: true },
      { key: "expires", label: "Bitiş", type: "text", sortable: true },
      { key: "status", label: "Durum", type: "enum", options: ["Geçerli", "Süresi doluyor", "Süresi doldu", "İmza bekliyor"], filter: true, sortable: true },
    ],
    defaultSort: { key: "status", dir: "desc" },
    renderCell: (row, col) => (col.key === "status" ? badgeCell(row.status) : undefined),
    rowAi: (row) => <AiHint title={`${row.title} · AI özeti`} answer={`${row.aiNote}.`} actions={row.status === "Süresi doluyor" ? ["Yenileme başlat"] : row.status === "Süresi doldu" ? ["Kurs planla"] : row.status === "İmza bekliyor" ? ["Hatırlat"] : ["Özeti gör"]} mode="popover" />,
    aiSummary: (rows) => `${rows.length} belge · ${rows.filter((r) => r.status === "Süresi doluyor").length} süresi doluyor · ${rows.filter((r) => r.status === "Süresi doldu").length} doldu · ${rows.filter((r) => r.status === "İmza bekliyor").length} imza bekliyor`,
    aiChips: ["süresi doluyor", "imza bekliyor sözleşme", "sertifika süresi doldu", "politika"],
  },
  cases: {
    rowKey: "id",
    columns: [
      { key: "id", label: "#", type: "text", hideOnCards: true },
      { key: "employeeId", label: "Çalışan", type: "person", primary: true },
      { key: "kind", label: "Tür", type: "enum", options: ["Şikayet", "Disiplin", "Talep", "Yardım masası", "Olay"], filter: true, sortable: true },
      { key: "title", label: "Konu", type: "text", sortable: true },
      { key: "opened", label: "Açılış", type: "text", sortable: true, hideOnCards: true },
      { key: "priority", label: "Öncelik", type: "enum", options: ["Yüksek", "Orta", "Düşük"], filter: true, sortable: true },
      { key: "state", label: "Durum", type: "enum", options: ["Açık", "İnceleme", "Çözüldü", "Kapandı"], filter: true, sortable: true },
    ],
    defaultSort: { key: "priority", dir: "desc" },
    renderCell: (row, col) => {
      if (col.key === "employeeId") return employeeCell(row);
      if (col.key === "id") return <span className="mono faint">{String(row.id)}</span>;
      if (col.key === "kind") return <Badge tone={row.kind === "Disiplin" || row.kind === "Olay" ? "critical" : row.kind === "Şikayet" ? "warning" : "info"} plain>{String(row.kind)}</Badge>;
      if (col.key === "priority" || col.key === "state") return badgeCell(row[col.key]);
      return undefined;
    },
    rowAi: (row) => <AiHint title={`${row.id} · AI özeti`} answer={`${row.aiNote}.`} actions={row.state === "Açık" || row.state === "İnceleme" ? ["Taslağı aç", "Görüşme planla"] : []} mode="popover" />,
    aiSummary: (rows) => `${rows.length} vaka · ${rows.filter((r) => r.state === "Açık").length} açık · ${rows.filter((r) => r.priority === "Yüksek" && r.state !== "Kapandı" && r.state !== "Çözüldü").length} yüksek öncelikli açık · en sık: ${topValue(rows, "kind")}`,
    aiChips: ["açık yüksek", "disiplin", "şikayet inceleme", "yardım masası"],
  },
  variablePayments: {
    rowKey: "id",
    columns: [
      { key: "employeeId", label: "Çalışan", type: "person", primary: true },
      { key: "kind", label: "Tür", type: "enum", options: ["Satış primi", "Proje bonusu", "Nöbet primi", "Hedef primi", "Referans ödülü", "Vardiya primi"], filter: true, sortable: true },
      { key: "amount", label: "Tutar", type: "money", sortable: true, filter: true, align: "end" },
      { key: "source", label: "Kaynak", type: "text", hideOnCards: true },
      { key: "state", label: "Durum", type: "enum", options: ["Onay bekliyor", "Onaylandı", "Hesaplandı", "Beklemede"], filter: true, sortable: true },
    ],
    defaultSort: { key: "state", dir: "desc" },
    renderCell: (row, col) => {
      if (col.key === "employeeId") return employeeCell(row);
      if (col.key === "amount") return <span className="strong">{tl(Number(row.amount))}</span>;
      if (col.key === "state") return badgeCell(row.state);
      return undefined;
    },
    rowAi: (row) => <AiHint title={`${row.kind} · AI notu`} answer={`${row.aiNote}.`} actions={row.state === "Onay bekliyor" ? ["Onayla", "Reddet"] : []} mode="popover" />,
    aiSummary: (rows) => `${rows.length} kalem · ${tl(rows.reduce((s, r) => s + Number(r.amount), 0))} toplam · ${rows.filter((r) => r.state === "Onay bekliyor").length} onay bekliyor`,
    aiChips: ["onay bekliyor", "tutar 5000 üstü tutara göre sırala", "satış primi", "beklemede"],
  },
  deductions: {
    rowKey: "id",
    columns: [
      { key: "employeeId", label: "Çalışan", type: "person", primary: true },
      { key: "kind", label: "Tür", type: "enum", options: ["Avans", "İcra", "Zimmet hasarı", "Ücretsiz izin", "Kredi"], filter: true, sortable: true },
      { key: "amount", label: "Toplam", type: "money", sortable: true, align: "end", hideOnCards: true },
      { key: "remaining", label: "Kalan", type: "money", sortable: true, filter: true, align: "end" },
      { key: "schedule", label: "Plan", type: "text", hideOnCards: true },
      { key: "state", label: "Durum", type: "enum", options: ["Aktif", "Kapandı", "İtiraz"], filter: true, sortable: true },
    ],
    defaultSort: { key: "remaining", dir: "desc" },
    renderCell: (row, col) => {
      if (col.key === "employeeId") return employeeCell(row);
      if (col.key === "amount" || col.key === "remaining") return tl(Number(row[col.key]));
      if (col.key === "state") return <Badge tone={row.state === "Aktif" ? "info" : row.state === "İtiraz" ? "warning" : "good"}>{String(row.state)}</Badge>;
      return undefined;
    },
    rowAi: (row) => <AiHint title={`${row.kind} · AI notu`} answer={`${row.aiNote}.`} actions={row.state === "İtiraz" ? ["Puantajı düzelt"] : row.state === "Aktif" ? ["Planı düzenle"] : []} mode="popover" />,
    aiSummary: (rows) => `${rows.length} kesinti · kalan ${tl(rows.reduce((s, r) => s + Number(r.remaining), 0))} · ${rows.filter((r) => r.state === "İtiraz").length} itiraz`,
    aiChips: ["itiraz", "avans aktif", "kalan 10000 üstü", "icra"],
  },
  automations: {
    rowKey: "id",
    columns: [
      { key: "name", label: "Otomasyon", type: "text", sortable: true, primary: true },
      { key: "kind", label: "Tür", type: "enum", options: ["Rapor", "Hatırlatma", "Onay akışı", "AI kuralı", "Entegrasyon"], filter: true, sortable: true },
      { key: "schedule", label: "Zamanlama", type: "text" },
      { key: "nextRun", label: "Sonraki", type: "text", hideOnCards: true },
      { key: "runs", label: "Çalıştırma", type: "number", sortable: true, align: "end", hideOnCards: true },
      { key: "status", label: "Durum", type: "enum", options: ["Aktif", "Duraklatıldı", "Hatalı"], filter: true, sortable: true },
    ],
    defaultSort: { key: "status", dir: "desc" },
    renderCell: (row, col) => {
      if (col.key === "kind") return <Badge tone={row.kind === "AI kuralı" ? "ai" : "info"} plain>{String(row.kind)}</Badge>;
      if (col.key === "status") return <Badge tone={row.status === "Aktif" ? "good" : row.status === "Hatalı" ? "critical" : "neutral"}>{String(row.status)}</Badge>;
      if (col.key === "runs") return new Intl.NumberFormat("tr-TR").format(Number(row.runs));
      return undefined;
    },
    rowAi: (row) => <AiHint title={`${row.name} · AI notu`} answer={`${row.aiNote}.`} actions={row.status === "Hatalı" ? ["Yeniden bağla"] : row.status === "Duraklatıldı" ? ["Yeniden başlat"] : ["Günlüğü aç"]} mode="popover" />,
    aiSummary: (rows) => `${rows.length} otomasyon · ${rows.filter((r) => r.status === "Aktif").length} aktif · ${rows.filter((r) => r.status === "Hatalı").length} hatalı · ${rows.filter((r) => r.kind === "AI kuralı").length} AI kuralı`,
    aiChips: ["hatalı", "ai kuralı", "duraklatıldı", "hatırlatma aktif"],
  },
  candidates: {
    rowKey: "id",
    columns: [
      { key: "name", label: "Aday", type: "person", subKey: "role", sortable: true, primary: true },
      { key: "role", label: "Pozisyon", type: "enum", options: ["Backend Geliştirici", "Frontend Geliştirici", "Satış Uzmanı", "Ürün Tasarımcısı", "DevOps Mühendisi", "Müşteri Destek Temsilcisi", "Veri Analisti", "Pazarlama Uzmanı"], filter: true, sortable: true, hideOnCards: true },
      { key: "stage", label: "Aşama", type: "enum", options: ["Başvuru", "Ön Eleme", "Mülakat", "Teklif", "İşe Alındı"], filter: true, sortable: true },
      { key: "score", label: "AI puanı", type: "meter", sortable: true, filter: true },
      { key: "source", label: "Kaynak", type: "enum", options: ["LinkedIn", "Kariyer.net", "Referans", "Web sitesi", "GitHub", "Üniversite"], filter: true, sortable: true },
      { key: "days", label: "Gün", type: "number", sortable: true, align: "end" },
    ],
    defaultSort: { key: "score", dir: "desc" },
    renderCell: (row, col) => {
      if (col.key === "name") return <Person name={String(row.name)} sub={String(row.role)} hue={Number(row.hue)} />;
      if (col.key === "stage") return <Badge tone={row.stage === "İşe Alındı" ? "good" : row.stage === "Teklif" ? "info" : "neutral"}>{String(row.stage)}</Badge>;
      if (col.key === "score") { const s = Number(row.score); return <Meter value={s} tone={s >= 80 ? "good" : s >= 60 ? "warning" : "critical"} />; }
      return undefined;
    },
    rowAi: (row) => <AiHint title={`${row.name} · sonraki adım`} answer={`${row.aiNote}.`} actions={row.stage === "Başvuru" ? ["Ön elemeye al", "Ret taslağı"] : row.stage === "Mülakat" ? ["Mülakat planla"] : row.stage === "Teklif" ? ["Hatırlatma gönder"] : ["Detay"]} mode="popover" />,
    aiSummary: (rows) => `${rows.length} aday · ${rows.filter((r) => Number(r.score) >= 80).length} güçlü (≥80) · ${rows.filter((r) => r.stage === "Mülakat").length} mülakatta · en iyi kaynak: ${topValue(rows.filter((r) => Number(r.score) >= 80), "source")}`,
    aiChips: ["puanı 80 üstü puana göre sırala", "mülakat", "linkedin backend", "teklif"],
  },
};

export type PresetName = keyof typeof PRESETS;

function topValue(rows: Row[], key: string): string {
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(String(r[key]), (counts.get(String(r[key])) ?? 0) + 1);
  let best = "—";
  let n = 0;
  for (const [k, v] of counts) if (v > n) { best = k; n = v; }
  return best;
}

function basePath(): string {
  if (typeof document === "undefined") return "";
  const m = document.querySelector<HTMLAnchorElement>("a.brand")?.getAttribute("href") ?? "/";
  return m.replace(/\/$/, "");
}
