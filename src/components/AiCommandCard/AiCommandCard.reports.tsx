import type { ReactNode } from "react";
import { TrendDown, TrendUp } from "@phosphor-icons/react";
import styles from "./AiCommandCard.reports.module.css";

/**
 * Rich AI report blocks for the demo simulation (fixtures layer, not part of
 * the component core). Charts are hand-rolled SVG following the data-viz
 * method: validated categorical palette, thin marks with rounded data-ends,
 * recessive grids, direct labels + legends, native per-mark tooltips.
 */

// Validated categorical trio (light mode) + reserved status colors.
export const SERIES = { blue: "#2a78d6", orange: "#eb6834", aqua: "#1baf7a" } as const;
export const STATUS = { good: "#0ca30c", warning: "#fab219", serious: "#ec835a", critical: "#d03b3b" } as const;
// Ordinal sequential ramp (blue, starts at step 250 for surface contrast).
const SEQ_RAMP = ["#86b6ef", "#6da7ec", "#5598e7", "#3987e5", "#2a78d6", "#256abf"] as const;
const GRID = "var(--border, #e7e8ea)";
const INK_MUTED = "var(--ink-muted, #5b6371)";

function roundedTopBar(x: number, yTop: number, width: number, height: number, r: number): string {
  const radius = Math.min(r, width / 2, height);
  return [
    `M ${x} ${yTop + height}`,
    `L ${x} ${yTop + radius}`,
    `Q ${x} ${yTop} ${x + radius} ${yTop}`,
    `L ${x + width - radius} ${yTop}`,
    `Q ${x + width} ${yTop} ${x + width} ${yTop + radius}`,
    `L ${x + width} ${yTop + height}`,
    "Z",
  ].join(" ");
}

function roundedEndBarH(x: number, y: number, width: number, height: number, r: number): string {
  const radius = Math.min(r, height / 2, width);
  return [
    `M ${x} ${y}`,
    `L ${x + width - radius} ${y}`,
    `Q ${x + width} ${y} ${x + width} ${y + radius}`,
    `L ${x + width} ${y + height - radius}`,
    `Q ${x + width} ${y + height} ${x + width - radius} ${y + height}`,
    `L ${x} ${y + height}`,
    "Z",
  ].join(" ");
}

interface KpiTileModel {
  label: string;
  value: string;
  delta?: { text: string; direction: "up" | "down" };
}

