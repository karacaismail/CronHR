/**
 * Deterministik demo veri üreteci. Aynı tohum → aynı veri (testler ve
 * ekran görüntüleri kararlı). Tüm tablolar buradan beslenir; ilk kayıtlar
 * hr.ts'deki elle yazılmış "anlatı" kayıtlarıdır, gerisi üretilir.
 */
import { EMPLOYEES as SEED_EMPLOYEES, CANDIDATES as SEED_CANDIDATES, LEAVE_REQUESTS as SEED_LEAVES, AUTOMATIONS as SEED_AUTOMATIONS, type Employee, type Candidate, type LeaveRequest, type Automation } from "./hr";
import { POSITIONS as SEED_POSITIONS, TIMESHEET as SEED_TIMESHEET, EXCEPTIONS as SEED_EXCEPTIONS, type Position, type TimesheetRow, type AttendanceException } from "./hr2";
import { DOCS as SEED_DOCS, type Doc } from "./hr";

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const FIRST = ["Ali", "Ayşe", "Berk", "Ceren", "Deniz", "Ece", "Furkan", "Gamze", "Hakan", "İpek", "Kaan", "Leyla", "Murat", "Nihan", "Onur", "Pelin", "Rıza", "Seda", "Tolga", "Umut", "Volkan", "Yasemin", "Zehra", "Arda", "Buse", "Cem", "Derya", "Emir", "Fatma", "Gökhan", "Hande", "Ilgaz", "Kerem", "Lale", "Mehmet", "Nur", "Okan", "Pınar", "Sinan", "Tuğba"];
const LAST = ["Kara", "Yılmaz", "Demirci", "Aksoy", "Çetin", "Doğan", "Erdoğan", "Güneş", "Işık", "Kaplan", "Koç", "Öztürk", "Polat", "Şen", "Taş", "Uçar", "Yalçın", "Bulut", "Ateş", "Kurt", "Aydın", "Sezer", "Turan", "Özdemir"];
const DEPTS: { name: string; titles: string[]; share: number }[] = [
  { name: "Mühendislik", titles: ["Backend Geliştirici", "Frontend Geliştirici", "DevOps Mühendisi", "Veri Analisti", "QA Mühendisi", "Mobil Geliştirici"], share: 35 },
  { name: "Satış", titles: ["Satış Uzmanı", "Kurumsal Satış Yöneticisi", "Satış Destek Uzmanı", "Müşteri Başarı Uzmanı"], share: 22 },
  { name: "Destek", titles: ["Müşteri Destek Temsilcisi", "Teknik Destek Uzmanı", "Destek Vardiya Lideri"], share: 16 },
  { name: "Ürün", titles: ["Ürün Yöneticisi", "Ürün Tasarımcısı", "UX Araştırmacısı"], share: 9 },
  { name: "Pazarlama", titles: ["Pazarlama Uzmanı", "İçerik Uzmanı", "Performans Pazarlama Uzmanı"], share: 8 },
  { name: "Finans", titles: ["Finans Uzmanı", "Muhasebe Uzmanı"], share: 6 },
  { name: "İnsan Kaynakları", titles: ["İK Uzmanı", "İşe Alım Uzmanı"], share: 4 },
];
const LOCS: Employee["location"][] = ["İstanbul", "İstanbul", "İstanbul", "Ankara", "İzmir", "Uzaktan", "Uzaktan"];
const REASONS = [
  "Katılım anketi ekip ortalamasının üstünde",
  "Son 6 ayda 2 kez terfi değerlendirmesine girdi",
  "Fazla mesai eğilimi son 2 ayda artıyor",
  "Ücret bandının alt çeyreğinde",
  "Yönetici değişikliği sonrası katılım düştü",
  "Sertifika ve eğitim tamamlama oranı yüksek",
  "Uzun süredir aynı pozisyonda",
  "İzin kullanımı düzenli, iş yükü dengeli",
  "Nöbet yükü ekip ortalamasının üstünde",
  "Dış teklif sinyali (LinkedIn profil güncellemesi)",
];

