/**
 * Copilot motoru — çok turlu, sayfa bağlamlı, aksiyon üreten kural tabanlı
 * AI simülasyonu. Gerçek modelle değiştirilecek tek arayüz `replyTo`.
 * Her yanıt: metin, aksiyonlar (git/uygula/sor), takip soruları, güven ve
 * kaynaklar. Bilmediğinde düşük güvenle dürüst kalır.
 */
import { GEN } from "../data/generate";

export interface CopilotAction {
  label: string;
  kind: "navigate" | "apply" | "ask";
  href: string;
  /** apply için: gösterilecek sonuç mesajı. */
  result?: string;
}

export interface CopilotTurn {
  role: "user" | "ai";
  text: string;
  topic?: string;
}

export interface CopilotContext {
  pageId: string;
  history: CopilotTurn[];
}

export interface CopilotReply {
  text: string;
  topic: string;
  actions: CopilotAction[];
  followUps: string[];
  confidence: number;
  sources: string[];
  undoable?: boolean;
}

const fold = (s: string) => s.toLocaleLowerCase("tr").replace(/[ıi̇]/g, "i").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ö/g, "o").replace(/ü/g, "u");
const n = (v: number) => new Intl.NumberFormat("tr-TR").format(v);
const names = (ids: string[]) => ids.map((id) => GEN.employees.find((e) => e.id === id)?.name ?? id);

const STATS = () => {
  const highRisk = GEN.employees.filter((e) => e.attritionRisk >= 55 && e.status !== "Ayrılıyor");
  const onLeave = GEN.employees.filter((e) => e.status === "İzinli");
  const pendingLeaves = GEN.leaves.filter((l) => l.status === "Bekliyor");
  const readyLeaves = pendingLeaves.filter((l) => l.aiVerdict === "Onayla");
  const nearOt = GEN.timesheet.filter((t) => t.overtime >= 40);
  const pendTs = GEN.timesheet.filter((t) => t.state === "Onay bekliyor" || t.state === "Hesaplandı");
  const openExc = GEN.exceptions.filter((x) => x.state === "İstisna" || x.state === "İnceleme");
  const openPos = GEN.positions.filter((p) => p.status === "Boş");
  const docsSoon = GEN.docs.filter((d) => d.status === "Süresi doluyor" || d.status === "Süresi doldu");
  const openCases = GEN.cases.filter((c) => c.state === "Açık" || c.state === "İnceleme");
  const badAuto = GEN.automations.filter((a) => a.status !== "Aktif");
  const interviews = GEN.candidates.filter((c) => c.stage === "Mülakat");
  const probation = GEN.employees.filter((e) => e.status === "Deneme");
  return { highRisk, onLeave, pendingLeaves, readyLeaves, nearOt, pendTs, openExc, openPos, docsSoon, openCases, badAuto, interviews, probation };
};

interface Rule {
  topic: string;
  match: RegExp;
  reply: (ctx: CopilotContext) => Omit<CopilotReply, "topic">;
}

