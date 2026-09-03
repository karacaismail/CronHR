/**
 * CronHR sahte veri katmanı. Yalnızca frontend; her sayfa buradan okur.
 * Gerçek ürün bunu bir API/BFF ile değiştirir; şekiller kararlıdır.
 */

export type Tone = "good" | "warning" | "serious" | "critical" | "info" | "neutral";

export interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  location: "İstanbul" | "Ankara" | "İzmir" | "Uzaktan";
  startDate: string;
  status: "Aktif" | "Deneme" | "İzinli" | "Ayrılıyor";
  attritionRisk: number; // 0-100
  riskReason: string;
  engagement: number; // 0-100
  hue: number;
}

export const EMPLOYEES: readonly Employee[] = [
  { id: "e1", name: "Ahmet Yıldız", title: "Kıdemli Backend Geliştirici", department: "Mühendislik", location: "İstanbul", startDate: "2021-03-15", status: "Aktif", attritionRisk: 78, riskReason: "18 aydır ünvan değişimi yok, son 2 ayda fazla mesai %40 arttı", engagement: 52, hue: 0 },
  { id: "e2", name: "Elif Demir", title: "Ürün Yöneticisi", department: "Ürün", location: "Uzaktan", startDate: "2022-08-01", status: "Aktif", attritionRisk: 22, riskReason: "Katılım yüksek, hedefler zamanında", engagement: 86, hue: 1 },
  { id: "e3", name: "Mert Kaya", title: "Satış Uzmanı", department: "Satış", location: "Ankara", startDate: "2024-11-04", status: "Deneme", attritionRisk: 41, riskReason: "Deneme süresi 12 gün içinde bitiyor, ilk değerlendirme eksik", engagement: 70, hue: 2 },
  { id: "e4", name: "Zeynep Arslan", title: "İK İş Ortağı", department: "İnsan Kaynakları", location: "İstanbul", startDate: "2019-06-10", status: "Aktif", attritionRisk: 12, riskReason: "Stabil, mentorluk programında aktif", engagement: 91, hue: 3 },
  { id: "e5", name: "Can Öztürk", title: "Müşteri Destek Lideri", department: "Destek", location: "İzmir", startDate: "2020-01-20", status: "İzinli", attritionRisk: 35, riskReason: "Yıllık izinde; dönüşte iş yükü dengelenmeli", engagement: 74, hue: 4 },
  { id: "e6", name: "Selin Çelik", title: "Veri Analisti", department: "Mühendislik", location: "Uzaktan", startDate: "2023-02-13", status: "Aktif", attritionRisk: 64, riskReason: "Piyasa ücret bandının %14 altında, 3 dış teklif sinyali", engagement: 58, hue: 5 },
  { id: "e7", name: "Burak Şahin", title: "Frontend Geliştirici", department: "Mühendislik", location: "İstanbul", startDate: "2022-05-02", status: "Aktif", attritionRisk: 18, riskReason: "Yeni terfi aldı, katılım artıyor", engagement: 88, hue: 0 },
  { id: "e8", name: "Deniz Koç", title: "Finans Uzmanı", department: "Finans", location: "Ankara", startDate: "2018-09-03", status: "Ayrılıyor", attritionRisk: 100, riskReason: "İstifa bildirimi alındı, son gün 26 Eylül", engagement: 30, hue: 1 },
  { id: "e9", name: "Ayşe Aydın", title: "Pazarlama Uzmanı", department: "Pazarlama", location: "İstanbul", startDate: "2023-10-16", status: "Aktif", attritionRisk: 27, riskReason: "Eğitim tamamlama oranı düşük, aksi halde stabil", engagement: 77, hue: 2 },
  { id: "e10", name: "Emre Doğan", title: "DevOps Mühendisi", department: "Mühendislik", location: "Uzaktan", startDate: "2021-11-22", status: "Aktif", attritionRisk: 49, riskReason: "Nöbet yükü ekip ortalamasının 2 katı", engagement: 63, hue: 3 },
];

export const DEPARTMENTS = [
  { name: "Mühendislik", headcount: 42, open: 3, budgetUse: 0.71 },
  { name: "Satış", headcount: 27, open: 2, budgetUse: 0.64 },
  { name: "Destek", headcount: 19, open: 1, budgetUse: 0.58 },
  { name: "Ürün", headcount: 11, open: 1, budgetUse: 0.82 },
  { name: "Pazarlama", headcount: 9, open: 0, budgetUse: 0.9 },
  { name: "Finans", headcount: 7, open: 0, budgetUse: 0.44 },
  { name: "İnsan Kaynakları", headcount: 5, open: 0, budgetUse: 0.6 },
] as const;

