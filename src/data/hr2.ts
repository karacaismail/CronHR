/**
 * İşgücü işletim sistemi genişlemesi için sahte veri: organizasyon,
 * pozisyon, özlük (Employee 360), PDKS, puantaj, fazla mesai, takvim,
 * bordro alt alanları, yaşam döngüsü, HR vakaları, görevler, entegrasyonlar.
 */
import type { Tone } from "./hr";

/* ------------------------------------------------------------ organizasyon */

export const LEGAL_ENTITIES = [
  { id: "le1", name: "Karaca Teknoloji A.Ş.", taxNo: "5230412345", sgkWorkplaces: 3, employees: 108 },
  { id: "le2", name: "Karaca Lojistik Ltd. Şti.", taxNo: "5230498765", sgkWorkplaces: 1, employees: 12 },
] as const;

export const WORKPLACES = [
  { id: "wp1", name: "İstanbul Merkez Ofis", entity: "le1", sgkNo: "2 4536 01 01 1234567 034 12 34", type: "Ofis", employees: 71 },
  { id: "wp2", name: "Ankara Şube", entity: "le1", sgkNo: "2 4536 01 01 1234568 006 12 34", type: "Şube", employees: 22 },
  { id: "wp3", name: "İzmir Destek Merkezi", entity: "le1", sgkNo: "2 4536 01 01 1234569 035 12 34", type: "Şube", employees: 15 },
  { id: "wp4", name: "Gebze Depo", entity: "le2", sgkNo: "2 4536 01 01 1234570 041 12 34", type: "Depo", employees: 12 },
] as const;

export interface OrgNode {
  id: string;
  name: string;
  kind: "Şirket" | "Departman" | "Ekip";
  head: string;
  headcount: number;
  open: number;
  costCenter?: string;
  children?: OrgNode[];
}

export const ORG_TREE: OrgNode = {
  id: "o0", name: "Karaca Teknoloji A.Ş.", kind: "Şirket", head: "İsmail Karaca", headcount: 120, open: 7,
  children: [
    { id: "o1", name: "Mühendislik", kind: "Departman", head: "Ahmet Yıldız", headcount: 42, open: 3, costCenter: "CC-100", children: [
      { id: "o11", name: "Backend", kind: "Ekip", head: "Ahmet Yıldız", headcount: 14, open: 1, costCenter: "CC-101" },
      { id: "o12", name: "Frontend", kind: "Ekip", head: "Burak Şahin", headcount: 11, open: 1, costCenter: "CC-102" },
      { id: "o13", name: "Platform / DevOps", kind: "Ekip", head: "Emre Doğan", headcount: 8, open: 1, costCenter: "CC-103" },
      { id: "o14", name: "Veri", kind: "Ekip", head: "Selin Çelik", headcount: 9, open: 0, costCenter: "CC-104" },
    ] },
    { id: "o2", name: "Satış", kind: "Departman", head: "Nazlı Erdem", headcount: 27, open: 2, costCenter: "CC-200", children: [
      { id: "o21", name: "Kurumsal Satış", kind: "Ekip", head: "Mert Kaya", headcount: 15, open: 1, costCenter: "CC-201" },
      { id: "o22", name: "KOBİ Satış", kind: "Ekip", head: "Onur Kılıç", headcount: 12, open: 1, costCenter: "CC-202" },
    ] },
    { id: "o3", name: "Destek", kind: "Departman", head: "Can Öztürk", headcount: 19, open: 1, costCenter: "CC-300" },
    { id: "o4", name: "Ürün", kind: "Departman", head: "Elif Demir", headcount: 11, open: 1, costCenter: "CC-400" },
    { id: "o5", name: "Pazarlama", kind: "Departman", head: "Ayşe Aydın", headcount: 9, open: 0, costCenter: "CC-500" },
    { id: "o6", name: "Finans", kind: "Departman", head: "Deniz Koç", headcount: 7, open: 0, costCenter: "CC-600" },
    { id: "o7", name: "İnsan Kaynakları", kind: "Departman", head: "Zeynep Arslan", headcount: 5, open: 0, costCenter: "CC-700" },
  ],
};

export interface Position {
  id: string;
  title: string;
  job: string;
  family: string;
  grade: string;
  department: string;
  status: "Dolu" | "Boş" | "Bütçelenmiş" | "Dondurulmuş";
  holder?: string;
  budget: number;
  aiNote: string;
}

export const POSITIONS: readonly Position[] = [
  { id: "p1", title: "Kıdemli Backend Geliştirici", job: "Yazılım Mühendisi", family: "Mühendislik", grade: "G6", department: "Mühendislik", status: "Dolu", holder: "e1", budget: 95_000, aiNote: "Ünvan 18 aydır aynı; G7 değerlendirmesi öneriliyor" },
  { id: "p2", title: "Backend Geliştirici", job: "Yazılım Mühendisi", family: "Mühendislik", grade: "G5", department: "Mühendislik", status: "Boş", budget: 72_000, aiNote: "38 başvuru; Gizem Ak ikinci turda" },
  { id: "p3", title: "Frontend Geliştirici", job: "Yazılım Mühendisi", family: "Mühendislik", grade: "G5", department: "Mühendislik", status: "Boş", budget: 68_000, aiNote: "İlan 12 gündür açık" },
  { id: "p4", title: "DevOps Mühendisi", job: "Platform Mühendisi", family: "Mühendislik", grade: "G6", department: "Mühendislik", status: "Bütçelenmiş", budget: 88_000, aiNote: "Ekim bütçesinde; nöbet yükünü dengeler" },
  { id: "p5", title: "Satış Uzmanı", job: "Satış Temsilcisi", family: "Satış", grade: "G4", department: "Satış", status: "Boş", budget: 48_000, aiNote: "34 gündür açık; teklif aşamasında 1 aday" },
  { id: "p6", title: "Ürün Yöneticisi", job: "Ürün Yönetimi", family: "Ürün", grade: "G6", department: "Ürün", status: "Dolu", holder: "e2", budget: 90_000, aiNote: "Stabil" },
  { id: "p7", title: "Finans Uzmanı", job: "Finans", family: "Destek Fonksiyonlar", grade: "G5", department: "Finans", status: "Dolu", holder: "e8", budget: 62_000, aiNote: "26 Eylül'de boşalıyor; yeniden açılış onayı bekliyor" },
  { id: "p8", title: "Ürün Tasarımcısı", job: "Tasarım", family: "Ürün", grade: "G5", department: "Ürün", status: "Dondurulmuş", budget: 70_000, aiNote: "Barış Uçar 15 Eylül'de başlıyor; pozisyon o gün 'Dolu' olacak" },
];