function pick<T>(r: () => number, arr: readonly T[]): T { return arr[Math.floor(r() * arr.length)]; }
function pad(n: number) { return String(n).padStart(2, "0"); }
function isoDate(r: () => number, fromYear = 2016, toYear = 2026): string {
  const y = fromYear + Math.floor(r() * (toYear - fromYear + 1));
  const m = 1 + Math.floor(r() * 12);
  const d = 1 + Math.floor(r() * 28);
  return `${y}-${pad(m)}-${pad(d)}`;
}
const MONTHS_TR = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
function shortDate(r: () => number, monthIdx: number): string { return `${1 + Math.floor(r() * 28)} ${MONTHS_TR[monthIdx]}`; }

function genEmployees(): Employee[] {
  const r = rng(42);
  const out: Employee[] = [...SEED_EMPLOYEES];
  const used = new Set(out.map((e) => e.name));
  let i = out.length;
  while (out.length < 120) {
    let name = `${pick(r, FIRST)} ${pick(r, LAST)}`;
    while (used.has(name)) name = `${pick(r, FIRST)} ${pick(r, LAST)}`;
    used.add(name);
    const roll = r() * 100;
    let acc = 0;
    let dept = DEPTS[0];
    for (const d of DEPTS) { acc += d.share; if (roll < acc) { dept = d; break; } }
    const risk = Math.min(100, Math.max(0, Math.round(r() * r() * 100)));
    const statusRoll = r();
    const status: Employee["status"] = statusRoll < 0.06 ? "Deneme" : statusRoll < 0.11 ? "İzinli" : statusRoll < 0.125 ? "Ayrılıyor" : "Aktif";
    i += 1;
    out.push({
      id: `e${i}`,
      name,
      title: pick(r, dept.titles),
      department: dept.name,
      location: pick(r, LOCS),
      startDate: isoDate(r, 2016, 2026),
      status,
      attritionRisk: status === "Ayrılıyor" ? 100 : risk,
      riskReason: pick(r, REASONS),
      engagement: Math.round(45 + r() * 50),
      hue: Math.floor(r() * 6),
    });
  }
  return out;
}

const ROLES = ["Backend Geliştirici", "Frontend Geliştirici", "Satış Uzmanı", "Ürün Tasarımcısı", "DevOps Mühendisi", "Müşteri Destek Temsilcisi", "Veri Analisti", "Pazarlama Uzmanı"];
const STAGES: Candidate["stage"][] = ["Başvuru", "Başvuru", "Başvuru", "Ön Eleme", "Ön Eleme", "Mülakat", "Teklif", "İşe Alındı"];
const SOURCES = ["LinkedIn", "Kariyer.net", "Referans", "Web sitesi", "GitHub", "Üniversite"];
const AI_NOTES = [
  "İlanla örtüşme yüksek; teknik test önerilir",
  "Deneyim süresi yeterli, sektör farklı; uyum sorusu ekle",
  "Portföy güçlü, iletişim notu eksik",
  "Ücret beklentisi bandın üstünde; teklif öncesi görüşülmeli",
  "Referans doğrulaması bekleniyor",
  "Aday 2 gündür yanıt vermedi; hatırlatma önerilir",
  "Uzaktan çalışma tercihi ilanla uyumlu",
  "Sertifikalar doğrulandı; mülakata al",
];

function genCandidates(): Candidate[] {
  const r = rng(7);
  const out: Candidate[] = [...SEED_CANDIDATES];
  const used = new Set(out.map((c) => c.name));
  let i = out.length;
  while (out.length < 48) {
    let name = `${pick(r, FIRST)} ${pick(r, LAST)}`;
    while (used.has(name)) name = `${pick(r, FIRST)} ${pick(r, LAST)}`;
    used.add(name);
    i += 1;
    out.push({ id: `c${i}`, name, role: pick(r, ROLES), stage: pick(r, STAGES), score: Math.round(35 + r() * 60), aiNote: pick(r, AI_NOTES), source: pick(r, SOURCES), days: 1 + Math.floor(r() * 40), hue: Math.floor(r() * 6) });
  }
  return out;
}