export const HEADCOUNT_TREND = [98, 101, 104, 106, 109, 111, 114, 116, 118, 119, 120, 120];
export const MONTHS = ["Eki", "Kas", "Ara", "Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl"];
export const ABSENCE_TREND = [3.1, 2.8, 4.2, 5.6, 4.9, 3.4, 3.0, 2.6, 4.4, 5.1, 3.7, 3.2];
export const ATTRITION_TREND = [1.2, 0.8, 1.9, 1.1, 0.7, 1.4, 0.9, 1.0, 1.6, 2.1, 1.3, 0.9];

export interface Candidate {
  id: string;
  name: string;
  role: string;
  stage: "Başvuru" | "Ön Eleme" | "Mülakat" | "Teklif" | "İşe Alındı";
  score: number;
  aiNote: string;
  source: string;
  days: number;
  hue: number;
}

export const CANDIDATES: readonly Candidate[] = [
  { id: "c1", name: "Gizem Ak", role: "Backend Geliştirici", stage: "Mülakat", score: 91, aiNote: "Go + Kubernetes deneyimi ilanla %94 örtüşüyor; 2. tur teknik mülakat önerilir", source: "LinkedIn", days: 6, hue: 4 },
  { id: "c2", name: "Kerem Bulut", role: "Backend Geliştirici", stage: "Ön Eleme", score: 74, aiNote: "CV güçlü ama son 2 işte 8 aydan kısa kalmış; motivasyon sorusu ekle", source: "Kariyer.net", days: 3, hue: 0 },
  { id: "c3", name: "Nazlı Erdem", role: "Satış Uzmanı", stage: "Teklif", score: 88, aiNote: "Teklif piyasa medyanının %6 üstünde; kabul olasılığı yüksek", source: "Referans", days: 14, hue: 2 },
  { id: "c4", name: "Umut Taş", role: "Frontend Geliştirici", stage: "Başvuru", score: 62, aiNote: "Portföy React ağırlıklı, tasarım sistemi deneyimi belirsiz", source: "Web sitesi", days: 1, hue: 1 },
  { id: "c5", name: "Sena Yalçın", role: "Ürün Tasarımcısı", stage: "Mülakat", score: 84, aiNote: "Vaka çalışması güçlü; ekip uyumu görüşmesi planla", source: "LinkedIn", days: 9, hue: 3 },
  { id: "c6", name: "Onur Kılıç", role: "Satış Uzmanı", stage: "Başvuru", score: 47, aiNote: "B2B deneyimi yok; ilan gereksinimiyle düşük örtüşme", source: "Kariyer.net", days: 2, hue: 5 },
  { id: "c7", name: "Melis Güneş", role: "Backend Geliştirici", stage: "Ön Eleme", score: 79, aiNote: "Açık kaynak katkıları doğrulandı; teknik test gönder", source: "GitHub", days: 4, hue: 1 },
  { id: "c8", name: "Barış Uçar", role: "Ürün Tasarımcısı", stage: "İşe Alındı", score: 93, aiNote: "Başlangıç 15 Eylül; oryantasyon planı otomasyonla oluşturuldu", source: "Referans", days: 22, hue: 0 },
];

export const OPEN_ROLES = [
  { title: "Backend Geliştirici", dept: "Mühendislik", applicants: 38, stageOpen: 21, days: 21, target: "Ekim" },
  { title: "Satış Uzmanı", dept: "Satış", applicants: 52, stageOpen: 14, days: 34, target: "Eylül" },
  { title: "Frontend Geliştirici", dept: "Mühendislik", applicants: 27, stageOpen: 9, days: 12, target: "Ekim" },
  { title: "Ürün Tasarımcısı", dept: "Ürün", applicants: 19, stageOpen: 0, days: 41, target: "Kapatıldı" },
];

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: "Yıllık İzin" | "Hastalık" | "Mazeret" | "Uzaktan Çalışma" | "Doğum";
  from: string;
  to: string;
  days: number;
  status: "Bekliyor" | "Onaylandı" | "Reddedildi";
  aiVerdict: "Onayla" | "Dikkat" | "Reddet";
  aiReason: string;
}