const RULES: Rule[] = [
  {
    topic: "izin",
    match: /izinli|izin talep|bekleyen izin|kac kisi izin|kim izinli/,
    reply: () => {
      const s = STATS();
      return {
        text: `Bugün ${s.onLeave.length} kişi izinli: ${names(s.onLeave.slice(0, 4).map((e) => e.id)).join(", ")}${s.onLeave.length > 4 ? "…" : ""}. ${s.pendingLeaves.length} talep bekliyor; ${s.readyLeaves.length} tanesi politika içinde ve çakışmasız, tek tıkla onaylanabilir.`,
        actions: [
          { label: `${s.readyLeaves.length} hazır talebi onayla`, kind: "apply", href: "/izin-devam/", result: `${s.readyLeaves.length} izin talebi onaylandı; ilgili çalışanlara ve yöneticilere bildirim gitti.` },
          { label: "İzin sayfasına git", kind: "navigate", href: "/izin-devam/" },
        ],
        followUps: ["Çakışan izinleri bul", "İzin bakiyesi en yüksek 5 kişi kim?", "Gelecek hafta kim izinli?"],
        confidence: 0.92,
        sources: ["İzin talepleri", "Çalışan durumu", "Ekip takvimi"],
        undoable: true,
      };
    },
  },
  {
    topic: "risk",
    match: /riskli|ayrilma risk|risk yuksek|risk skoru/,
    reply: () => {
      const s = STATS();
      const top = [...s.highRisk].sort((a, b) => b.attritionRisk - a.attritionRisk).slice(0, 3);
      return {
        text: `${s.highRisk.length} çalışan izleme eşiğinin (55) üstünde. En yüksek: ${top.map((e) => `${e.name} (${e.attritionRisk})`).join(", ")}. Ortak sinyaller ünvan durağanlığı ve fazla mesai artışı; ilk adım yöneticiyle 30 dakikalık kariyer görüşmesi.`,
        actions: [
          { label: "Riskli çalışanları listele", kind: "navigate", href: "/calisanlar/" },
          { label: `${top.length} kişi için görüşme planla`, kind: "apply", href: "/calisanlar/", result: `${top.map((e) => e.name).join(", ")} için yöneticilerine 1:1 daveti taslak olarak oluşturuldu.` },
        ],
        followUps: ["Onlara ne önerirsin?", "Ücret bandı dışında kim var?", "Terfi adaylarını öner"],
        confidence: 0.88,
        sources: ["Ayrılma risk modeli", "Puantaj", "Ücret bantları"],
        undoable: true,
      };
    },
  },
  {
    topic: "mesai",
    match: /fazla mesai|mesai sinir|sinira yaklas|nobet/,
    reply: () => {
      const s = STATS();
      const top = [...s.nearOt].sort((a, b) => b.overtime - a.overtime).slice(0, 3);
      return {
        text: `${s.nearOt.length} çalışan aylık 72 saat politika sınırının %55'inin üstünde. En yüksek: ${top.map((t) => `${names([t.employeeId])[0]} (${t.overtime} sa)`).join(", ")}. Toplam fazla mesai ${n(GEN.timesheet.reduce((a, t) => a + t.overtime, 0))} saat.`,
        actions: [
          { label: "Puantajı aç", kind: "navigate", href: "/puantaj/" },
          { label: "Vardiya devri öner", kind: "apply", href: "/vardiya/", result: "Sınıra yakın 3 çalışanın hafta sonu nöbetleri yedeklere devredilmek üzere taslaklandı; yönetici onayı bekliyor." },
        ],
        followUps: ["Onlara ne önerirsin?", "Gece vardiyası dağılımını dengele", "Bu ayın mesai maliyeti ne?"],
        confidence: 0.9,
        sources: ["Puantaj", "Vardiya planı", "Politika: aylık 72 sa"],
        undoable: true,
      };
    },
  },
  {
    topic: "puantaj",
    match: /puantaj|bordroya hazir/,
    reply: () => {
      const s = STATS();
      return {
        text: `Puantajda ${s.pendTs.length} satır onay bekliyor; ${GEN.timesheet.filter((t) => t.issues.length).length} satırda düzeltme notu var. Bunlar çözülmeden bordro Validate adımından geçemez. Sorunsuz satırlar toplu onaya uygundur.`,
        actions: [
          { label: "Sorunsuz satırları toplu onayla", kind: "apply", href: "/puantaj/", result: `${GEN.timesheet.filter((t) => t.state === "Hesaplandı" && !t.issues.length).length} sorunsuz puantaj satırı onaylandı.` },
          { label: "Puantaja git", kind: "navigate", href: "/puantaj/" },
        ],
        followUps: ["Fazla mesai sınırına yaklaşanlar kim?", "Eksik giriş/çıkışları listele", "Bordro anomalilerini göster"],
        confidence: 0.9,
        sources: ["Puantaj motoru", "PDKS istisnaları"],
        undoable: true,
      };
    },
  },
  {
    topic: "pdks",
    match: /eksik giris|eksik cikis|istisna|pdks|gelmeyen/,
    reply: () => {
      const s = STATS();
      return {
        text: `${s.openExc.length} açık PDKS istisnası var; ${s.openExc.filter((x) => x.kind === "Geç kalma").length} geç kalma, ${s.openExc.filter((x) => x.kind.startsWith("Eksik")).length} eksik hareket. AI düzeltme önerileri hazır; ham kayıtlar değişmez, düzeltmeler ayrı yazılır.`,
        actions: [
          { label: "Önerileri toplu uygula", kind: "apply", href: "/pdks/", result: `${s.openExc.filter((x) => x.aiSuggestion.includes("öner")).length} düzeltme önerisi uygulandı; ilgili yöneticilere bilgi gitti.` },
          { label: "PDKS'ye git", kind: "navigate", href: "/pdks/" },
        ],
        followUps: ["Cihaz durumunu göster", "Geç kalma örüntülerini analiz et", "Puantaj bordroya hazır mı?"],
        confidence: 0.87,
        sources: ["Ham PDKS hareketleri", "Attendance kuralları"],
        undoable: true,
      };
    },
  },
  {
    topic: "slack",
    match: /slack|entegrasyon|webhook|yeniden bagla/,
    reply: () => {
      const s = STATS();
      return {
        text: `${s.badAuto.filter((a) => a.status === "Hatalı").length} entegrasyon hatalı. Slack izin senkronu 2 gündür yetki hatası veriyor; yeniden yetkilendirme 1 dakika sürer ve bekleyen 3 talep otomatik içe alınır.`,
        actions: [
          { label: "Slack'i yeniden bağla", kind: "apply", href: "/entegrasyonlar/", result: "Slack yeniden yetkilendirildi; 3 bekleyen izin talebi içe alındı, senkron 15 dakikada bir çalışıyor." },
          { label: "Entegrasyonlara git", kind: "navigate", href: "/entegrasyonlar/" },
        ],
        followUps: ["Başarısız otomasyonları listele", "Webhook hatalarını göster", "API kullanımını özetle"],
        confidence: 0.93,
        sources: ["Entegrasyon günlükleri", "Webhook yanıtları"],
        undoable: true,
      };
    },
  },
  {
    topic: "belge",
    match: /belge|sertifika|sozlesme|suresi dol/,
    reply: () => {
      const s = STATS();
      return {
        text: `${s.docsSoon.filter((d) => d.status === "Süresi doldu").length} belgenin süresi doldu, ${s.docsSoon.filter((d) => d.status === "Süresi doluyor").length} belge 30 gün içinde doluyor. Sertifikalar İSG zorunluluğu için önceliklidir; hatırlatma otomasyonu ile sahiplerine e-posta gönderilebilir.`,
        actions: [
          { label: "Sahiplerine hatırlatma gönder", kind: "apply", href: "/belgeler/", result: `${s.docsSoon.length} belge sahibine yenileme hatırlatması gönderildi.` },
          { label: "Belgelere git", kind: "navigate", href: "/belgeler/" },
        ],
        followUps: ["Eksik belgesi olan çalışanları bul", "Kalıcı sözleşme taslağı hazırla", "Politika onaylamayanlar kim?"],
        confidence: 0.86,
        sources: ["Belge arşivi", "Süre takibi"],
        undoable: true,
      };
    },
  },
  {
    topic: "vaka",
    match: /vaka|sikayet|disiplin|uyari yaz/,
    reply: () => {
      const s = STATS();
      return {
        text: `${s.openCases.length} açık vaka; ${s.openCases.filter((c) => c.priority === "Yüksek").length} yüksek öncelikli. Disiplin vakalarında önce sözlü görüşme önerilir; yazılı uyarı taslağı hazır ama kanıt dosyası tamamlanmadan önerilmez.`,
        actions: [
          { label: "Açık vakaları öncelikle", kind: "navigate", href: "/hr-vakalari/" },
          { label: "Uyarı taslağını oluştur", kind: "apply", href: "/hr-vakalari/", result: "Sözlü uyarı görüşme taslağı ve kanıt listesi vaka dosyasına eklendi." },
        ],
        followUps: ["SLA'sı dolmak üzere olanlar?", "Vaka türlerine göre dağılım", "Nöbet şikayeti için kanıt topla"],
        confidence: 0.84,
        sources: ["HR vaka yönetimi", "Puantaj/PDKS kanıtları"],
        undoable: true,
      };
    },
  },
  {
    topic: "ise-alim",
    match: /aday|mulakat|ilan|ise alim/,
    reply: () => {
      const s = STATS();
      const top = [...s.interviews].sort((a, b) => b.score - a.score).slice(0, 2);
      return {
        text: `${s.interviews.length} aday mülakat aşamasında; en güçlüleri ${top.map((c) => `${c.name} (${c.score})`).join(" ve ")}. ${s.openPos.length} boş pozisyon var; en uzun süredir açık olan ilanlar yenilenmeli.`,
        actions: [
          { label: "Mülakatları planla", kind: "apply", href: "/ise-alim/", result: `${top.length} aday için mülakat daveti taslak olarak oluşturuldu; panelde 45 dk slot önerildi.` },
          { label: "İşe alıma git", kind: "navigate", href: "/ise-alim/" },
        ],
        followUps: ["En güçlü 5 adayı sırala", "Backend ilanı için metin yaz", "Kaynak başına puan ortalaması"],
        confidence: 0.85,
        sources: ["Aday hattı", "AI puanlama"],
        undoable: true,
      };
    },
  },
  {
    topic: "deneme",
    match: /deneme suresi|deneme/,
    reply: () => {
      const s = STATS();
      return {
        text: `${s.probation.length} çalışan deneme süresinde. Değerlendirme formu eksik olanlar için yöneticilere hatırlatma gönderilebilir; kalıcı sözleşme taslakları Belgeler'de hazır.`,
        actions: [{ label: "Yöneticilere hatırlat", kind: "apply", href: "/calisanlar/", result: `${s.probation.length} deneme süresi değerlendirmesi için yöneticilere hatırlatma gönderildi.` }, { label: "Deneme süresindekileri göster", kind: "navigate", href: "/calisanlar/" }],
        followUps: ["Kalıcı sözleşme taslağı hazırla", "Onboarding durumunu özetle", "Riskli çalışanları göster"],
        confidence: 0.86,
        sources: ["Özlük", "Sözleşmeler"],
        undoable: true,
      };
    },
  },
  {
    topic: "bordro",
    match: /bordro|maliyet|anomali|maas/,
    reply: () => ({
      text: "Eylül bordrosu Validate adımında; 3 engelleyici (IBAN eksik, onaysız puantaj, maaş tanımı yok) çözülmeden ileri gidemez. Anomaliler: fazla mesai sınırı, ücret bandı altı, ayrılış hesabı, ücretsiz izin uyumsuzluğu.",
      actions: [{ label: "Bordroya git", kind: "navigate", href: "/bordro/" }, { label: "IBAN eksik olanlara bildir", kind: "apply", href: "/odemeler/", result: "3 çalışana çalışan portalından IBAN doğrulama isteği gönderildi." }],
      followUps: ["Mesai sınırı 48 saat olsa ne olur?", "Departman maliyetini kır", "Puantaj bordroya hazır mı?"],
      confidence: 0.88,
      sources: ["Bordro motoru", "Doğrulama kuralları"],
      undoable: true,
    }),
  },
  {
    topic: "genel",
    match: /bugun|oncelik|dikkat|ozet|ne yapmali/,
    reply: () => {
      const s = STATS();
      return {
        text: `Bugün 3 öncelik: (1) ${s.highRisk.length} yüksek riskli çalışan, ilk görüşmeler bu hafta. (2) ${s.badAuto.filter((a) => a.status === "Hatalı").length} hatalı entegrasyon; Slack 1 dakikada düzelir. (3) Puantajda ${s.pendTs.length} satır onay bekliyor; bordro 25 Eylül'e kadar hazır olmalı.`,
        actions: [{ label: "Görevlerime git", kind: "navigate", href: "/gorevler/" }, { label: "Hazır onayları uygula", kind: "apply", href: "/gorevler/", result: "4 hazır onay uygulandı: 3 izin, 1 değişken ödeme." }],
        followUps: ["Riskli çalışanlar kim?", "Slack bağlantısını yenile", "Puantaj bordroya hazır mı?"],
        confidence: 0.9,
        sources: ["Görev kutusu", "Risk modeli", "Entegrasyon günlükleri"],
        undoable: true,
      };
    },
  },
];