/* ------------------------------------------------------------- özlük 360 */

export interface EffectiveDated<T> {
  from: string;
  to?: string;
  value: T;
  reason: string;
}

export interface EmployeeDossier {
  employeeId: string;
  employeeNo: string;
  identity: { nationalId: string; birthDate: string; birthPlace: string; nationality: string; maritalStatus: string };
  contact: { phone: string; email: string; address: string; emergency: string };
  employment: { entity: string; workplace: string; employmentType: string; contractType: string; grade: string; costCenter: string; manager: string; probationEnd?: string };
  contracts: { title: string; from: string; to?: string; version: number; status: "Yürürlükte" | "Sona erdi" | "Taslak" }[];
  sgk: { workplace: string; professionCode: string; insuranceType: string; premiumType: string; incentive?: string };
  salaryHistory: EffectiveDated<number>[];
  bank: { name: string; iban: string; payrollGroup: string };
  education: { school: string; degree: string; year: number }[];
  certificates: { name: string; expires?: string }[];
  assets: { name: string; tag: string; since: string }[];
  lifecycle: { date: string; event: string; detail: string }[];
  completeness: number;
  missing: string[];
}

export const DOSSIERS: readonly EmployeeDossier[] = [
  {
    employeeId: "e1", employeeNo: "KT-0042",
    identity: { nationalId: "1••••••••42", birthDate: "12 Mar 1991", birthPlace: "Bursa", nationality: "T.C.", maritalStatus: "Evli" },
    contact: { phone: "+90 5•• ••• 42 17", email: "ahmet.yildiz@karaca.example", address: "Kadıköy, İstanbul", emergency: "Merve Yıldız · eş" },
    employment: { entity: "Karaca Teknoloji A.Ş.", workplace: "İstanbul Merkez Ofis", employmentType: "Tam zamanlı", contractType: "Belirsiz süreli", grade: "G6", costCenter: "CC-101", manager: "Elif Demir" },
    contracts: [
      { title: "Belirsiz süreli iş sözleşmesi", from: "15 Mar 2021", version: 2, status: "Yürürlükte" },
      { title: "Uzaktan çalışma ek protokolü", from: "1 Haz 2023", version: 1, status: "Yürürlükte" },
      { title: "Deneme süreli iş sözleşmesi", from: "15 Mar 2021", to: "15 Haz 2021", version: 1, status: "Sona erdi" },
    ],
    sgk: { workplace: "İstanbul Merkez Ofis", professionCode: "2512.03 · Yazılım geliştirici", insuranceType: "4/a", premiumType: "01 · Hizmet akdi", incentive: "5510 / 5 puan" },
    salaryHistory: [
      { from: "1 Haz 2026", value: 95_000, reason: "Yıllık ücret revizyonu" },
      { from: "1 Haz 2025", to: "31 May 2026", value: 82_000, reason: "Yıllık ücret revizyonu" },
      { from: "1 Haz 2024", to: "31 May 2025", value: 68_000, reason: "Kıdemli ünvanı" },
      { from: "15 Mar 2021", to: "31 May 2024", value: 41_000, reason: "İşe giriş" },
    ],
    bank: { name: "Ziraat Bankası", iban: "TR•• •••• •••• •••• •••• •••• 42", payrollGroup: "Aylık · Beyaz yaka" },
    education: [{ school: "İTÜ", degree: "Bilgisayar Mühendisliği, Lisans", year: 2013 }],
    certificates: [{ name: "AWS Developer Associate", expires: "Mar 2027" }, { name: "İSG Temel Eğitimi", expires: "Oca 2027" }],
    assets: [{ name: "MacBook Pro 16\"", tag: "AST-0311", since: "Mar 2021" }, { name: "Yubikey", tag: "AST-0812", since: "Haz 2023" }],
    lifecycle: [
      { date: "1 Haz 2026", event: "Ücret değişikliği", detail: "82.000 › 95.000 ₺" },
      { date: "1 Haz 2024", event: "Terfi", detail: "Backend Geliştirici › Kıdemli Backend Geliştirici" },
      { date: "1 Haz 2023", event: "Çalışma modeli", detail: "Ofis › Hibrit" },
      { date: "15 Haz 2021", event: "Deneme süresi tamamlandı", detail: "Belirsiz süreliye geçiş" },
      { date: "15 Mar 2021", event: "İşe giriş", detail: "Backend Geliştirici, G5" },
    ],
    completeness: 96, missing: ["Güncel ikametgah belgesi"],
  },
  {
    employeeId: "e3", employeeNo: "KT-0117",
    identity: { nationalId: "2••••••••17", birthDate: "4 Ağu 1997", birthPlace: "Ankara", nationality: "T.C.", maritalStatus: "Bekar" },
    contact: { phone: "+90 5•• ••• 17 08", email: "mert.kaya@karaca.example", address: "Çankaya, Ankara", emergency: "Hasan Kaya · baba" },
    employment: { entity: "Karaca Teknoloji A.Ş.", workplace: "Ankara Şube", employmentType: "Tam zamanlı", contractType: "Deneme süreli", grade: "G4", costCenter: "CC-201", manager: "Nazlı Erdem", probationEnd: "16 Eyl 2026" },
    contracts: [{ title: "Deneme süreli iş sözleşmesi", from: "4 Kas 2025", to: "16 Eyl 2026", version: 1, status: "Yürürlükte" }, { title: "Belirsiz süreli iş sözleşmesi", from: "17 Eyl 2026", version: 1, status: "Taslak" }],
    sgk: { workplace: "Ankara Şube", professionCode: "3322.01 · Satış temsilcisi", insuranceType: "4/a", premiumType: "01 · Hizmet akdi" },
    salaryHistory: [{ from: "4 Kas 2025", value: 46_000, reason: "İşe giriş" }],
    bank: { name: "Garanti BBVA", iban: "TR•• •••• •••• •••• •••• •••• 17", payrollGroup: "Aylık · Beyaz yaka" },
    education: [{ school: "Hacettepe", degree: "İşletme, Lisans", year: 2020 }],
    certificates: [],
    assets: [{ name: "Dell Latitude", tag: "AST-0930", since: "Kas 2025" }, { name: "Araç · 06 KT 117", tag: "AST-0931", since: "Kas 2025" }],
    lifecycle: [{ date: "4 Kas 2025", event: "İşe giriş", detail: "Satış Uzmanı, G4, deneme süreli" }],
    completeness: 71, missing: ["Diploma", "Sağlık raporu", "İlk değerlendirme formu", "SGK teşvik kontrolü"],
  },
];

