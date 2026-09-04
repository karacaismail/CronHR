import type { ReactNode } from "react";
import {
  BarChart,
  FunnelChart,
  KpiRow,
  LineChart,
  SERIES,
  StatusBadge,
} from "../components/AiCommandCard/AiCommandCard.reports";
import styles from "../components/AiCommandCard/AiCommandCard.reports.module.css";
import type { AiCommandQueryRequest } from "../components/AiCommandCard";
import { GEN } from "../data/generate";
import {
  ABSENCE_TREND,
  ATTRITION_TREND,
  CANDIDATES,
  DEPARTMENTS,
  EMPLOYEES,
  HEADCOUNT_TREND,
  LEAVE_REQUESTS,
  MONTHS,
  PAYROLL,
  employee,
  riskLabel,
} from "../data/hr";

/**
 * CronHR zengin AI yanıtları. Komuta kartının yanıt alanında render edilir;
 * grafikler kaynak repodaki SVG bileşenleridir. Backend yoktur: sorgu
 * metnine göre hazır rapor seçilir, aksi halde bağlamlı metin üretilir.
 */

function Report({ title, lead, children, footnote }: { title: string; lead: string; children?: ReactNode; footnote?: string }) {
  return (
    <div className={styles.report}>
      <h3 className={styles.reportTitle}>{title}</h3>
      <p className={styles.reportLead}>{lead}</p>
      {children}
      {footnote ? <p className={styles.reportFootnote}>{footnote}</p> : null}
    </div>
  );
}