const FOLLOW_ADVICE: Record<string, string> = {
  risk: "Önerim: her biri için yöneticisiyle 30 dakikalık kariyer görüşmesi, ücret bandı kontrolü ve nöbet yükünün 1 ay boyunca düşürülmesi. Terfi adayı olanlar için Yaşam Döngüsü'nde öneri hazır.",
  mesai: "Önerim: hafta sonu nöbetlerini yedeklere devretmek, ardışık gece kuralını sıkılaştırmak ve 1 gün telafi izni tanımlamak. Bu üçü toplamı 72 saat sınırının altına çeker.",
  izin: "Önerim: hazır olanları toplu onaylamak, çakışanlar için tarih alternatifi önermek; 15+ gün bakiyesi olanlara Kasım'da hatırlatma göndermek.",
  pdks: "Önerim: AI önerili düzeltmeleri toplu uygulamak, cihaz senkronunu yenilemek ve tolerans kuralını 15 dakikada tutmak.",
  puantaj: "Önerim: sorunsuz satırları toplu onaylamak, mesai sınırındakileri vardiya devriyle çözmek, sonra kilitlemek.",
  belge: "Önerim: sertifika yenileme kurslarını planlamak ve imza bekleyenlere 48 saatte bir hatırlatma göndermek.",
  vaka: "Önerim: yüksek öncelikli vakalarda görüşmeyi 48 saat içinde planlamak; kanıtları puantaj ve PDKS'den otomatik toplamak.",
  "ise-alim": "Önerim: puanı 80 üstü adayları 48 saat içinde mülakata almak ve teklif aşamasını 5 güne indirmek.",
};