export function dossier(employeeId: string): EmployeeDossier {
  return DOSSIERS.find((d) => d.employeeId === employeeId) ?? { ...DOSSIERS[0], employeeId, completeness: 84, missing: ["Acil durum kişisi"] };
}

/* ---------------------------------------------------------------- PDKS */

export const DEVICES = [
  { id: "dv1", name: "Merkez Giriş Turnike 1", location: "İstanbul Merkez", kind: "Kart / NFC", status: "Çevrimiçi", lastSync: "10:58", events24h: 412 },
  { id: "dv2", name: "Merkez Giriş Turnike 2", location: "İstanbul Merkez", kind: "Kart / NFC", status: "Çevrimiçi", lastSync: "10:58", events24h: 388 },
  { id: "dv3", name: "Ankara Şube Terminal", location: "Ankara", kind: "PIN + Kart", status: "Çevrimiçi", lastSync: "10:55", events24h: 96 },
  { id: "dv4", name: "İzmir Destek Terminal", location: "İzmir", kind: "RFID", status: "Senkron gecikmesi", lastSync: "08:12", events24h: 41 },
  { id: "dv5", name: "Gebze Depo Kapı", location: "Gebze", kind: "RFID", status: "Çevrimdışı", lastSync: "Dün 19:40", events24h: 0 },
  { id: "dv6", name: "Mobil check-in", location: "Uzaktan", kind: "Mobil (konum)", status: "Çevrimiçi", lastSync: "10:59", events24h: 74 },
] as const;

export interface RawEvent {
  id: string;
  employeeId: string;
  device: string;
  timestamp: string;
  type: "IN" | "OUT" | "BREAK_START" | "BREAK_END";
  source: string;
  receivedAt: string;
}

export const RAW_EVENTS: readonly RawEvent[] = [
  { id: "ev1", employeeId: "e7", device: "dv1", timestamp: "4 Eyl 08:03", type: "IN", source: "NFC", receivedAt: "08:03:04" },
  { id: "ev2", employeeId: "e7", device: "dv1", timestamp: "4 Eyl 12:01", type: "BREAK_START", source: "NFC", receivedAt: "12:01:11" },
  { id: "ev3", employeeId: "e7", device: "dv1", timestamp: "4 Eyl 12:44", type: "BREAK_END", source: "NFC", receivedAt: "12:44:02" },
  { id: "ev4", employeeId: "e1", device: "dv2", timestamp: "4 Eyl 09:41", type: "IN", source: "Kart", receivedAt: "09:41:20" },
  { id: "ev5", employeeId: "e3", device: "dv3", timestamp: "4 Eyl 08:29", type: "IN", source: "PIN", receivedAt: "08:29:55" },
  { id: "ev6", employeeId: "e6", device: "dv6", timestamp: "4 Eyl 09:02", type: "IN", source: "Mobil", receivedAt: "09:02:31" },
  { id: "ev7", employeeId: "e9", device: "dv1", timestamp: "3 Eyl 18:02", type: "OUT", source: "NFC", receivedAt: "18:02:09" },
  { id: "ev8", employeeId: "e10", device: "dv6", timestamp: "3 Eyl 22:04", type: "IN", source: "Mobil", receivedAt: "22:04:47" },
];

export interface AttendanceException {
  id: string;
  employeeId: string;
  date: string;
  kind: "Eksik OUT" | "Eksik IN" | "Geç kalma" | "Erken çıkış" | "Çift IN" | "Vardiyasız hareket" | "Cihaz hatası";
  detail: string;
  state: "Normal" | "İstisna" | "İnceleme" | "Onaylandı" | "Reddedildi";
  aiSuggestion: string;
}