export const LEAVE_REQUESTS: readonly LeaveRequest[] = [
  { id: "l1", employeeId: "e7", type: "Yıllık İzin", from: "2026-09-14", to: "2026-09-18", days: 5, status: "Bekliyor", aiVerdict: "Onayla", aiReason: "Ekipte aynı tarihte başka izin yok, sprint kapanışı 11 Eylül'de" },
  { id: "l2", employeeId: "e1", type: "Yıllık İzin", from: "2026-09-15", to: "2026-09-19", days: 5, status: "Bekliyor", aiVerdict: "Dikkat", aiReason: "Burak Şahın'la aynı hafta; ödeme servisinde tek yedek kalıyor" },
  { id: "l3", employeeId: "e9", type: "Uzaktan Çalışma", from: "2026-09-08", to: "2026-09-08", days: 1, status: "Bekliyor", aiVerdict: "Onayla", aiReason: "Politika içinde, aylık uzaktan hakkı 6/8" },
  { id: "l4", employeeId: "e3", type: "Mazeret", from: "2026-09-05", to: "2026-09-05", days: 1, status: "Bekliyor", aiVerdict: "Dikkat", aiReason: "Deneme süresinde 3. mazeret izni; yöneticiyle konuşulmalı" },
  { id: "l5", employeeId: "e10", type: "Hastalık", from: "2026-09-02", to: "2026-09-03", days: 2, status: "Bekliyor", aiVerdict: "Onayla", aiReason: "Rapor yüklendi, otomatik doğrulandı" },
  { id: "l6", employeeId: "e2", type: "Yıllık İzin", from: "2026-08-24", to: "2026-08-28", days: 5, status: "Onaylandı", aiVerdict: "Onayla", aiReason: "Tamamlandı" },
  { id: "l7", employeeId: "e5", type: "Yıllık İzin", from: "2026-09-01", to: "2026-09-12", days: 10, status: "Onaylandı", aiVerdict: "Onayla", aiReason: "Tamamlandı" },
];

export const LEAVE_BALANCES = [
  { employeeId: "e4", used: 6, total: 20 },
  { employeeId: "e1", used: 4, total: 18 },
  { employeeId: "e10", used: 5, total: 16 },
  { employeeId: "e6", used: 9, total: 14 },
  { employeeId: "e2", used: 11, total: 16 },
];

export type ShiftKind = "morning" | "day" | "night" | "off" | "leave" | "conflict" | "ai";
export interface ShiftRow {
  employeeId: string;
  cells: readonly { kind: ShiftKind; label: string }[];
}

export const WEEK_DAYS = ["Pzt 7", "Sal 8", "Çar 9", "Per 10", "Cum 11", "Cmt 12", "Paz 13"];

const M = { kind: "morning", label: "08–16" } as const;
const D = { kind: "day", label: "10–18" } as const;
const N = { kind: "night", label: "22–06" } as const;
const O = { kind: "off", label: "İzin günü" } as const;
const L = { kind: "leave", label: "Yıllık izin" } as const;
const C = { kind: "conflict", label: "Çakışma" } as const;
const A = { kind: "ai", label: "AI önerisi" } as const;

export const SHIFT_ROWS: readonly ShiftRow[] = [
  { employeeId: "e5", cells: [L, L, L, L, L, O, O] },
  { employeeId: "e10", cells: [N, N, O, O, N, N, C] },
  { employeeId: "e7", cells: [D, D, D, D, D, O, O] },
  { employeeId: "e3", cells: [M, M, M, A, M, O, O] },
  { employeeId: "e9", cells: [D, D, O, D, D, A, O] },
  { employeeId: "e1", cells: [D, D, D, D, D, O, O] },
];

