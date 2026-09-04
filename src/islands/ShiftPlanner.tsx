import { Fragment, useMemo, useState } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Select } from "./Select";
import { AiHint } from "./AiHint";
import {
  fromInputDate,
  formatPeriodLabel,
  GRANULARITY_OPTIONS,
  rangeFor,
  spanDays,
  stepRange,
  toInputDate,
  type DateRange,
  type Granularity,
} from "../scripts/period";
import { SHIFT_ROWS, WEEK_DAYS, employee, initials } from "../data/hr";

const TODAY = new Date(2026, 8, 9); // demo "bugün": 9 Eylül 2026 (bkz. Dashboard)

/** Tarihi kısa, kararlı bir tam sayıya indirger (görsel yoğunluk için). */
function dayHash(d: Date): number {
  const s = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate();
  let h = s;
  h = ((h << 5) - h + 17) | 0;
  h = ((h << 5) - h + 3) | 0;
  return Math.abs(h);
}

function intensityFor(d: Date): 0 | 1 | 2 | 3 | 4 {
  const weekend = d.getDay() === 0 || d.getDay() === 6;
  const base = dayHash(d) % (weekend ? 3 : 5);
  return (weekend ? Math.max(0, base - 1) : base) as 0 | 1 | 2 | 3 | 4;
}

function eachDay(range: DateRange): Date[] {
  const days: Date[] = [];
  const cur = new Date(range.start);
  while (cur <= range.end) {
    days.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return days;
}

export function ShiftPlanner() {
  const [granularity, setGranularity] = useState<Granularity>("week");
  const [anchor, setAnchor] = useState(TODAY);
  const [custom, setCustom] = useState<DateRange>({ start: new Date(2026, 8, 1), end: new Date(2026, 8, 30) });

  const range = useMemo(() => rangeFor(granularity, anchor, custom), [granularity, anchor, custom]);
  const label = useMemo(() => formatPeriodLabel(granularity, range), [granularity, range]);
  const days = spanDays(range);
  const isDetail = granularity === "day" || granularity === "week";

  const goToday = () => {
    setAnchor(TODAY);
    if (granularity === "custom") setCustom(rangeFor("week", TODAY));
  };

  const step = (dir: 1 | -1) => {
    if (granularity === "custom") {
      setCustom((c) => stepRange("custom", c, dir));
      return;
    }
    setAnchor((a) => stepRange(granularity, rangeFor(granularity, a), dir).start);
  };

  const dayIndex = (range.start.getDay() + 6) % 7; // haftalık sabit kurgudaki karşılık gelen gün

  return (
    <div className="planner">
      <div className="planner-toolbar">
        <Select
          id="planner-granularity"
          label="Görünüm"
          hideLabel
          value={granularity}
          onChange={(v) => setGranularity(v as Granularity)}
          options={GRANULARITY_OPTIONS}
        />
        <div className="planner-nav">
          <button type="button" className="icon-btn" aria-label="Önceki dönem" onClick={() => step(-1)}><CaretLeft size={14} /></button>
          <span className="small strong planner-label">{label}</span>
          <button type="button" className="icon-btn" aria-label="Sonraki dönem" onClick={() => step(1)}><CaretRight size={14} /></button>
        </div>
        <button type="button" className="btn btn-sm" onClick={goToday}>Bugün</button>
        {granularity === "custom" ? (
          <div className="planner-custom">
            <input
              type="date"
              className="input"
              aria-label="Başlangıç tarihi"
              value={toInputDate(custom.start)}
              onChange={(e) => setCustom((c) => ({ ...c, start: fromInputDate(e.target.value) }))}
            />
            <span className="small muted">–</span>
            <input
              type="date"
              className="input"
              aria-label="Bitiş tarihi"
              value={toInputDate(custom.end)}
              onChange={(e) => setCustom((c) => ({ ...c, end: fromInputDate(e.target.value) }))}
            />
          </div>
        ) : null}
        <span className="small muted planner-span">{days} gün</span>
      </div>

      {isDetail ? (
        <div className="table-wrap">
          {granularity === "week" ? (
            <div className="shift-grid">
              <div className="shift-head">Çalışan</div>
              {WEEK_DAYS.map((d) => <div className="shift-head" key={d}>{d}</div>)}
              {SHIFT_ROWS.map((row) => {
                const e = employee(row.employeeId);
                return (
                  <Fragment key={row.employeeId}>
                    <div>
                      <span className="person">
                        <span className="avatar" data-hue={e.hue % 9} aria-hidden="true">{initials(e.name)}</span>
                        <span style={{ minWidth: 0 }}>
                          <span className="person-name">{e.name}</span>
                        </span>
                      </span>
                    </div>
                    {row.cells.map((cell, i) => (
                      <div key={i}>
                        {cell.kind === "ai" ? (
                          <AiHint label={cell.label} variant="chip" title={`${e.name} · ${WEEK_DAYS[i]}`} answer={`Bu vardiya boş. ${e.name} uygun: izin yok, haftalık saat sınırı içinde ve son 4 haftada aynı vardiyayı 3 kez tercih etmiş. Alternatif: Selin Çelik.`} actions={["Ata", "Alternatifi göster"]} mode="popover" />
                        ) : cell.kind === "conflict" ? (
                          <AiHint label="22–06 · Çakışma" variant="chip" title="Fazla mesai sınırı" answer="Bu nöbetle Emre Doğan'ın aylık fazla mesaisi 70 saate çıkar; yasal sınır 90 saat ama şirket politikası 72. Öneri: nöbeti Burak Şahin'e devret, Emre'ye telafi izni tanımla." actions={["Burak'a devret", "Telafi izni ekle"]} mode="popover" />
                        ) : (
                          <span className="shift" data-kind={cell.kind}>{cell.label}</span>
                        )}
                      </div>
                    ))}
                  </Fragment>
                );
              })}
            </div>
          ) : (
            <ul className="stack" style={{ gap: "8px", padding: "0 var(--space-4) var(--space-4)" }}>
              {SHIFT_ROWS.map((row) => {
                const e = employee(row.employeeId);
                const cell = row.cells[dayIndex];
                return (
                  <li className="row-between" key={row.employeeId}>
                    <span className="person">
                      <span className="avatar" data-hue={e.hue % 9} aria-hidden="true">{initials(e.name)}</span>
                      <span style={{ minWidth: 0 }}>
                        <span className="person-name">{e.name}</span>
                        <span className="person-sub" style={{ display: "block" }}>{e.department}</span>
                      </span>
                    </span>
                    <span className="shift" data-kind={cell.kind} style={{ inlineSize: "auto" }}>{cell.label}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : (
        <div className="planner-heat">
          <div className="heat" aria-hidden="true">
            {eachDay(range).map((d, i) => <span key={i} data-l={intensityFor(d)} title={d.toDateString()} />)}
          </div>
          <p className="small muted">
            AI: {label} döneminde {days} gün taranıyor; koyu hücreler yoğun kapsama, açık hücreler boşluk riskini gösterir (simüle edilmiş özet — ayrıntı için Gün/Hafta görünümüne geçin).
          </p>
        </div>
      )}
    </div>
  );
}

export default ShiftPlanner;