export const EXCEPTIONS: readonly AttendanceException[] = [
  { id: "x1", employeeId: "e9", date: "3 Eyl", kind: "Eksik IN", detail: "18:02 OUT var, aynı gün IN yok", state: "İstisna", aiSuggestion: "Vardiya 10–18; 09:58'de VPN oturumu açılmış. IN = 10:00 olarak düzeltme önerilir" },
  { id: "x2", employeeId: "e1", date: "4 Eyl", kind: "Geç kalma", detail: "Vardiya 09:00, IN 09:41 (41 dk)", state: "İnceleme", aiSuggestion: "Aynı hafta 3. geç kalma; yöneticiye bilgi ver, tolerans 15 dk aşıldı" },
  { id: "x3", employeeId: "e10", date: "3 Eyl", kind: "Vardiyasız hareket", detail: "22:04 IN, planlı vardiya yok", state: "İstisna", aiSuggestion: "Nöbet çağrısı olabilir; on-call kaydıyla eşleşiyor, fazla mesai olarak işaretle" },
  { id: "x4", employeeId: "e5", date: "2 Eyl", kind: "Cihaz hatası", detail: "İzmir terminali 08:12'den beri senkron dışı", state: "İstisna", aiSuggestion: "Cihaz günlüğü alınınca 14 hareket otomatik eklenecek" },
  { id: "x5", employeeId: "e3", date: "1 Eyl", kind: "Erken çıkış", detail: "Vardiya 08–16, OUT 15:12", state: "Onaylandı", aiSuggestion: "Yönetici onayladı: müşteri ziyareti" },
  { id: "x6", employeeId: "e7", date: "29 Ağu", kind: "Çift IN", detail: "08:01 IN ve 08:02 IN", state: "Normal", aiSuggestion: "İkinci hareket kural gereği yok sayıldı" },
];

export const CORRECTIONS = [
  { id: "cr1", employeeId: "e9", date: "3 Eyl", request: "10:00'da giriş yaptım ancak turnike kartımı okumadı.", state: "Bekliyor", aiNote: "VPN kaydı ve takvimle tutarlı; onay önerilir" },
  { id: "cr2", employeeId: "e6", date: "2 Eyl", request: "Mobil check-in konum izni kapalıydı, 09:00–18:00 uzaktan çalıştım.", state: "Bekliyor", aiNote: "Git aktivitesi 09:12–17:48; onay önerilir" },
  { id: "cr3", employeeId: "e3", date: "28 Ağu", request: "Müşteri ziyareti nedeniyle 15:12'de çıktım.", state: "Onaylandı", aiNote: "Yönetici onayı 29 Ağu" },
] as const;

export const ATTENDANCE_RULES = [
  { name: "Tolerans (geç kalma)", value: "15 dk", note: "Aşımı 'Geç kalma' istisnası üretir" },
  { name: "Yuvarlama", value: "5 dk", note: "Hareket zamanı en yakın 5 dakikaya" },
  { name: "Minimum çalışma", value: "4 sa", note: "Altı 'Kısmi çalışma'" },
  { name: "Erken çıkış eşiği", value: "30 dk", note: "Vardiya bitişinden önce" },
  { name: "Mola", value: "45 dk ücretsiz", note: "Otomatik düşülür, BREAK olayı varsa gerçek süre" },
  { name: "Eksik hareket", value: "İstisna + talep", note: "Çalışan düzeltme talebi açar, yönetici onaylar" },
] as const;

/* ------------------------------------------------------------- puantaj */

export interface TimesheetRow {
  employeeId: string;
  plannedDays: number;
  workedDays: number;
  workedHours: number;
  paidLeave: number;
  unpaidLeave: number;
  absent: number;
  normalHours: number;
  overtime: number;
  night: number;
  holiday: number;
  late: number;
  state: "Hesaplandı" | "Onay bekliyor" | "Onaylandı" | "Kilitli";
  issues: string[];
}

export const TIMESHEET: readonly TimesheetRow[] = [
  { employeeId: "e1", plannedDays: 22, workedDays: 21, workedHours: 176, paidLeave: 1, unpaidLeave: 0, absent: 0, normalHours: 168, overtime: 8, night: 0, holiday: 0, late: 3, state: "Onay bekliyor", issues: ["3 geç kalma"] },
  { employeeId: "e10", plannedDays: 22, workedDays: 22, workedHours: 238, paidLeave: 0, unpaidLeave: 0, absent: 0, normalHours: 176, overtime: 62, night: 14, holiday: 1, late: 0, state: "Onay bekliyor", issues: ["Fazla mesai politika sınırına yakın", "1 vardiyasız hareket"] },
  { employeeId: "e7", plannedDays: 22, workedDays: 22, workedHours: 178, paidLeave: 0, unpaidLeave: 0, absent: 0, normalHours: 176, overtime: 2, night: 0, holiday: 0, late: 0, state: "Onaylandı", issues: [] },
  { employeeId: "e3", plannedDays: 22, workedDays: 19, workedHours: 150, paidLeave: 0, unpaidLeave: 3, absent: 0, normalHours: 150, overtime: 0, night: 0, holiday: 0, late: 1, state: "Onay bekliyor", issues: ["3 mazeret izni ücretsiz işlenmiş; politika ile uyuşmuyor"] },
  { employeeId: "e5", plannedDays: 22, workedDays: 12, workedHours: 96, paidLeave: 10, unpaidLeave: 0, absent: 0, normalHours: 96, overtime: 0, night: 0, holiday: 0, late: 0, state: "Onaylandı", issues: [] },
  { employeeId: "e9", plannedDays: 22, workedDays: 21, workedHours: 167, paidLeave: 0, unpaidLeave: 0, absent: 1, normalHours: 167, overtime: 0, night: 0, holiday: 0, late: 0, state: "Hesaplandı", issues: ["1 eksik IN (düzeltme talebi bekliyor)"] },
  { employeeId: "e6", plannedDays: 22, workedDays: 22, workedHours: 176, paidLeave: 0, unpaidLeave: 0, absent: 0, normalHours: 176, overtime: 0, night: 0, holiday: 0, late: 0, state: "Kilitli", issues: [] },
  { employeeId: "e2", plannedDays: 22, workedDays: 17, workedHours: 136, paidLeave: 5, unpaidLeave: 0, absent: 0, normalHours: 136, overtime: 0, night: 0, holiday: 0, late: 0, state: "Onaylandı", issues: [] },
];