export const PAYROLL = {
  period: "Eylül 2026",
  status: "Taslak" as const,
  gross: 4_862_400,
  net: 3_512_900,
  employer: 1_143_700,
  overtime: 214_300,
  prevGross: 4_701_200,
  employees: 120,
  anomalies: [
    { employeeId: "e10", kind: "Fazla mesai", detail: "Ay içinde 62 saat fazla mesai; yasal aylık sınıra 28 saat kaldı", tone: "critical" as Tone, amount: 18_600 },
    { employeeId: "e6", kind: "Ücret bandı", detail: "Piyasa medyanının %14 altında; ayrılma riski ile ilişkili", tone: "warning" as Tone, amount: -6_200 },
    { employeeId: "e8", kind: "Ayrılış", detail: "Son gün 26 Eylül; kıdem ve izin ücreti hesaplanmalı", tone: "info" as Tone, amount: 84_500 },
    { employeeId: "e3", kind: "Eksik gün", detail: "3 mazeret izni ücretsiz olarak işlenmiş, politika ile uyuşmuyor", tone: "serious" as Tone, amount: 2_150 },
  ],
  costTrend: [4.31, 4.38, 4.42, 4.49, 4.55, 4.58, 4.61, 4.66, 4.7, 4.72, 4.79, 4.86],
  byDept: [
    { name: "Mühendislik", value: 2.04 },
    { name: "Satış", value: 1.02 },
    { name: "Destek", value: 0.58 },
    { name: "Ürün", value: 0.49 },
    { name: "Pazarlama", value: 0.34 },
    { name: "Finans", value: 0.24 },
    { name: "İK", value: 0.15 },
  ],
};

export interface Goal {
  id: string;
  title: string;
  owner: string;
  team: string;
  progress: number;
  status: "Yolunda" | "Riskli" | "Geride" | "Tamamlandı";
  aiNote: string;
}

export const GOALS: readonly Goal[] = [
  { id: "g1", title: "Ödeme servisi gecikmesini %30 düşür", owner: "e1", team: "Mühendislik", progress: 62, status: "Yolunda", aiNote: "Son 4 haftada istikrarlı ilerleme; çeyrek sonunda %90 tahmin ediliyor" },
  { id: "g2", title: "Yeni müşteri kazanımı 40 hesap", owner: "e3", team: "Satış", progress: 35, status: "Geride", aiNote: "Hedefin 2 hafta gerisinde; deneme süresi etkisi olabilir, koçluk öner" },
  { id: "g3", title: "Destek ilk yanıt süresi < 2 saat", owner: "e5", team: "Destek", progress: 88, status: "Yolunda", aiNote: "İzin döneminde metrik korunmuş; ekip sürdürülebilir" },
  { id: "g4", title: "Mobil onboarding tamamlanma %70", owner: "e2", team: "Ürün", progress: 54, status: "Riskli", aiNote: "Deney sonuçları 12 Eylül'de; karar noktası yaklaşıyor" },
  { id: "g5", title: "Dashboard tasarım sistemi v2", owner: "e7", team: "Mühendislik", progress: 100, status: "Tamamlandı", aiNote: "3 hafta erken tamamlandı; terfi dosyasına kanıt olarak eklendi" },
  { id: "g6", title: "Aylık organik trafik +25%", owner: "e9", team: "Pazarlama", progress: 41, status: "Riskli", aiNote: "Büyüme yavaşladı; içerik takvimi 2 hafta boş" },
];

export const PERFORMANCE_DISTRIBUTION = [
  { label: "Beklentinin üstünde", value: 18 },
  { label: "Beklentiyi karşılıyor", value: 71 },
  { label: "Gelişmeli", value: 24 },
  { label: "Değerlendirilmedi", value: 7 },
];

export interface Course {
  id: string;
  title: string;
  kind: "Zorunlu" | "Teknik" | "Liderlik" | "Uyum";
  enrolled: number;
  completion: number;
  due?: string;
  aiNote: string;
}

export const COURSES: readonly Course[] = [
  { id: "k1", title: "KVKK ve Veri Güvenliği 2026", kind: "Zorunlu", enrolled: 120, completion: 83, due: "30 Eyl", aiNote: "20 kişi tamamlamadı; 12'si Satış ekibinde. Hatırlatma otomasyonu önerilir" },
  { id: "k2", title: "İş Sağlığı ve Güvenliği Yenileme", kind: "Zorunlu", enrolled: 120, completion: 96, due: "15 Eki", aiNote: "Yolunda; 5 kişi kaldı" },
  { id: "k3", title: "Kubernetes Operasyonları", kind: "Teknik", enrolled: 14, completion: 57, aiNote: "Backend ekibi için nöbet yükünü azaltacak; Emre Doğan öncelikli" },
  { id: "k4", title: "Geri Bildirim Verme (Yöneticiler)", kind: "Liderlik", enrolled: 18, completion: 39, aiNote: "Performans dönemi öncesi tamamlanması değerlendirme kalitesini artırır" },
  { id: "k5", title: "Danışmanlı Satış Teknikleri", kind: "Teknik", enrolled: 27, completion: 72, aiNote: "Tamamlayanların dönüşüm oranı %11 daha yüksek" },
  { id: "k6", title: "Yeni Çalışan Oryantasyonu", kind: "Uyum", enrolled: 6, completion: 50, aiNote: "Barış Uçar için 15 Eylül'de otomatik atanacak" },
];