const LEAVE_TYPES: LeaveRequest["type"][] = ["Yıllık İzin", "Yıllık İzin", "Hastalık", "Mazeret", "Uzaktan Çalışma", "Doğum"];
function genLeaves(employees: Employee[]): LeaveRequest[] {
  const r = rng(11);
  const out: LeaveRequest[] = [...SEED_LEAVES];
  let i = out.length;
  while (out.length < 40) {
    const e = pick(r, employees);
    const type = pick(r, LEAVE_TYPES);
    const days = type === "Doğum" ? 112 : type === "Uzaktan Çalışma" ? 1 : 1 + Math.floor(r() * 7);
    const m = 8 + Math.floor(r() * 3);
    const d = 1 + Math.floor(r() * 24);
    const status: LeaveRequest["status"] = r() < 0.35 ? "Bekliyor" : r() < 0.85 ? "Onaylandı" : "Reddedildi";
    const verdict: LeaveRequest["aiVerdict"] = r() < 0.7 ? "Onayla" : r() < 0.9 ? "Dikkat" : "Reddet";
    i += 1;
    out.push({ id: `l${i}`, employeeId: e.id, type, from: `2026-${pad(m)}-${pad(d)}`, to: `2026-${pad(m)}-${pad(Math.min(28, d + days - 1))}`, days, status, aiVerdict: verdict, aiReason: verdict === "Onayla" ? "Politika içinde, ekipte çakışma yok" : verdict === "Dikkat" ? "Aynı hafta ekipte 2 izin daha var" : "Bakiye yetersiz" });
  }
  return out;
}

function genTimesheet(employees: Employee[]): TimesheetRow[] {
  const r = rng(23);
  const seeded = new Map(SEED_TIMESHEET.map((t) => [t.employeeId, t]));
  return employees.map((e) => {
    const s = seeded.get(e.id);
    if (s) return s;
    const paidLeave = r() < 0.25 ? 1 + Math.floor(r() * 5) : 0;
    const unpaidLeave = r() < 0.05 ? 1 : 0;
    const absent = r() < 0.08 ? 1 : 0;
    const workedDays = 22 - paidLeave - unpaidLeave - absent;
    const normalHours = workedDays * 8;
    const overtime = r() < 0.3 ? Math.round(r() * 24) : 0;
    const night = e.department === "Destek" && r() < 0.6 ? Math.round(r() * 10) : 0;
    const late = r() < 0.3 ? Math.floor(r() * 4) : 0;
    const stateRoll = r();
    const state: TimesheetRow["state"] = stateRoll < 0.3 ? "Hesaplandı" : stateRoll < 0.55 ? "Onay bekliyor" : stateRoll < 0.85 ? "Onaylandı" : "Kilitli";
    const issues: string[] = [];
    if (overtime > 40) issues.push("Fazla mesai politika sınırına yakın");
    if (absent) issues.push("1 devamsızlık");
    if (late >= 3) issues.push(`${late} geç kalma`);
    return { employeeId: e.id, plannedDays: 22, workedDays, workedHours: normalHours + overtime, paidLeave, unpaidLeave, absent, normalHours, overtime, night, holiday: 0, late, state, issues };
  });
}

