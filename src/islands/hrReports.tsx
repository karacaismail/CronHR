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