function AttritionRiskReport() {
  const risky = [...EMPLOYEES].filter((e) => e.attritionRisk >= 55 && e.status !== "Ayrılıyor").sort((a, b) => b.attritionRisk - a.attritionRisk);
  return (
    <Report
      title="Ayrılma riski yüksek çalışanlar"
      lead={`${risky.length} çalışan izleme eşiğinin üstünde. Öncelik: ünvan durağanlığı ve fazla mesai birleşen kişiler.`}
      footnote="Skorlar; ünvan süresi, mesai eğilimi, katılım anketi ve ücret bandı sinyallerinden türetilir."
    >
      <KpiRow
        tiles={[
          { label: "Yüksek risk", value: String(risky.filter((e) => e.attritionRisk >= 75).length), delta: { text: "+1 bu ay", direction: "up" } },
          { label: "Artan risk", value: String(risky.filter((e) => e.attritionRisk < 75).length) },
          { label: "Ortalama skor", value: String(Math.round(EMPLOYEES.reduce((s, e) => s + e.attritionRisk, 0) / EMPLOYEES.length)) },
        ]}
      />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Çalışan</th>
              <th>Departman</th>
              <th>Skor</th>
              <th>Neden</th>
              <th>Seviye</th>
            </tr>
          </thead>
          <tbody>
            {risky.map((e) => (
              <tr key={e.id}>
                <td>{e.name}</td>
                <td>{e.department}</td>
                <td>{e.attritionRisk}</td>
                <td>{e.riskReason}</td>
                <td>
                  <StatusBadge level={e.attritionRisk >= 75 ? "critical" : "serious"} label={riskLabel(e.attritionRisk)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Report>
  );
}

function AbsenceTrendReport() {
  return (
    <Report
      title="Devamsızlık trendi (son 12 ay)"
      lead="Ocak ve Temmuz zirveleri mevsimsel. Eylül %3,2 ile yılın ortalamasının altında; Destek ekibi hariç tüm ekipler düşüşte."
    >
      <LineChart
        heading="Aylık devamsızlık oranı"
        labels={MONTHS}
        series={[
          { name: "Devamsızlık %", color: SERIES.blue, values: ABSENCE_TREND },
          { name: "Ayrılma %", color: SERIES.orange, values: ATTRITION_TREND },
        ]}
        unit="%"
      />
    </Report>
  );
}

function HeadcountReport() {
  return (
    <Report
      title="Kadro dağılımı"
      lead="Toplam 120 çalışan, 7 açık pozisyon. Mühendislik toplam kadronun %35'ini oluşturuyor ve açık pozisyonların da çoğu orada."
    >
      <BarChart heading="Departman başına kadro" data={DEPARTMENTS.map((d) => ({ label: d.name.replace("İnsan Kaynakları", "İK"), value: d.headcount }))} unit=" kişi" />
      <LineChart heading="Kadro büyümesi" labels={MONTHS} series={[{ name: "Kadro", color: SERIES.aqua, values: HEADCOUNT_TREND }]} unit="" />
    </Report>
  );
}

function PendingApprovalsReport() {
  const pending = LEAVE_REQUESTS.filter((r) => r.status === "Bekliyor");
  return (
    <Report
      title="Bekleyen onaylar"
      lead={`${pending.length} izin talebi bekliyor. ${pending.filter((r) => r.aiVerdict === "Onayla").length} tanesi politika içinde ve çakışmasız; tek tıkla onaylanabilir.`}
    >
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Çalışan</th>
              <th>Tür</th>
              <th>Gün</th>
              <th>AI görüşü</th>
              <th>Gerekçe</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((r) => (
              <tr key={r.id}>
                <td>{employee(r.employeeId).name}</td>
                <td>{r.type}</td>
                <td>{r.days}</td>
                <td>
                  <StatusBadge level={r.aiVerdict === "Onayla" ? "good" : r.aiVerdict === "Dikkat" ? "warning" : "critical"} label={r.aiVerdict} />
                </td>
                <td>{r.aiReason}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Report>
  );
}

function HiringFunnelReport() {
  const stages = ["Başvuru", "Ön Eleme", "Mülakat", "Teklif", "İşe Alındı"] as const;
  const counts = [136, 44, 18, 5, 3];
  return (
    <Report
      title="İşe alım hattı"
      lead="4 açık pozisyon için 136 başvuru. Ön elemeden mülakata dönüşüm %41; sektör ortalamasının üstünde. Darboğaz teklif aşamasında: ortalama 9 gün."
    >
      <FunnelChart heading="Aşama başına aday" data={stages.map((s, i) => ({ label: s, value: counts[i] }))} unit=" aday" />
      <KpiRow
        tiles={[
          { label: "Ortalama kapanış", value: "27 gün", delta: { text: "-4 gün", direction: "down" } },
          { label: "AI puanı ≥ 80", value: String(CANDIDATES.filter((c) => c.score >= 80).length) },
          { label: "Teklif kabul", value: "%78" },
        ]}
      />
    </Report>
  );
}

function TopCandidatesReport() {
  const top = [...CANDIDATES].filter((c) => c.stage !== "İşe Alındı").sort((a, b) => b.score - a.score).slice(0, 5);
  return (
    <Report title="En güçlü 5 aday" lead="Puan; ilan gereksinimi örtüşmesi, deneyim derinliği ve mülakat notlarından oluşur.">
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Aday</th>
              <th>Pozisyon</th>
              <th>Aşama</th>
              <th>Puan</th>
              <th>AI notu</th>
            </tr>
          </thead>
          <tbody>
            {top.map((c) => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.role}</td>
                <td>{c.stage}</td>
                <td>{c.score}</td>
                <td>{c.aiNote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Report>
  );
}

function PayrollAnomalyReport() {
  return (
    <Report
      title={`${PAYROLL.period} bordro anomalileri`}
      lead="4 anomali tespit edildi, toplam etki 99.050 ₺. En kritik olan Emre Doğan'ın fazla mesai saati; yasal sınıra yaklaşıyor."
    >
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Çalışan</th>
              <th>Tür</th>
              <th>Detay</th>
              <th>Seviye</th>
            </tr>
          </thead>
          <tbody>
            {PAYROLL.anomalies.map((a) => (
              <tr key={a.employeeId + a.kind}>
                <td>{employee(a.employeeId).name}</td>
                <td>{a.kind}</td>
                <td>{a.detail}</td>
                <td>
                  <StatusBadge level={a.tone === "critical" ? "critical" : a.tone === "serious" ? "serious" : a.tone === "warning" ? "warning" : "good"} label={a.tone === "info" ? "Bilgi" : a.tone === "critical" ? "Kritik" : "Dikkat"} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <LineChart heading="Toplam brüt maliyet (milyon ₺)" labels={MONTHS} series={[{ name: "Brüt", color: SERIES.blue, values: PAYROLL.costTrend }]} unit="M" />
    </Report>
  );
}

function TeamOccupancyReport() {
  return (
    <Report title="Ekip başına bütçe doluluğu" lead="Pazarlama ve Ürün kadro bütçesinin %80 üstünde; Finans ve Destek'te alan var.">
      <BarChart heading="Bütçe kullanımı" data={DEPARTMENTS.map((d) => ({ label: d.name.replace("İnsan Kaynakları", "İK"), value: Math.round(d.budgetUse * 100) }))} unit="%" />
    </Report>
  );
}

function ExceptionsReport() {
  const open = GEN.exceptions.filter((x) => x.state === "İstisna" || x.state === "İnceleme");
  const byKind = new Map<string, number>();
  for (const x of open) byKind.set(x.kind, (byKind.get(x.kind) ?? 0) + 1);
  return (
    <Report title="Eksik giriş/çıkış ve PDKS istisnaları" lead={`${open.length} açık istisna. ${open.filter((x) => x.aiSuggestion.includes("öner")).length} tanesi için AI düzeltme önerisi hazır; tek tıkla uygulanabilir.`} footnote="Ham hareketler değiştirilmez; öneriler ayrı düzeltme kaydı olarak yazılır.">
      <BarChart heading="Türe göre açık istisna" data={[...byKind.entries()].map(([label, value]) => ({ label, value }))} unit="" />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Çalışan</th><th>Tarih</th><th>Tür</th><th>AI önerisi</th></tr></thead>
          <tbody>{open.slice(0, 8).map((x) => <tr key={x.id}><td>{GEN.employees.find((e) => e.id === x.employeeId)?.name}</td><td>{x.date}</td><td>{x.kind}</td><td>{x.aiSuggestion}</td></tr>)}</tbody>
        </table>
      </div>
    </Report>
  );
}

function OvertimeLimitReport() {
  const near = GEN.timesheet.filter((t) => t.overtime >= 40).map((t) => ({ ...t, name: GEN.employees.find((e) => e.id === t.employeeId)?.name ?? t.employeeId }));
  return (
    <Report title="Fazla mesai sınırına yaklaşanlar" lead={`${near.length} çalışan aylık 72 saat politika sınırının %55'inin üstünde. Toplam fazla mesai ${GEN.timesheet.reduce((s, t) => s + t.overtime, 0)} saat.`}>
      <FunnelChart heading="Saat" data={near.sort((a, b) => b.overtime - a.overtime).slice(0, 8).map((t) => ({ label: t.name, value: t.overtime }))} unit=" sa" />
      <KpiRow tiles={[{ label: "Sınıra yakın", value: String(near.length) }, { label: "Onay bekleyen", value: String(GEN.overtime.filter((o) => o.state === "Onay bekliyor").length) }, { label: "Ortalama / kişi", value: (GEN.timesheet.reduce((s, t) => s + t.overtime, 0) / GEN.timesheet.length).toFixed(1).replace(".", ",") + " sa" }]} />
    </Report>
  );
}

function TimesheetReadinessReport() {
  const pend = GEN.timesheet.filter((t) => t.state === "Onay bekliyor").length;
  const calc = GEN.timesheet.filter((t) => t.state === "Hesaplandı").length;
  const locked = GEN.timesheet.filter((t) => t.state === "Kilitli").length;
  const issues = GEN.timesheet.filter((t) => t.issues.length).length;
  return (
    <Report title="Puantaj bordroya hazır mı?" lead={`${GEN.timesheet.length} satırın ${locked} kilitli, ${GEN.timesheet.filter((t) => t.state === "Onaylandı").length} onaylı. ${pend} onay bekliyor, ${calc} yalnız hesaplandı. ${issues} satırda düzeltme notu var; bordro Validate adımı bunlar çözülmeden geçmez.`}>
      <KpiRow tiles={[{ label: "Kilitli", value: String(locked) }, { label: "Onaylı", value: String(GEN.timesheet.filter((t) => t.state === "Onaylandı").length) }, { label: "Bekleyen", value: String(pend + calc) }, { label: "Sorunlu", value: String(issues) }]} />
      <ul className={styles.bulletList}>
        <li>Önce fazla mesai sınırına yakın satırlar (vardiya devri ile çözülür).</li>
        <li>Sonra devamsızlık işaretli satırlar (düzeltme talepleri onaylanınca kendiliğinden düşer).</li>
        <li>Kalanlar toplu onaya uygundur; AI tek tıkla önerir, kilit yönetici onayıyla atılır.</li>
      </ul>
    </Report>
  );
}

function OpenPositionsReport() {
  const open = GEN.positions.filter((p) => p.status === "Boş");
  return (
    <Report title="Boş pozisyonlar" lead={`${open.length} boş pozisyon, aylık bütçe etkisi ${new Intl.NumberFormat("tr-TR").format(open.reduce((s, p) => s + p.budget, 0))} ₺. En uzun süredir açık olanlar ilanda yenileme ister.`}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Pozisyon</th><th>Departman</th><th>Kademe</th><th>Bütçe</th><th>AI notu</th></tr></thead>
          <tbody>{open.map((p) => <tr key={p.id}><td>{p.title}</td><td>{p.department}</td><td>{p.grade}</td><td>{new Intl.NumberFormat("tr-TR").format(p.budget)} ₺</td><td>{p.aiNote}</td></tr>)}</tbody>
        </table>
      </div>
    </Report>
  );
}

function ExpiringDocsReport() {
  const soon = GEN.docs.filter((d) => d.status === "Süresi doluyor" || d.status === "Süresi doldu");
  return (
    <Report title="Süresi dolan ve dolmak üzere olan belgeler" lead={`${soon.filter((d) => d.status === "Süresi doldu").length} belge doldu, ${soon.filter((d) => d.status === "Süresi doluyor").length} belge 30 gün içinde doluyor. Sertifikalar İSG zorunluluğu için öncelikli.`}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Belge</th><th>Tür</th><th>Bitiş</th><th>Durum</th></tr></thead>
          <tbody>{soon.slice(0, 10).map((d) => <tr key={d.id}><td>{d.title}</td><td>{d.kind}</td><td>{d.expires ?? "—"}</td><td><StatusBadge level={d.status === "Süresi doldu" ? "critical" : "warning"} label={d.status} /></td></tr>)}</tbody>
        </table>
      </div>
    </Report>
  );
}

function OpenCasesReport() {
  const open = GEN.cases.filter((c) => c.state === "Açık" || c.state === "İnceleme").sort((a, b) => (a.priority === "Yüksek" ? -1 : 1) - (b.priority === "Yüksek" ? -1 : 1));
  return (
    <Report title="Açık HR vakaları · öncelik sırası" lead={`${open.length} açık vaka; ${open.filter((c) => c.priority === "Yüksek").length} yüksek öncelikli. Disiplin ve olay vakaları SLA'sı en kısa olanlardır.`}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>#</th><th>Çalışan</th><th>Tür</th><th>Konu</th><th>Öncelik</th><th>Durum</th></tr></thead>
          <tbody>{open.slice(0, 10).map((c) => <tr key={c.id}><td>{c.id}</td><td>{GEN.employees.find((e) => e.id === c.employeeId)?.name}</td><td>{c.kind}</td><td>{c.title}</td><td><StatusBadge level={c.priority === "Yüksek" ? "critical" : c.priority === "Orta" ? "warning" : "good"} label={c.priority} /></td><td>{c.state}</td></tr>)}</tbody>
        </table>
      </div>
    </Report>
  );
}

function FailedAutomationsReport() {
  const bad = GEN.automations.filter((a) => a.status !== "Aktif");
  return (
    <Report title="Hatalı ve duraklatılmış otomasyonlar" lead={`${bad.filter((a) => a.status === "Hatalı").length} hatalı, ${bad.filter((a) => a.status === "Duraklatıldı").length} duraklatılmış. Hatalı olanlar entegrasyon yetkisi ister; duraklatılanlar son tarihe göre yeniden başlatılmalı.`}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Otomasyon</th><th>Tür</th><th>Zamanlama</th><th>Durum</th><th>AI notu</th></tr></thead>
          <tbody>{bad.map((a) => <tr key={a.id}><td>{a.name}</td><td>{a.kind}</td><td>{a.schedule}</td><td><StatusBadge level={a.status === "Hatalı" ? "critical" : "warning"} label={a.status} /></td><td>{a.aiNote}</td></tr>)}</tbody>
        </table>
      </div>
    </Report>
  );
}

function InterviewQueueReport() {
  const q = GEN.candidates.filter((c) => c.stage === "Mülakat").sort((a, b) => b.score - a.score);
  return (
    <Report title="Mülakat bekleyen adaylar" lead={`${q.length} aday mülakat aşamasında; ortalama AI puanı ${Math.round(q.reduce((s, c) => s + c.score, 0) / Math.max(1, q.length))}. En yüksek puanlılar ilk 48 saatte planlanmalı.`}>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead><tr><th>Aday</th><th>Pozisyon</th><th>Puan</th><th>Gün</th><th>AI notu</th></tr></thead>
          <tbody>{q.slice(0, 10).map((c) => <tr key={c.id}><td>{c.name}</td><td>{c.role}</td><td>{c.score}</td><td>{c.days}</td><td>{c.aiNote}</td></tr>)}</tbody>
        </table>
      </div>
    </Report>
  );
}

function PageExplanationReport(pageLabel: string) {
  return (
    <Report
      title={`${pageLabel} sayfası ne yapar?`}
      lead={`Bu sayfa ${pageLabel.toLowerCase()} alanındaki kayıtları, AI özetiyle birlikte gösterir. Her tablo satırındaki AI düğmesi o kayıt için açıklama ve öneri üretir; üstteki AI özeti sayfa yüklendiğinde otomatik yenilenir.`}
    >
      <ul className={styles.bulletList}>
        <li>Kartlar sayfa bağlamını bilir: soru sorarken bu sayfanın verisi kullanılır.</li>
        <li>Satır aksiyonları geri alınabilir; AI önerisi asla otomatik uygulanmaz.</li>
        <li>Öneri pill'leri bu sayfa için en sık sorulan 6 soruyu taşır.</li>
      </ul>
    </Report>
  );
}

const CANNED: readonly { match: RegExp; render: (request: AiCommandQueryRequest) => ReactNode }[] = [
  { match: /eksik (giriş|çıkış)|istisna|gelmeyen/i, render: () => <ExceptionsReport /> },
  { match: /mesai sınır|sınıra yaklaş|fazla mesai/i, render: () => <OvertimeLimitReport /> },
  { match: /puantaj/i, render: () => <TimesheetReadinessReport /> },
  { match: /boş pozisyon|pozisyonları listele/i, render: () => <OpenPositionsReport /> },
  { match: /süresi dol|eksik (özlük|belge)/i, render: () => <ExpiringDocsReport /> },
  { match: /açık vaka|vakaları/i, render: () => <OpenCasesReport /> },
  { match: /başarısız|hatalı (entegrasyon|görev|otomasyon)|duraklat/i, render: () => <FailedAutomationsReport /> },
  { match: /mülakat bekleyen|mülakat/i, render: () => <InterviewQueueReport /> },
  { match: /ayrılma riski|riskli çalışan/i, render: () => <AttritionRiskReport /> },
  { match: /devamsızlık|geç kalma/i, render: () => <AbsenceTrendReport /> },
  { match: /kadro|departman bazında/i, render: () => <HeadcountReport /> },
  { match: /bekleyen (onay|izin)/i, render: () => <PendingApprovalsReport /> },
  { match: /işe alım hattı|huni|dönüşüm oranı/i, render: () => <HiringFunnelReport /> },
  { match: /güçlü .*aday|adayı sırala/i, render: () => <TopCandidatesReport /> },
  { match: /bordro|anomali|maliyet/i, render: () => <PayrollAnomalyReport /> },
  { match: /doluluk|bütçe/i, render: () => <TeamOccupancyReport /> },
  { match: /sayfayı açıkla|ne yapar/i, render: (r) => PageExplanationReport(r.currentPageLabel ?? "Bu") },
];

const TEXT_ANSWERS: readonly { match: RegExp; answer: string }[] = [
  {
    match: /dikkat etmem gereken/i,
    answer:
      "Bugün için 3 öncelik: (1) Ahmet Yıldız'ın ayrılma riski 78'e çıktı, bu hafta bir birebir görüşme planlayın. " +
      "(2) Slack izin senkronu 2 gündür hatalı; 3 talep manuel girilmiş olabilir, yeniden bağlantı 1 dakika sürer. " +
      "(3) Bordro taslağında Emre Doğan'ın fazla mesaisi yasal sınıra 28 saat kaldı; vardiya planında gece nöbetini dağıtın.",
  },
  {
    match: /deneme süresi/i,
    answer:
      "Bu ay deneme süresi biten tek kişi Mert Kaya (16 Eylül). İlk değerlendirme formu henüz doldurulmadı; yöneticisine bugün otomatik hatırlatma gönderildi. Kalıcı sözleşme taslağı Belgeler sayfasında hazır.",
  },
  {
    match: /ilan metni|taslağı yaz|taslak/i,
    answer:
      "Taslak hazır: \"Kıdemli Backend Geliştirici (Go) — Ödeme altyapımızı 3 milyon işlem/gün ölçeğinde çalıştıran ekibe katılın. Go, PostgreSQL ve Kubernetes ile üretim deneyimi, gözlemlenebilirlik kültürü ve mentorluk isteği arıyoruz. Hibrit İstanbul veya tam uzaktan.\" Devam etmek için İşe Alım sayfasındaki 'AI ile ilan yaz' düğmesini kullanın.",
  },
  {
    match: /değerlendirme taslağı/i,
    answer:
      "Ahmet Yıldız için taslak: Ödeme servisi gecikme hedefinde %62 ilerleme ve 3 kritik olayın çözümünde liderlik; güçlü teknik derinlik. Gelişim alanı: bilgi paylaşımı ve nöbet yükünü devretme. Öneri: Kıdemli+ ünvan değerlendirmesi ve mentorluk rolü. Taslak Performans sayfasında düzenlenebilir.",
  },
  {
    match: /otomasyon|her pazartesi|kutlama/i,
    answer:
      "Kural anlaşıldı. Otomasyonlar sayfasında taslak oluşturuldu: tetikleyici, alıcılar ve mesaj şablonu AI tarafından dolduruldu. Aktifleştirmeden önce bir test çalıştırması yapabilirsiniz.",
  },
  {
    match: /izin|çakışan/i,
    answer:
      "14–19 Eylül haftasında Ahmet Yıldız ve Burak Şahin'in izinleri çakışıyor; ödeme servisinde tek yedek kalıyor. Öneri: Ahmet'in iznini 21 Eylül'e kaydırmak ya da Emre Doğan'ı o hafta yedek atamak.",
  },
  {
    match: /paylaşılıyor|izin|erişim/i,
    answer:
      "AI asistanı yalnızca rolünüzün görebildiği verileri kullanır. Bordro ve sağlık verileri varsayılan olarak maskelenir; ayarlardan alan bazında açılabilir. Tüm AI önerileri kayıt altına alınır ve hiçbiri onaysız uygulanmaz.",
  },
];

export async function simulateHrQuery(request: AiCommandQueryRequest): Promise<string | ReactNode> {
  await new Promise((resolve) => setTimeout(resolve, 1300));
  const canned = CANNED.find((entry) => entry.match.test(request.query));
  if (canned) return canned.render(request);
  const text = TEXT_ANSWERS.find((entry) => entry.match.test(request.query));
  if (text) return text.answer;
  return (
    `"${request.currentPageLabel ?? "Panel"}" bağlamında "${request.query}" sorgunuzu inceledim. ` +
    "Bu sayfadaki verilere göre önce AI özetindeki uyarıları gözden geçirmenizi, ardından tabloda işaretli satırlardaki AI önerilerini açmanızı öneririm. " +
    "Daha ayrıntılı bir rapor için sorguyu 'çiz', 'listele' veya 'karşılaştır' ile sonlandırabilirsiniz."
  );
}