/* ---------------------------------------------------------- fazla mesai */

export const OVERTIME = [
  { id: "ot1", employeeId: "e10", date: "3 Eyl", hours: 8, kind: "Gece nöbeti", state: "Onay bekliyor", monthTotal: 62, limit: 72, aiNote: "Bu onayla aylık toplam 70 saat; politika sınırına 2 saat kalır" },
  { id: "ot2", employeeId: "e1", date: "2 Eyl", hours: 3, kind: "Sürüm kapanışı", state: "Onay bekliyor", monthTotal: 8, limit: 72, aiNote: "Sınır içinde; ekip ortalaması 6 saat" },
  { id: "ot3", employeeId: "e7", date: "29 Ağu", hours: 2, kind: "Sürüm kapanışı", state: "Onaylandı", monthTotal: 2, limit: 72, aiNote: "Tamamlandı" },
  { id: "ot4", employeeId: "e5", date: "27 Ağu", hours: 4, kind: "Hafta sonu destek", state: "Reddedildi", monthTotal: 0, limit: 72, aiNote: "İzin dönemine denk geliyor; kayıt hatası" },
] as const;

/* ---------------------------------------------------------------- takvim */

export const HOLIDAYS_2026 = [
  { date: "1 Oca", name: "Yılbaşı", kind: "Resmi" },
  { date: "19–22 Mar", name: "Ramazan Bayramı", kind: "Dini" },
  { date: "23 Nis", name: "Ulusal Egemenlik ve Çocuk Bayramı", kind: "Resmi" },
  { date: "1 May", name: "Emek ve Dayanışma Günü", kind: "Resmi" },
  { date: "19 May", name: "Atatürk'ü Anma, Gençlik ve Spor Bayramı", kind: "Resmi" },
  { date: "26–30 May", name: "Kurban Bayramı", kind: "Dini" },
  { date: "15 Tem", name: "Demokrasi ve Milli Birlik Günü", kind: "Resmi" },
  { date: "30 Ağu", name: "Zafer Bayramı", kind: "Resmi" },
  { date: "28 Eki (½) – 29 Eki", name: "Cumhuriyet Bayramı", kind: "Resmi" },
] as const;

export const WORKING_CALENDARS = [
  { id: "wc1", name: "Ofis · 5 gün", days: "Pzt–Cum", hours: "09:00–18:00", weekly: 45, employees: 86, holidayCal: "Türkiye 2026" },
  { id: "wc2", name: "Destek · 6 gün rotasyon", days: "Rotasyon", hours: "Vardiyalı", weekly: 45, employees: 19, holidayCal: "Türkiye 2026" },
  { id: "wc3", name: "Depo · 12/36", days: "Rotasyon", hours: "12 saat", weekly: 42, employees: 12, holidayCal: "Türkiye 2026" },
  { id: "wc4", name: "Yarı zamanlı", days: "Pzt–Çar", hours: "09:00–15:00", weekly: 18, employees: 3, holidayCal: "Türkiye 2026" },
] as const;

/* ---------------------------------------------------------------- bordro */

export const SALARY_STRUCTURES = [
  { id: "ss1", name: "Beyaz yaka · Aylık", employees: 92, base: "Aylık brüt", earnings: ["Maaş", "Yemek", "Yol", "Prim"], deductions: ["Gelir vergisi", "SGK işçi", "İşsizlik işçi", "Damga"], rounding: "Kuruş" },
  { id: "ss2", name: "Mavi yaka · Saatlik", employees: 25, base: "Saat ücreti × puantaj", earnings: ["Normal saat", "Fazla mesai %50", "Gece %20", "Tatil %100", "Vardiya primi"], deductions: ["Gelir vergisi", "SGK işçi", "İşsizlik işçi", "Damga"], rounding: "Kuruş" },
  { id: "ss3", name: "Yönetici", employees: 3, base: "Aylık brüt + hedef primi", earnings: ["Maaş", "Hedef primi", "Araç"], deductions: ["Gelir vergisi", "SGK işçi", "İşsizlik işçi", "Damga"], rounding: "Kuruş" },
] as const;

export const VARIABLE_PAYMENTS = [
  { id: "vp1", employeeId: "e3", kind: "Satış primi", amount: 6_400, period: "Eyl 2026", source: "CRM · kapanan 4 hesap", state: "Onay bekliyor", aiNote: "Hedefin %35'i; prim politikasına göre kademe 1" },
  { id: "vp2", employeeId: "e7", kind: "Proje bonusu", amount: 12_000, period: "Eyl 2026", source: "Performans · tasarım sistemi v2", state: "Onaylandı", aiNote: "Erken teslim bonusu, yönetici onaylı" },
  { id: "vp3", employeeId: "e10", kind: "Nöbet primi", amount: 4_200, period: "Eyl 2026", source: "Puantaj · 14 gece", state: "Hesaplandı", aiNote: "Puantaj kilitlenince kesinleşir" },
  { id: "vp4", employeeId: "e2", kind: "Hedef primi", amount: 9_000, period: "Eyl 2026", source: "OKR · %54", state: "Beklemede", aiNote: "Hedef %70 eşiğinin altında; deney sonucu 12 Eylül'de" },
] as const;