const EXC_KINDS: AttendanceException["kind"][] = ["Eksik OUT", "Eksik IN", "Geç kalma", "Geç kalma", "Erken çıkış", "Çift IN", "Vardiyasız hareket", "Cihaz hatası"];
function genExceptions(employees: Employee[]): AttendanceException[] {
  const r = rng(31);
  const out: AttendanceException[] = [...SEED_EXCEPTIONS];
  let i = out.length;
  while (out.length < 36) {
    const e = pick(r, employees);
    const kind = pick(r, EXC_KINDS);
    const stateRoll = r();
    const state: AttendanceException["state"] = stateRoll < 0.4 ? "İstisna" : stateRoll < 0.6 ? "İnceleme" : stateRoll < 0.85 ? "Onaylandı" : stateRoll < 0.95 ? "Normal" : "Reddedildi";
    i += 1;
    out.push({ id: `x${i}`, employeeId: e.id, date: shortDate(r, 7 + Math.floor(r() * 2)), kind, detail: kind === "Geç kalma" ? `Vardiya 09:00, IN 09:${pad(16 + Math.floor(r() * 40))}` : kind === "Eksik OUT" ? "IN var, OUT yok" : kind === "Erken çıkış" ? `OUT 16:${pad(Math.floor(r() * 50))}, vardiya 18:00` : "Otomatik tespit", state, aiSuggestion: kind === "Geç kalma" ? "Tolerans aşıldı; yöneticiye bilgi" : kind === "Eksik OUT" ? "Takvim ve VPN kaydına göre OUT 18:00 önerilir" : "Kural gereği otomatik düzeltme uygulanabilir" });
  }
  return out;
}

export interface OvertimeRow {
  id: string; employeeId: string; date: string; hours: number; kind: string; state: "Onay bekliyor" | "Onaylandı" | "Reddedildi"; monthTotal: number; limit: number; aiNote: string;
}
function genOvertime(employees: Employee[]): OvertimeRow[] {
  const r = rng(53);
  const kinds = ["Sürüm kapanışı", "Gece nöbeti", "Hafta sonu destek", "Müşteri lansmanı", "Envanter sayımı", "Dönem kapanışı"];
  const out: OvertimeRow[] = [];
  for (let i = 1; i <= 30; i++) {
    const e = pick(r, employees);
    const hours = 1 + Math.floor(r() * 8);
    const monthTotal = Math.round(r() * 60);
    const sr = r();
    out.push({ id: `ot${i}`, employeeId: e.id, date: shortDate(r, 8), hours, kind: pick(r, kinds), state: sr < 0.4 ? "Onay bekliyor" : sr < 0.9 ? "Onaylandı" : "Reddedildi", monthTotal, limit: 72, aiNote: monthTotal + hours > 65 ? "Bu onayla aylık politika sınırına yaklaşılır" : "Sınır içinde; ekip ortalamasıyla uyumlu" });
  }
  return out;
}

function genPositions(): Position[] {
  const r = rng(61);
  const out: Position[] = [...SEED_POSITIONS];
  let i = out.length;
  const grades = ["G3", "G4", "G5", "G6", "G7"];
  while (out.length < 28) {
    const dept = pick(r, DEPTS);
    const title = pick(r, dept.titles);
    const sr = r();
    const status: Position["status"] = sr < 0.7 ? "Dolu" : sr < 0.85 ? "Boş" : sr < 0.95 ? "Bütçelenmiş" : "Dondurulmuş";
    i += 1;
    out.push({ id: `p${i}`, title, job: title.split(" ").slice(-2).join(" "), family: dept.name, grade: pick(r, grades), department: dept.name, status, holder: status === "Dolu" ? `e${1 + Math.floor(r() * 120)}` : undefined, budget: 30_000 + Math.round(r() * 90) * 1000, aiNote: status === "Boş" ? `${Math.floor(r() * 40)} gündür açık; ilan performansı izleniyor` : "Bütçe ve kademe tutarlı" });
  }
  return out;
}