export interface Doc {
  id: string;
  title: string;
  kind: "Sözleşme" | "Politika" | "Sertifika" | "Form" | "Bordro";
  owner?: string;
  updated: string;
  expires?: string;
  status: "Geçerli" | "Süresi doluyor" | "Süresi doldu" | "İmza bekliyor";
  aiNote: string;
}

export const DOCS: readonly Doc[] = [
  { id: "d1", title: "İş Sözleşmesi — Mert Kaya", kind: "Sözleşme", owner: "e3", updated: "4 Kas 2025", expires: "16 Eyl 2026", status: "Süresi doluyor", aiNote: "Deneme süresi maddesi 16 Eylül'de bitiyor; kalıcı sözleşme taslağı hazır" },
  { id: "d2", title: "Uzaktan Çalışma Politikası v3", kind: "Politika", updated: "12 Ağu 2026", status: "Geçerli", aiNote: "Son revizyon 14 çalışan tarafından henüz onaylanmadı" },
  { id: "d3", title: "AWS Solutions Architect — Emre Doğan", kind: "Sertifika", owner: "e10", updated: "2 Eki 2023", expires: "2 Eki 2026", status: "Süresi doluyor", aiNote: "Yenileme sınavı için 28 gün; bütçe onayı gerekli" },
  { id: "d4", title: "Gizlilik Sözleşmesi — Barış Uçar", kind: "Sözleşme", updated: "1 Eyl 2026", status: "İmza bekliyor", aiNote: "Başlangıçtan önce imzalanmalı; e-imza linki 3 gün önce gönderildi" },
  { id: "d5", title: "Ağustos 2026 Bordro Özeti", kind: "Bordro", updated: "31 Ağu 2026", status: "Geçerli", aiNote: "Arşivlendi; 120 çalışana dağıtıldı" },
  { id: "d6", title: "İlk Yardım Sertifikası — Zeynep Arslan", kind: "Sertifika", owner: "e4", updated: "20 Ağu 2024", expires: "20 Ağu 2026", status: "Süresi doldu", aiNote: "İSG için bina başına 1 sertifikalı kişi zorunlu; yenileme kursu planla" },
  { id: "d7", title: "Ayrılış Formu — Deniz Koç", kind: "Form", owner: "e8", updated: "3 Eyl 2026", status: "İmza bekliyor", aiNote: "Çıkış mülakatı soruları AI tarafından hazırlandı" },
];

export interface Automation {
  id: string;
  name: string;
  schedule: string;
  cron: string;
  kind: "Rapor" | "Hatırlatma" | "Onay akışı" | "AI kuralı" | "Entegrasyon";
  lastRun: string;
  nextRun: string;
  status: "Aktif" | "Duraklatıldı" | "Hatalı";
  runs: number;
  aiNote: string;
}