export const DEDUCTIONS = [
  { id: "dd1", employeeId: "e6", kind: "Avans", amount: 15_000, remaining: 5_000, schedule: "3 taksit · son Eki 2026", state: "Aktif", aiNote: "Ücret bandı altı çalışan; avans sıklığı ayrılma sinyaliyle ilişkili olabilir" },
  { id: "dd2", employeeId: "e5", kind: "İcra", amount: 42_000, remaining: 31_500, schedule: "Net maaşın 1/4'ü", state: "Aktif", aiNote: "Yasal oran otomatik uygulanıyor" },
  { id: "dd3", employeeId: "e9", kind: "Zimmet hasarı", amount: 2_400, remaining: 0, schedule: "Tek seferde · Ağu 2026", state: "Kapandı", aiNote: "Tamamlandı" },
  { id: "dd4", employeeId: "e3", kind: "Ücretsiz izin", amount: 2_150, remaining: 2_150, schedule: "Eyl 2026", state: "İtiraz", aiNote: "Puantaj politikayla uyuşmuyor; düzeltme önerildi" },
] as const;

export const SGK_PARAMS = [
  { key: "SGK_EMPLOYEE_RATE", label: "SGK işçi payı", value: "%14", from: "1 Oca 2026", to: "—", ref: "5510 md. 81", version: 7 },
  { key: "SGK_EMPLOYER_RATE", label: "SGK işveren payı", value: "%20,5", from: "1 Oca 2026", to: "—", ref: "5510 md. 81", version: 7 },
  { key: "SGK_EMPLOYER_INCENTIVE", label: "5 puan indirimi", value: "−%5", from: "1 Oca 2026", to: "—", ref: "5510 md. 81/ı", version: 4 },
  { key: "UNEMP_EMPLOYEE_RATE", label: "İşsizlik işçi", value: "%1", from: "1 Oca 2026", to: "—", ref: "4447 md. 49", version: 3 },
  { key: "UNEMP_EMPLOYER_RATE", label: "İşsizlik işveren", value: "%2", from: "1 Oca 2026", to: "—", ref: "4447 md. 49", version: 3 },
  { key: "SGK_CEILING", label: "Prime esas kazanç tavanı", value: "Parametre v2026-2", from: "1 Tem 2026", to: "—", ref: "Asgari ücret × 7,5", version: 12 },
  { key: "MIN_WAGE_GROSS", label: "Asgari ücret (brüt)", value: "Parametre v2026-2", from: "1 Tem 2026", to: "31 Ara 2026", ref: "Asgari Ücret Tespit Komisyonu", version: 12 },
] as const;

export const DECLARATIONS = [
  { id: "dc1", name: "MUHSGK · Ağustos 2026", kind: "Muhtasar ve Prim Hizmet Beyannamesi", due: "26 Eyl 2026", state: "Hazırlanıyor", employees: 120, aiNote: "4 çalışanda meslek kodu güncellemesi gerekiyor; gönderim öncesi doğrulama %97" },
  { id: "dc2", name: "E-Bildirge V2 · Ağustos 2026", kind: "Aylık prim ve hizmet", due: "26 Eyl 2026", state: "Hazırlanıyor", employees: 120, aiNote: "XML şeması v2026-04 ile üretilecek; adaptör sürümü güncel" },
  { id: "dc3", name: "İşe giriş bildirgesi · Barış Uçar", kind: "Sigortalı işe giriş", due: "14 Eyl 2026", state: "Bekliyor", employees: 1, aiNote: "Başlangıçtan 1 gün önce gönderilmeli; otomasyon planlı" },
  { id: "dc4", name: "İşten ayrılış bildirgesi · Deniz Koç", kind: "Sigortalı işten ayrılış", due: "6 Eki 2026", state: "Bekliyor", employees: 1, aiNote: "Son gün 26 Eylül; 10 gün içinde" },
  { id: "dc5", name: "MUHSGK · Temmuz 2026", kind: "Muhtasar ve Prim Hizmet Beyannamesi", due: "26 Ağu 2026", state: "Gönderildi", employees: 118, aiNote: "Tahakkuk alındı" },
] as const;

export const PAYMENTS = [
  { id: "py1", name: "Eylül 2026 maaş ödemesi", kind: "Banka dosyası · Ziraat", amount: 2_961_400, count: 87, state: "Bekliyor", date: "30 Eyl", aiNote: "Bordro kesinleşince üretilecek; 3 çalışanda IBAN eksik" },
  { id: "py2", name: "Eylül 2026 maaş ödemesi", kind: "Banka dosyası · Garanti", amount: 551_500, count: 33, state: "Bekliyor", date: "30 Eyl", aiNote: "Hazır" },
  { id: "py3", name: "Ağustos 2026 muhasebe fişi", kind: "Muhasebe entegrasyonu · Logo", amount: 4_701_200, count: 1, state: "Aktarıldı", date: "1 Eyl", aiNote: "Masraf merkezi dağılımı 7 hesaba" },
  { id: "py4", name: "Deniz Koç kıdem/ihbar", kind: "Off-cycle · Ayrılış", amount: 84_500, count: 1, state: "Hesaplandı", date: "26 Eyl", aiNote: "Yasal tavan kontrolü geçti" },
] as const;

export const PRE_PAYROLL_CHECKS = [
  { check: "IBAN eksik", count: 3, tone: "critical" as Tone, blocking: true, detail: "Selin Çelik, Umut Taş (yeni), Barış Uçar (yeni)" },
  { check: "Puantajı onaysız", count: 4, tone: "critical" as Tone, blocking: true, detail: "Ahmet Yıldız, Emre Doğan, Mert Kaya, Ayşe Aydın" },
  { check: "Maaş tanımı yok", count: 1, tone: "critical" as Tone, blocking: true, detail: "Barış Uçar · 15 Eyl başlangıç" },
  { check: "SGK meslek kodu eksik", count: 1, tone: "warning" as Tone, blocking: false, detail: "Umut Taş" },
  { check: "Anormal fazla mesai", count: 1, tone: "warning" as Tone, blocking: false, detail: "Emre Doğan · 62 saat" },
  { check: "Ücretsiz izin politika uyumsuzluğu", count: 1, tone: "warning" as Tone, blocking: false, detail: "Mert Kaya · 3 gün" },
  { check: "Ayrılış hesabı", count: 1, tone: "info" as Tone, blocking: false, detail: "Deniz Koç · kıdem + izin" },
] as const;