function genDocs(employees: Employee[]): Doc[] {
  const r = rng(71);
  const out: Doc[] = [...SEED_DOCS];
  const kinds: Doc["kind"][] = ["Sözleşme", "Sözleşme", "Form", "Sertifika", "Politika", "Bordro"];
  let i = out.length;
  while (out.length < 40) {
    const e = pick(r, employees);
    const kind = pick(r, kinds);
    const sr = r();
    const status: Doc["status"] = sr < 0.7 ? "Geçerli" : sr < 0.85 ? "Süresi doluyor" : sr < 0.93 ? "İmza bekliyor" : "Süresi doldu";
    i += 1;
    out.push({ id: `d${i}`, title: `${kind === "Sözleşme" ? "İş Sözleşmesi" : kind === "Sertifika" ? "İSG Sertifikası" : kind === "Form" ? "İşe Giriş Formu" : kind === "Politika" ? "Uzaktan Çalışma Politikası" : "Bordro Özeti"} — ${e.name}`, kind, owner: e.id, updated: `${1 + Math.floor(r() * 28)} ${MONTHS_TR[Math.floor(r() * 9)]} 2026`, expires: kind === "Sertifika" || kind === "Sözleşme" ? `${1 + Math.floor(r() * 28)} ${MONTHS_TR[8 + Math.floor(r() * 4)]} 2026` : undefined, status, aiNote: status === "Süresi doluyor" ? "30 gün içinde yenileme gerekir" : status === "İmza bekliyor" ? "e-imza linki gönderildi" : "Arşivde, denetime hazır" });
  }
  return out;
}

export interface HrCaseRow { id: string; employeeId: string; kind: "Şikayet" | "Disiplin" | "Talep" | "Yardım masası" | "Olay"; title: string; opened: string; sla: string; state: "Açık" | "İnceleme" | "Çözüldü" | "Kapandı"; priority: "Yüksek" | "Orta" | "Düşük"; aiNote: string; }
function genCases(employees: Employee[]): HrCaseRow[] {
  const r = rng(83);
  const kinds: HrCaseRow["kind"][] = ["Yardım masası", "Yardım masası", "Talep", "Talep", "Şikayet", "Disiplin", "Olay"];
  const titles: Record<HrCaseRow["kind"], string[]> = {
    "Yardım masası": ["Bordroda yol ücreti eksik", "İzin bakiyesi hatalı görünüyor", "Çalışma belgesi talebi", "Sağlık sigortası kartı"],
    Talep: ["Ücret bandı değerlendirmesi", "Uzaktan çalışma günü artışı", "Ekipman yenileme", "Eğitim bütçesi"],
    "Şikayet": ["Nöbet dağılımı adaletsizliği", "Yönetici iletişimi", "Ofis gürültüsü"],
    Disiplin: ["Tekrarlayan geç kalma", "Politika ihlali (VPN)", "Devamsızlık"],
    Olay: ["İş kazası bildirimi (hafif)", "Veri sızıntısı şüphesi", "Ekipman hasarı"],
  };
  const out: HrCaseRow[] = [];
  for (let i = 1; i <= 24; i++) {
    const e = pick(r, employees);
    const kind = pick(r, kinds);
    const sr = r();
    out.push({ id: `hc${i}`, employeeId: e.id, kind, title: pick(r, titles[kind]), opened: shortDate(r, 7 + Math.floor(r() * 2)), sla: kind === "Olay" ? "3 iş günü" : kind === "Disiplin" ? "10 iş günü" : "5 iş günü", state: sr < 0.3 ? "Açık" : sr < 0.5 ? "İnceleme" : sr < 0.8 ? "Çözüldü" : "Kapandı", priority: kind === "Olay" || kind === "Disiplin" ? "Yüksek" : r() < 0.5 ? "Orta" : "Düşük", aiNote: kind === "Disiplin" ? "Önce sözlü görüşme; yazılı uyarı henüz önerilmiyor" : kind === "Şikayet" ? "Puantaj/PDKS kanıtları vaka dosyasına eklendi" : "Standart akış; SLA içinde" });
  }
  return out;
}

export interface VariablePaymentRow { id: string; employeeId: string; kind: string; amount: number; period: string; source: string; state: "Onay bekliyor" | "Onaylandı" | "Hesaplandı" | "Beklemede"; aiNote: string; }
function genVariablePayments(employees: Employee[]): VariablePaymentRow[] {
  const r = rng(97);
  const kinds = ["Satış primi", "Proje bonusu", "Nöbet primi", "Hedef primi", "Referans ödülü", "Vardiya primi"];
  const out: VariablePaymentRow[] = [];
  for (let i = 1; i <= 30; i++) {
    const e = pick(r, employees);
    const kind = pick(r, kinds);
    const sr = r();
    out.push({ id: `vp${i}`, employeeId: e.id, kind, amount: 1000 + Math.round(r() * 15) * 500, period: "Eyl 2026", source: kind.includes("prim") ? "CRM / Puantaj" : "Performans", state: sr < 0.35 ? "Onay bekliyor" : sr < 0.7 ? "Onaylandı" : sr < 0.9 ? "Hesaplandı" : "Beklemede", aiNote: sr < 0.35 ? "Politika kademesi doğrulandı; onaya hazır" : "Kaynak sistemle eşleşti" });
  }
  return out;
}