export function KpiRow({ tiles }: { tiles: readonly KpiTileModel[] }) {
  return (
    <div className={styles.kpiRow}>
      {tiles.map((tile) => (
        <div key={tile.label} className={styles.kpiTile}>
          <span className={styles.kpiLabel}>{tile.label}</span>
          <span className={styles.kpiValue}>{tile.value}</span>
          {tile.delta ? (
            <span
              className={`${styles.kpiDelta} ${
                tile.delta.direction === "up" ? styles.kpiDeltaUp : styles.kpiDeltaDown
              }`}
            >
              {tile.delta.direction === "up" ? <TrendUp size={12} /> : <TrendDown size={12} />}
              {tile.delta.text}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function Legend({ items }: { items: readonly { label: string; color: string }[] }) {
  return (
    <div className={styles.legendRow}>
      {items.map((item) => (
        <span key={item.label} className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: item.color }} />
          {item.label}
        </span>
      ))}
    </div>
  );
}

/* ------------------------------------------------------- vertical bars */

interface BarChartProps {
  heading: string;
  data: readonly { label: string; value: number }[];
  unit: string;
}

export function BarChart({ heading, data, unit }: BarChartProps) {
  const width = 460;
  const height = 180;
  const pad = { top: 18, right: 8, bottom: 24, left: 8 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = Math.max(...data.map((d) => d.value)) * 1.15;
  const slot = plotW / data.length;
  const barW = Math.min(34, slot * 0.55);
  const peak = data.reduce((a, b) => (b.value > a.value ? b : a));

  return (
    <figure className={styles.chartCard} role="img" aria-label={heading}>
      <figcaption className={styles.chartHeading}>{heading}</figcaption>
      <svg className={styles.chartSvg} viewBox={`0 0 ${width} ${height}`}>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + plotH - plotH * t}
            y2={pad.top + plotH - plotH * t}
            stroke={GRID}
            strokeWidth={1}
          />
        ))}
        {data.map((d, i) => {
          const barH = (d.value / max) * plotH;
          const x = pad.left + slot * i + (slot - barW) / 2;
          const yTop = pad.top + plotH - barH;
          return (
            <g key={d.label}>
              <path d={roundedTopBar(x, yTop, barW, barH, 4)} fill={SERIES.blue}>
                <title>{`${d.label}: ${d.value} ${unit}`}</title>
              </path>
              {d === peak ? (
                <text
                  x={x + barW / 2}
                  y={yTop - 6}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={600}
                  fill="var(--ink, #1c1e21)"
                >
                  {d.value}
                </text>
              ) : null}
              <text
                x={pad.left + slot * i + slot / 2}
                y={height - 8}
                textAnchor="middle"
                fontSize={10}
                fill={INK_MUTED}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/* ----------------------------------------------------------- line chart */

interface LineChartProps {
  heading: string;
  labels: readonly string[];
  series: readonly { name: string; color: string; values: readonly number[] }[];
  unit: string;
}

export function LineChart({ heading, labels, series, unit }: LineChartProps) {
  const width = 460;
  const height = 190;
  const pad = { top: 14, right: 46, bottom: 24, left: 8 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = Math.max(...series.flatMap((s) => s.values)) * 1.12;
  const x = (i: number) => pad.left + (plotW * i) / (labels.length - 1);
  const y = (v: number) => pad.top + plotH - (v / max) * plotH;

  return (
    <figure className={styles.chartCard} role="img" aria-label={heading}>
      <figcaption className={styles.chartHeading}>{heading}</figcaption>
      <svg className={styles.chartSvg} viewBox={`0 0 ${width} ${height}`}>
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={t}
            x1={pad.left}
            x2={width - pad.right}
            y1={pad.top + plotH - plotH * t}
            y2={pad.top + plotH - plotH * t}
            stroke={GRID}
            strokeWidth={1}
          />
        ))}
        {labels.map((label, i) => (
          <text key={label} x={x(i)} y={height - 8} textAnchor="middle" fontSize={10} fill={INK_MUTED}>
            {label}
          </text>
        ))}
        {series.map((s) => {
          const path = s.values
            .map((v, i) => `${i === 0 ? "M" : "L"} ${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
            .join(" ");
          const last = s.values[s.values.length - 1];
          return (
            <g key={s.name}>
              <path d={path} fill="none" stroke={s.color} strokeWidth={2} strokeLinejoin="round" />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={3} fill={s.color} stroke="#fff" strokeWidth={2}>
                  <title>{`${s.name} — ${labels[i]}: ${v} ${unit}`}</title>
                </circle>
              ))}
              <text
                x={x(s.values.length - 1) + 8}
                y={y(last) + 4}
                fontSize={11}
                fontWeight={600}
                fill="var(--ink, #1c1e21)"
              >
                {last}
              </text>
            </g>
          );
        })}
      </svg>
      <Legend items={series.map((s) => ({ label: s.name, color: s.color }))} />
    </figure>
  );
}

/* -------------------------------------------------- horizontal ordinal */

interface FunnelChartProps {
  heading: string;
  data: readonly { label: string; value: number }[];
  unit: string;
}

export function FunnelChart({ heading, data, unit }: FunnelChartProps) {
  const width = 460;
  const rowH = 26;
  const gap = 8;
  const labelW = 130;
  const valueW = 52;
  const height = data.length * (rowH + gap) - gap;
  const max = Math.max(...data.map((d) => d.value));
  const plotW = width - labelW - valueW;

  return (
    <figure className={styles.chartCard} role="img" aria-label={heading}>
      <figcaption className={styles.chartHeading}>{heading}</figcaption>
      <svg className={styles.chartSvg} viewBox={`0 0 ${width} ${height}`}>
        {data.map((d, i) => {
          const barW = Math.max((d.value / max) * plotW, 6);
          const yRow = i * (rowH + gap);
          const color = SEQ_RAMP[Math.min(i, SEQ_RAMP.length - 1)];
          return (
            <g key={d.label}>
              <text x={0} y={yRow + rowH / 2 + 4} fontSize={11} fill={INK_MUTED}>
                {d.label}
              </text>
              <path d={roundedEndBarH(labelW, yRow, barW, rowH, 4)} fill={color}>
                <title>{`${d.label}: ${d.value} ${unit}`}</title>
              </path>
              <text
                x={labelW + barW + 8}
                y={yRow + rowH / 2 + 4}
                fontSize={11}
                fontWeight={600}
                fill="var(--ink, #1c1e21)"
              >
                {d.value}
              </text>
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/* ---------------------------------------------------------------- tables */

export function StatusBadge({ level, label }: { level: keyof typeof STATUS; label: string }) {
  return (
    <span className={styles.statusBadge} style={{ color: STATUS[level] }}>
      <span className={styles.statusDot} style={{ background: STATUS[level] }} />
      {label}
    </span>
  );
}

/* ------------------------------------------------------------- reports */

export function ClosedDealsReport() {
  return (
    <div className={styles.report}>
      <h3 className={styles.reportTitle}>3. Çeyrek Kapanan Fırsatlar Özeti</h3>
      <KpiRow
        tiles={[
          { label: "Kapanan fırsat", value: "14", delta: { text: "%18 artış", direction: "up" } },
          { label: "Toplam tutar", value: "2,4M₺", delta: { text: "%11 artış", direction: "up" } },
          { label: "Ort. kapanış süresi", value: "23 gün", delta: { text: "4 gün kısaldı", direction: "up" } },
        ]}
      />
      <BarChart
        heading="Aylara göre kapanan fırsat (adet)"
        unit="fırsat"
        data={[
          { label: "Tem", value: 3 },
          { label: "Ağu", value: 5 },
          { label: "Eyl", value: 6 },
        ]}
      />
      <p className={styles.reportLead}>
        En büyük üç kapanış: Aksa Enerji (860K₺), Nordik Lojistik (540K₺) ve Mavi Tekstil
        (410K₺). Eylül ayı, çeyreğin en güçlü ayı oldu ve kapanışların %43'ünü taşıdı.
      </p>
      <p className={styles.reportFootnote}>AI simülasyonu — örnek veriyle üretilmiş rapor.</p>
    </div>
  );
}

export function RiskyCustomersReport() {
  const rows = [
    { name: "Delta Gıda", signal: "45 gündür temas yok", level: "critical" as const, levelLabel: "Kritik", value: "320K₺" },
    { name: "Kuzey Yapı", signal: "Son 2 fatura gecikmeli", level: "serious" as const, levelLabel: "Yüksek", value: "210K₺" },
    { name: "Ege Medikal", signal: "Kullanım %60 düştü", level: "warning" as const, levelLabel: "Orta", value: "145K₺" },
    { name: "Aksa Enerji", signal: "Sözleşme yenileme yaklaşıyor", level: "good" as const, levelLabel: "İzlemede", value: "860K₺" },
  ];
  return (
    <div className={styles.report}>
      <h3 className={styles.reportTitle}>Riskli Müşteriler</h3>
      <div className={styles.tableWrap}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th scope="col">Müşteri</th>
              <th scope="col">Risk sinyali</th>
              <th scope="col">Seviye</th>
              <th scope="col" className={styles.numericCell}>Yıllık değer</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td>{row.signal}</td>
                <td><StatusBadge level={row.level} label={row.levelLabel} /></td>
                <td className={styles.numericCell}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.reportLead}>
        Önerilen ilk adım: Delta Gıda için yarın bir arama planlayın; 45 günlük sessizlik,
        kayıp riskinin en güçlü göstergesi. Kuzey Yapı için finans ekibiyle ödeme planı
        görüşmesi öneririm.
      </p>
      <p className={styles.reportFootnote}>AI simülasyonu — örnek veriyle üretilmiş rapor.</p>
    </div>
  );
}

export function PageExplanationReport() {
  return (
    <div className={styles.report}>
      <h3 className={styles.reportTitle}>Bu Sayfadaki Rapor Ne Anlatıyor?</h3>
      <p className={styles.reportLead}>
        "3. Çeyrek Kurumsal Satış Fırsatları Raporu", çeyrek boyunca açılan ve kapanan
        kurumsal fırsatları aşama, tutar ve sorumlu bazında özetler. Rapor üç bölümden
        oluşur:
      </p>
      <ul className={styles.bulletList}>
        <li><strong>Aşama dağılımı</strong> — her satış aşamasında bekleyen fırsat sayısı ve tutarı.</li>
        <li><strong>Kapanış performansı</strong> — hedefe karşı gerçekleşen kapanışlar ve dönüşüm oranı.</li>
        <li><strong>Sorumlu bazında görünüm</strong> — temsilci başına fırsat yükü ve kazanma oranı.</li>
      </ul>
      <p className={styles.reportLead}>
        Öne çıkan bulgu: teklif aşamasında bekleyen 6 fırsatın 4'ü 30 günden uzun süredir
        güncellenmemiş — bu, çeyrek sonu tahminini aşağı çeken ana etken.
      </p>
      <p className={styles.reportFootnote}>AI simülasyonu — örnek veriyle üretilmiş açıklama.</p>
    </div>
  );
}

export function RevenueTrendReport() {
  return (
    <div className={styles.report}>
      <h3 className={styles.reportTitle}>Aylık Gelir Trendi</h3>
      <LineChart
        heading="Gelir (K₺) — bu yıl ve geçen yıl"
        unit="K₺"
        labels={["Mar", "Nis", "May", "Haz", "Tem", "Ağu"]}
        series={[
          { name: "2026", color: SERIES.blue, values: [420, 465, 440, 510, 560, 640] },
          { name: "2025", color: SERIES.orange, values: [380, 395, 410, 405, 430, 455] },
        ]}
      />
      <p className={styles.reportLead}>
        Son üç ayda gelir, geçen yılın aynı dönemine göre ortalama %32 önde. Ağustos'taki
        sıçramanın ana kaynağı Aksa Enerji kapanışı; onsuz bile büyüme %19 ile trendin
        üzerinde.
      </p>
      <p className={styles.reportFootnote}>AI simülasyonu — örnek veriyle üretilmiş rapor.</p>
    </div>
  );
}

export function PipelineDistributionReport() {
  return (
    <div className={styles.report}>
      <h3 className={styles.reportTitle}>Satış Hattı Dağılımı</h3>
      <FunnelChart
        heading="Aşamalara göre fırsat (adet)"
        unit="fırsat"
        data={[
          { label: "Yeni fırsat", value: 24 },
          { label: "İlk görüşme", value: 18 },
          { label: "İhtiyaç analizi", value: 12 },
          { label: "Teklif", value: 6 },
          { label: "Sözleşme", value: 3 },
        ]}
      />
      <p className={styles.reportLead}>
        En sert daralma ihtiyaç analizi → teklif geçişinde (%50). Teklif şablonlarının
        hazırlanma süresi ortalama 9 gün; bunu 3 güne indirmek çeyrek sonu kapanışını
        yaklaşık 2 fırsat artırabilir.
      </p>
      <p className={styles.reportFootnote}>AI simülasyonu — örnek veriyle üretilmiş rapor.</p>
    </div>
  );
}

export function TeamPerformanceReport() {
  const rows = [
    { name: "Zeynep A.", deals: 6, winRate: 62, value: "940K₺" },
    { name: "Mert K.", deals: 4, winRate: 48, value: "610K₺" },
    { name: "Elif S.", deals: 3, winRate: 41, value: "480K₺" },
    { name: "Baran T.", deals: 1, winRate: 27, value: "370K₺" },
  ];
  const maxRate = Math.max(...rows.map((r) => r.winRate));
  return (
    <div className={styles.report}>
      <h3 className={styles.reportTitle}>Ekip Performans Karşılaştırması</h3>
      <div className={styles.tableWrap}>
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th scope="col">Temsilci</th>
              <th scope="col" className={styles.numericCell}>Kapanış</th>
              <th scope="col">Kazanma oranı</th>
              <th scope="col" className={styles.numericCell}>Tutar</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>{row.name}</td>
                <td className={styles.numericCell}>{row.deals}</td>
                <td>
                  <div className={styles.inlineBarTrack} title={`%${row.winRate}`}>
                    <div
                      className={styles.inlineBarFill}
                      style={{
                        inlineSize: `${(row.winRate / maxRate) * 100}%`,
                        background: SERIES.blue,
                      }}
                    />
                  </div>
                  <span className={styles.reportFootnote}>%{row.winRate}</span>
                </td>
                <td className={styles.numericCell}>{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={styles.reportLead}>
        Zeynep A. hem hacim hem oran liderliğinde. Baran T.'nin fırsat yükü düşük;
        yeni fırsat atamalarının dengelenmesi, ekip toplam kapanışını artırmanın en hızlı
        yolu görünüyor.
      </p>
      <p className={styles.reportFootnote}>AI simülasyonu — örnek veriyle üretilmiş rapor.</p>
    </div>
  );
}

export type { ReactNode as AiReportNode };