export const AUTOMATIONS: readonly Automation[] = [
  { id: "a1", name: "Haftalık devamsızlık raporu", schedule: "Her pazartesi 09:00", cron: "0 9 * * 1", kind: "Rapor", lastRun: "1 Eyl 09:00", nextRun: "8 Eyl 09:00", status: "Aktif", runs: 34, aiNote: "Rapor AI özetiyle gönderiliyor; açılma oranı %92" },
  { id: "a2", name: "Deneme süresi uyarısı (7 gün kala)", schedule: "Her gün 08:30", cron: "30 8 * * *", kind: "Hatırlatma", lastRun: "4 Eyl 08:30", nextRun: "5 Eyl 08:30", status: "Aktif", runs: 212, aiNote: "Bugün Mert Kaya için tetiklendi" },
  { id: "a3", name: "Ayrılma riski > 70 → İK'ya bildir", schedule: "Sürekli (olay tabanlı)", cron: "olay", kind: "AI kuralı", lastRun: "3 Eyl 14:12", nextRun: "Olay geldiğinde", status: "Aktif", runs: 9, aiNote: "Son 30 günde 3 kez tetiklendi; 2'si görüşmeyle sonuçlandı" },
  { id: "a4", name: "Bordro taslağını finansla paylaş", schedule: "Ayın 25'i 17:00", cron: "0 17 25 * *", kind: "Onay akışı", lastRun: "25 Ağu 17:00", nextRun: "25 Eyl 17:00", status: "Aktif", runs: 11, aiNote: "Anomali listesi paylaşım öncesi otomatik ekleniyor" },
  { id: "a5", name: "Doğum günü kutlama mesajı", schedule: "Her gün 09:15", cron: "15 9 * * *", kind: "Hatırlatma", lastRun: "4 Eyl 09:15", nextRun: "5 Eyl 09:15", status: "Aktif", runs: 248, aiNote: "Mesajlar kişiye göre AI ile yazılıyor" },
  { id: "a6", name: "Slack → izin talebi senkronu", schedule: "Her 15 dakikada", cron: "*/15 * * * *", kind: "Entegrasyon", lastRun: "4 Eyl 10:45", nextRun: "4 Eyl 11:00", status: "Hatalı", runs: 4_120, aiNote: "Yetki belirteci 2 gündür geçersiz; yeniden bağlantı gerekli" },
  { id: "a7", name: "Zorunlu eğitim hatırlatması", schedule: "Her çarşamba 10:00", cron: "0 10 * * 3", kind: "Hatırlatma", lastRun: "2 Eyl 10:00", nextRun: "9 Eyl 10:00", status: "Duraklatıldı", runs: 18, aiNote: "KVKK son tarihi yaklaşıyor; yeniden başlatılması önerilir" },
];

export interface Notification {
  id: string;
  title: string;
  body: string;
  time: string;
  tone: Tone | "ai";
  priority: "Yüksek" | "Orta" | "Düşük";
  page: string;
}

export const NOTIFICATIONS: readonly Notification[] = [
  { id: "n1", title: "Ayrılma riski yükseldi: Ahmet Yıldız", body: "Risk skoru 61'den 78'e çıktı. Fazla mesai ve ünvan durağanlığı ana etkenler.", time: "14 dk önce", tone: "critical", priority: "Yüksek", page: "calisanlar" },
  { id: "n2", title: "Slack entegrasyonu hatalı", body: "İzin talebi senkronu 2 gündür başarısız. 3 talep manuel girilmiş olabilir.", time: "1 sa önce", tone: "warning", priority: "Yüksek", page: "otomasyonlar" },
  { id: "n3", title: "5 izin talebi onay bekliyor", body: "AI 3'ünü onaya hazır, 2'sini dikkat gerektirir olarak işaretledi.", time: "2 sa önce", tone: "info", priority: "Orta", page: "izin-devam" },
  { id: "n4", title: "Bordro taslağında 4 anomali", body: "Toplam etki 99.050 ₺. En kritik: Emre Doğan fazla mesai sınırı.", time: "Bugün 08:10", tone: "serious", priority: "Orta", page: "bordro" },
  { id: "n5", title: "Gizem Ak için 2. tur önerildi", body: "AI puanı 91. Teknik mülakat için Ahmet Yıldız uygun görünüyor.", time: "Dün", tone: "ai", priority: "Düşük", page: "ise-alim" },
  { id: "n6", title: "KVKK eğitimi: 20 kişi tamamlamadı", body: "Son tarih 30 Eylül. Hatırlatma otomasyonu duraklatılmış durumda.", time: "Dün", tone: "warning", priority: "Orta", page: "egitim" },
];

export function employee(id: string): Employee {
  return EMPLOYEES.find((e) => e.id === id) ?? EMPLOYEES[0];
}

export function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function riskTone(risk: number): Tone {
  if (risk >= 75) return "critical";
  if (risk >= 55) return "serious";
  if (risk >= 35) return "warning";
  return "good";
}

export function riskLabel(risk: number): string {
  if (risk >= 75) return "Yüksek";
  if (risk >= 55) return "Artıyor";
  if (risk >= 35) return "İzle";
  return "Düşük";
}

export function tl(value: number): string {
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 0 }).format(value) + " ₺";
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  return `${d} ${months[m - 1]} ${y}`;
}