export interface DeductionRow { id: string; employeeId: string; kind: string; amount: number; remaining: number; schedule: string; state: "Aktif" | "Kapandı" | "İtiraz"; aiNote: string; }
function genDeductions(employees: Employee[]): DeductionRow[] {
  const r = rng(101);
  const kinds = ["Avans", "Avans", "İcra", "Zimmet hasarı", "Ücretsiz izin", "Kredi"];
  const out: DeductionRow[] = [];
  for (let i = 1; i <= 20; i++) {
    const e = pick(r, employees);
    const kind = pick(r, kinds);
    const amount = 1000 + Math.round(r() * 40) * 500;
    const remaining = Math.round(amount * r());
    const sr = r();
    out.push({ id: `dd${i}`, employeeId: e.id, kind, amount, remaining, schedule: kind === "İcra" ? "Net maaşın 1/4'ü" : `${1 + Math.floor(r() * 6)} taksit`, state: sr < 0.7 ? "Aktif" : sr < 0.9 ? "Kapandı" : "İtiraz", aiNote: kind === "Avans" && r() < 0.5 ? "Son 6 ayda 2. avans; ücret bandı kontrolü önerilir" : "Yasal oran/plan otomatik uygulanıyor" });
  }
  return out;
}

function genAutomations(): Automation[] {
  const r = rng(113);
  const out: Automation[] = [...SEED_AUTOMATIONS];
  const names = ["Sertifika bitiş uyarısı", "Yeni başlayan hoş geldin e-postası", "Aylık kadro raporu", "İzin bakiyesi hatırlatması", "Terfi dönemi başlangıcı", "Bordro kesinleşince bilgilendirme", "Vardiya planı yayın hatırlatması", "Fazla mesai sınırı uyarısı", "Belge eksik hatırlatması", "Çıkış mülakatı planlama", "Doğum günü listesi", "Haftalık işe alım özeti"];
  const kinds: Automation["kind"][] = ["Rapor", "Hatırlatma", "Onay akışı", "AI kuralı", "Entegrasyon"];
  let i = out.length;
  for (const name of names) {
    if (out.length >= 19) break;
    i += 1;
    const sr = r();
    out.push({ id: `a${i}`, name, schedule: pick(r, ["Her gün 08:00", "Her pazartesi 09:00", "Ayın 1'i 09:00", "Her 30 dakikada", "Olay tabanlı"]), cron: pick(r, ["0 8 * * *", "0 9 * * 1", "0 9 1 * *", "*/30 * * * *", "olay"]), kind: pick(r, kinds), lastRun: shortDate(r, 8), nextRun: shortDate(r, 8), status: sr < 0.85 ? "Aktif" : sr < 0.95 ? "Duraklatıldı" : "Hatalı", runs: Math.round(r() * 500), aiNote: "Son 30 günde hatasız" });
  }
  return out;
}

const employees = genEmployees();
export const GEN = {
  employees,
  candidates: genCandidates(),
  leaves: genLeaves(employees),
  timesheet: genTimesheet(employees),
  exceptions: genExceptions(employees),
  overtime: genOvertime(employees),
  positions: genPositions(),
  docs: genDocs(employees),
  cases: genCases(employees),
  variablePayments: genVariablePayments(employees),
  deductions: genDeductions(employees),
  automations: genAutomations(),
} as const;


export function employeeById(id: string): Employee {
  return employees.find((e) => e.id === id) ?? employees[0];
}