/* -------------------------------------------------------- yaşam döngüsü */

export const ONBOARDING = [
  { employeeId: "c8", name: "Barış Uçar", role: "Ürün Tasarımcısı", start: "15 Eyl 2026", progress: 45, hue: 0, tasks: [
    { task: "Gizlilik sözleşmesi e-imza", owner: "Çalışan", state: "Bekliyor" },
    { task: "SGK işe giriş bildirgesi", owner: "İK", state: "Planlandı · 14 Eyl" },
    { task: "Laptop ve hesaplar", owner: "IT", state: "Tamam" },
    { task: "Oryantasyon eğitimi ataması", owner: "Otomasyon", state: "Planlandı" },
    { task: "Buddy ataması", owner: "Yönetici", state: "Tamam" },
    { task: "İlk hafta planı", owner: "AI taslak", state: "Hazır" },
  ] },
  { employeeId: "c3", name: "Nazlı Erdem", role: "Satış Uzmanı", start: "1 Eki 2026", progress: 15, hue: 2, tasks: [
    { task: "Teklif kabulü", owner: "Aday", state: "Bekliyor" },
    { task: "Sözleşme taslağı", owner: "AI taslak", state: "Hazır" },
    { task: "Araç tahsisi", owner: "İdari işler", state: "Bekliyor" },
  ] },
] as const;

export const TRANSFERS = [
  { id: "tr1", employeeId: "e6", from: "Mühendislik · Veri · Uzaktan", to: "Ürün · Analitik · Uzaktan", effective: "1 Eki 2026", state: "Onay bekliyor", aiNote: "Ücret bandı Ürün'de %8 daha yüksek; transfer ayrılma riskini düşürebilir" },
  { id: "tr2", employeeId: "e5", from: "Destek · İzmir", to: "Destek · İstanbul Merkez", effective: "1 Kas 2026", state: "Taslak", aiNote: "SGK işyeri değişimi gerektirir; bildirge otomasyonu tetiklenecek" },
  { id: "tr3", employeeId: "e9", from: "Pazarlama · Ofis", to: "Pazarlama · Hibrit", effective: "1 Eyl 2026", state: "Tamamlandı", aiNote: "Uzaktan çalışma ek protokolü imzalandı" },
] as const;

export const PROMOTIONS = [
  { id: "pr1", employeeId: "e1", from: "Kıdemli Backend Geliştirici · G6", to: "Staff Mühendis · G7", effective: "1 Eki 2026", salary: "95.000 › 112.000 ₺", state: "Öneri", aiNote: "Performans + ayrılma riski birlikte: en yüksek etkili terfi adayı" },
  { id: "pr2", employeeId: "e7", from: "Frontend Geliştirici · G5", to: "Kıdemli Frontend Geliştirici · G6", effective: "1 Haz 2026", salary: "58.000 › 68.000 ₺", state: "Tamamlandı", aiNote: "Tasarım sistemi teslimi kanıt" },
  { id: "pr3", employeeId: "e4", from: "İK İş Ortağı · G6", to: "İK Müdürü · G7", effective: "1 Oca 2027", salary: "Bütçe döneminde", state: "Planlandı", aiNote: "Yedekleme planında 'hazır' " },
] as const;

export const OFFBOARDING = [
  { employeeId: "e8", name: "Deniz Koç", role: "Finans Uzmanı", lastDay: "26 Eyl 2026", reason: "İstifa · dış teklif", progress: 60, hue: 1, tasks: [
    { task: "Ayrılış formu imzası", owner: "Çalışan", state: "Bekliyor" },
    { task: "Çıkış mülakatı", owner: "İK", state: "Planlandı · 22 Eyl" },
    { task: "Kıdem / izin hesabı", owner: "Bordro", state: "Hesaplandı" },
    { task: "Zimmet iadesi", owner: "IT", state: "Bekliyor" },
    { task: "Erişim iptali (SCIM)", owner: "Otomasyon", state: "Planlandı · 26 Eyl 18:00" },
    { task: "SGK ayrılış bildirgesi", owner: "İK", state: "Planlandı · 6 Eki" },
  ] },
] as const;

/* ------------------------------------------------------------ HR vakaları */

export const HR_CASES = [
  { id: "hc1", employeeId: "e10", kind: "Şikayet", title: "Nöbet dağılımı adaletsizliği", opened: "1 Eyl", sla: "5 iş günü", state: "Açık", priority: "Yüksek", aiNote: "Puantaj verisi şikayeti doğruluyor: 14 gece / ekip ort. 5. Rotasyon kuralı önerisi hazır" },
  { id: "hc2", employeeId: "e3", kind: "Disiplin", title: "Tekrarlayan mazeret izni", opened: "3 Eyl", sla: "10 iş günü", state: "İnceleme", priority: "Orta", aiNote: "Deneme süresinde 3. olay; sözlü uyarı taslağı hazır, yazılı uyarı henüz önerilmiyor" },
  { id: "hc3", employeeId: "e1", kind: "Talep", title: "Ücret bandı değerlendirmesi", opened: "28 Ağu", sla: "15 iş günü", state: "Açık", priority: "Yüksek", aiNote: "Terfi önerisiyle birleştirilebilir" },
  { id: "hc4", employeeId: "e9", kind: "Yardım masası", title: "Bordroda yol ücreti eksik", opened: "2 Eyl", sla: "3 iş günü", state: "Çözüldü", priority: "Düşük", aiNote: "Ağustos düzeltmesi Eylül'e retro olarak eklendi" },
  { id: "hc5", employeeId: "e5", kind: "Olay", title: "İş kazası bildirimi (hafif)", opened: "20 Ağu", sla: "3 iş günü", state: "Kapandı", priority: "Yüksek", aiNote: "SGK bildirimi süresinde yapıldı; İSG raporu arşivde" },
] as const;