export function replyTo(message: string, ctx: CopilotContext): CopilotReply {
  const m = fold(message);
  const lastTopic = [...ctx.history].reverse().find((t) => t.role === "ai" && t.topic)?.topic;
  const referential = /\b(onlar|onlara|bunlar|bunlara|o kisiler|bu kisiler|peki|ne onerirsin|ne yapmaliyim)\b/.test(m);
  if (referential && lastTopic && FOLLOW_ADVICE[lastTopic]) {
    return {
      text: FOLLOW_ADVICE[lastTopic],
      topic: lastTopic,
      actions: [{ label: "Öneriyi uygula", kind: "apply", href: "/", result: "Öneri, ilgili yöneticilere görev olarak atandı." }],
      followUps: ["Bunu görev olarak ata", "Rapora ekle", "Başka ne var?"],
      confidence: 0.82,
      sources: ["Önceki yanıt", "Politika kuralları"],
      undoable: true,
    };
  }
  for (const rule of RULES) {
    if (rule.match.test(m)) {
      const r = rule.reply(ctx);
      return { ...r, topic: rule.topic };
    }
  }
  return {
    text: "Bu soru İK verilerinin kapsamı dışında görünüyor; yardımcı olamam. Çalışanlar, izin, puantaj, bordro, işe alım, belgeler, vakalar ve entegrasyonlar hakkında sorabilirsiniz.",
    topic: "bilinmiyor",
    actions: [{ label: "Bugünün özetini iste", kind: "ask", href: "" }],
    followUps: ["Bugün dikkat etmem gereken 3 şey ne?", "Riskli çalışanlar kim?", "Puantaj bordroya hazır mı?"],
    confidence: 0.2,
    sources: [],
  };
}