/* -------------------------------------------------------------- görevler */

export const TASKS = [
  { id: "t1", kind: "Onay", title: "İzin talebi · Burak Şahin · 14–18 Eyl", due: "Bugün", tone: "info" as Tone, page: "/izin-devam/", aiVerdict: "Onaya hazır" },
  { id: "t2", kind: "Onay", title: "Fazla mesai · Emre Doğan · 8 saat", due: "Bugün", tone: "warning" as Tone, page: "/fazla-mesai/", aiVerdict: "Dikkat: sınıra 2 saat" },
  { id: "t3", kind: "Onay", title: "Puantaj · 4 çalışan · Eylül", due: "25 Eyl", tone: "warning" as Tone, page: "/puantaj/", aiVerdict: "2'si düzeltme bekliyor" },
  { id: "t4", kind: "Hata", title: "Slack izin senkronu yetki hatası", due: "Gecikmiş", tone: "critical" as Tone, page: "/ayarlar/#entegrasyonlar", aiVerdict: "Yeniden bağlantı 1 dk" },
  { id: "t5", kind: "Talep", title: "Düzeltme talebi · Ayşe Aydın · eksik IN", due: "Yarın", tone: "info" as Tone, page: "/pdks/", aiVerdict: "Onaya hazır" },
  { id: "t6", kind: "Görev", title: "Mert Kaya ilk değerlendirme formu", due: "16 Eyl", tone: "warning" as Tone, page: "/ozluk/", aiVerdict: "Deneme süresi bitiyor" },
  { id: "t7", kind: "Onay", title: "Transfer · Selin Çelik › Ürün", due: "20 Eyl", tone: "info" as Tone, page: "/transferler/", aiVerdict: "Bütçe uyumlu" },
  { id: "t8", kind: "Uyarı", title: "İlk yardım sertifikası süresi doldu", due: "Gecikmiş", tone: "critical" as Tone, page: "/belgeler/", aiVerdict: "Kurs planla" },
  { id: "t9", kind: "Onay", title: "Değişken ödeme · Mert Kaya · 6.400 ₺", due: "24 Eyl", tone: "info" as Tone, page: "/degisken-odemeler/", aiVerdict: "Politika kademe 1" },
  { id: "t10", kind: "Görev", title: "MUHSGK Ağustos doğrulaması", due: "24 Eyl", tone: "warning" as Tone, page: "/beyannameler/", aiVerdict: "4 meslek kodu eksik" },
  { id: "t11", kind: "Bahsetme", title: "Zeynep Arslan seni HR vakası #hc1'de etiketledi", due: "Dün", tone: "neutral" as Tone, page: "/hr-vakalari/", aiVerdict: "Rotasyon önerisi hakkında görüş" },
] as const;

/* --------------------------------------------------------- entegrasyonlar */

export const INTEGRATIONS = [
  { id: "in1", name: "Slack", kind: "Bildirim + izin talebi", status: "Hatalı", last: "2 gün önce", aiNote: "Yetki belirteci geçersiz; yeniden bağlanınca 3 talep içe alınır" },
  { id: "in2", name: "Microsoft Entra ID", kind: "SSO (OIDC) + SCIM", status: "Bağlı", last: "5 dk önce", aiNote: "Son 24 saatte 2 kullanıcı oluşturuldu, 1 devre dışı" },
  { id: "in3", name: "Logo Tiger", kind: "Muhasebe fişi", status: "Bağlı", last: "1 Eyl", aiNote: "Ağustos aktarımı 7 masraf merkezine dağıtıldı" },
  { id: "in4", name: "Ziraat Bankası", kind: "Maaş ödeme dosyası", status: "Bağlı", last: "31 Ağu", aiNote: "Format v3; Eylül dosyası bekliyor" },
  { id: "in5", name: "SGK E-Bildirge V2", kind: "Beyanname adaptörü", status: "Bağlı", last: "26 Ağu", aiNote: "Adaptör v2026-04; şema güncel" },
  { id: "in6", name: "GİB MUHSGK", kind: "Beyanname adaptörü", status: "Bağlı", last: "26 Ağu", aiNote: "Kılavuz sürümü doğrulandı" },
  { id: "in7", name: "Google Calendar", kind: "İzin ve tatil senkronu", status: "Bağlı", last: "10 dk önce", aiNote: "Sağlıklı" },
  { id: "in8", name: "Kariyer.net", kind: "Aday içe aktarma", status: "Duraklatıldı", last: "12 Ağu", aiNote: "AI puanı düşük kaynak; bütçe LinkedIn'e kaydırıldı" },
] as const;

export const WEBHOOKS = [
  { event: "employee.hired", url: "https://erp.karaca.example/hooks/hr", last: "3 Eyl 09:12", status: "200" },
  { event: "leave.approved", url: "https://slack.example/hooks/T0…", last: "4 Eyl 10:31", status: "401" },
  { event: "payroll.finalized", url: "https://logo.karaca.example/hooks/payroll", last: "31 Ağu 18:04", status: "200" },
  { event: "employee.terminated", url: "https://entra.example/scim/…", last: "—", status: "—" },
] as const;

export const API_KEYS = [
  { name: "ERP senkron", scope: "employees:read, org:read", created: "12 Oca 2026", lastUsed: "4 Eyl 10:40", calls30d: 18_420 },
  { name: "BI raporlama", scope: "reports:read", created: "3 Mar 2026", lastUsed: "4 Eyl 06:00", calls30d: 1_240 },
  { name: "PDKS cihaz köprüsü", scope: "attendance:write", created: "20 May 2026", lastUsed: "4 Eyl 10:58", calls30d: 41_900 },
] as const;
