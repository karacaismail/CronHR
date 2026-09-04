import { useEffect, useId, useMemo, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowsDownUp, CaretLeft, CaretRight, Export, Funnel, MagnifyingGlass, Sparkle, X } from "@phosphor-icons/react";
import { bulkVerdicts, type BulkResult } from "../ai/bulk";
import { employeeById } from "../data/generate";
import { applyAiQuery, describeAiQuery, matchesFilters, matchesSearch, parseAiQuery, sortRows } from "./aiQuery";
import type { ColumnDef, FilterValue, NumberRange, Row, TableQuery } from "./tableTypes";
import { PRESETS, type PresetName } from "./tablePresets";
import styles from "./DataTable.module.css";
import { Select } from "./Select";

export interface DataTableProps {
  title?: string;
  columns?: readonly ColumnDef[];
  /** Satırlar: düz nesneler (interface türleri de kabul edilir). */
  rows: readonly object[];
  rowKey?: string;
  pageSize?: number;
  /** Astro'dan seri hale getirilebilir kullanım: sütun/hücre/AI tanımı tablePresets'ten. */
  preset?: PresetName;
  /** Tablo durumundan AI özeti üreten fonksiyon (preset varsa preset'ten). */
  aiSummary?: (rows: Row[]) => string;
  /** Dar ekran kart modunu zorla (test). */
  forceCards?: boolean;
  /** Boş durum metni. */
  emptyText?: string;
  /** Satır seçimi ve toplu AI değerlendirmesini aç. */
  selectable?: boolean;
}

const PAGE_SIZES = [10, 25, 50];

function useIsNarrow(force?: boolean) {
  const [narrow, setNarrow] = useState(!!force);
  useEffect(() => {
    if (force) return;
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 47.99em)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [force]);
  return narrow;
}

/**
 * Mobile-first veri tablosu: 320px'te kart listesi, 768px'ten itibaren
 * tablo. Arama, sütun filtreleri (enum çoklu seçim, sayısal aralık),
 * sıralama (aria-sort), sayfalama, AI doğal dil filtresi ve AI özeti.
 * Erişilebilir: scope=col başlıklar, canlı bölge sayaç, klavye ile tüm
 * kontroller, 44px hedefler mobilde.
 */
export function DataTable(props: DataTableProps) {
  const preset = props.preset ? PRESETS[props.preset] : undefined;
  const columns = props.columns ?? preset?.columns ?? [];
  const rowKey = props.rowKey ?? preset?.rowKey ?? "id";
  const aiSummary = props.aiSummary ?? preset?.aiSummary;
  const renderCell = preset?.renderCell;
  const rowAi = preset?.rowAi;
  const uid = useId();
  const narrow = useIsNarrow(props.forceCards);

  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<Record<string, FilterValue>>({});
  const [sort, setSort] = useState<TableQuery["sort"]>(preset?.defaultSort);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(props.pageSize ?? 10);
  const [showFilters, setShowFilters] = useState(false);
  const [aiText, setAiText] = useState("");
  const [aiNote, setAiNote] = useState<string | null>(null);
  const [aiThinking, setAiThinking] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulk, setBulk] = useState<BulkResult | null>(null);
  const [bulkThinking, setBulkThinking] = useState(false);

  const filtered = useMemo(() => {
    const rows = (props.rows as readonly Row[]).filter((r) => matchesFilters(r, columns, filters) && matchesSearch(r, columns, search));
    return sortRows(rows, columns, sort);
  }, [props.rows, columns, filters, search, sort]);

  const total = filtered.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const pageRows = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);
  const from = total === 0 ? 0 : safePage * pageSize + 1;
  const to = Math.min(total, (safePage + 1) * pageSize);

  const activeFilterLabels = useMemo(() => {
    const parts: string[] = [];
    for (const [key, value] of Object.entries(filters)) {
      const col = columns.find((c) => c.key === key);
      if (!col) continue;
      if (Array.isArray(value)) { if (value.length) parts.push(`${col.label}: ${value.join(", ")}`); }
      else {
        const r = value as NumberRange;
        if (r.min !== undefined || r.max !== undefined) parts.push(`${col.label}: ${r.min ?? "…"}–${r.max ?? "…"}`);
      }
    }
    return parts;
  }, [filters, columns]);

  const toggleSort = (key: string) => {
    setPage(0);
    setSort((s) => (!s || s.key !== key ? { key, dir: "asc" } : s.dir === "asc" ? { key, dir: "desc" } : undefined));
  };

  const toggleEnum = (key: string, value: string) => {
    setPage(0);
    setFilters((f) => {
      const list = [...((f[key] as string[] | undefined) ?? [])];
      const i = list.indexOf(value);
      if (i >= 0) list.splice(i, 1); else list.push(value);
      const next = { ...f };
      if (list.length) next[key] = list; else delete next[key];
      return next;
    });
  };

  const setRange = (key: string, part: "min" | "max", raw: string) => {
    setPage(0);
    setFilters((f) => {
      const prev = (f[key] as NumberRange | undefined) ?? {};
      const next: NumberRange = { ...prev };
      if (raw === "") delete next[part]; else next[part] = Number(raw);
      const out = { ...f };
      if (next.min === undefined && next.max === undefined) delete out[key]; else out[key] = next;
      return out;
    });
  };

  const clearAll = () => {
    setSearch(""); setFilters({}); setSort(preset?.defaultSort); setPage(0); setAiText(""); setAiNote(null);
  };

  const runAi = () => {
    if (!aiText.trim()) return;
    setAiThinking(true);
    const q = parseAiQuery(aiText, columns);
    window.setTimeout(() => {
      setFilters(q.filters);
      if (q.sort) setSort(q.sort);
      setSearch(q.search);
      setPage(0);
      const result = applyAiQuery(props.rows as readonly Row[], columns, q);
      setAiNote(`${describeAiQuery(q, columns)} · ${result.length} kayıt`);
      setAiThinking(false);
    }, 450);
  };

  const summary = aiSummary ? aiSummary(filtered as Row[]) : null;

  const cellValue = (row: Row, col: ColumnDef): ReactNode => {
    if (renderCell) {
      const custom = renderCell(row, col);
      if (custom !== undefined) return custom;
    }
    const v = row[col.key];
    if (v === undefined || v === null || v === "") return <span className={styles.muted}>—</span>;
    return String(v);
  };

  const displayName = (row: Row): string => {
    if (row.employeeId) return employeeById(String(row.employeeId)).name;
    return String(row.name ?? row.title ?? row[rowKey] ?? "");
  };

  const toggleRow = (id: string) => setSelected((s) => { const n = new Set(s); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(String(r[rowKey])));
  const toggleAllOnPage = () => setSelected((s) => {
    const n = new Set(s);
    if (allPageSelected) pageRows.forEach((r) => n.delete(String(r[rowKey])));
    else pageRows.forEach((r) => n.add(String(r[rowKey])));
    return n;
  });
  const clearSelection = () => { setSelected(new Set()); setBulk(null); };
  const runBulk = () => {
    setBulkThinking(true);
    const rows = filtered.filter((r) => selected.has(String((r as Row)[rowKey]))) as Row[];
    window.setTimeout(() => {
      setBulk(bulkVerdicts(props.preset ?? "default", rows));
      setBulkThinking(false);
    }, 500);
  };

  const filterableCols = columns.filter((c) => c.filter);
  const primaryCol = columns.find((c) => c.primary) ?? columns[0];

  return (
    <section className={styles.root} data-slot="data-table" aria-label={props.title ?? "Tablo"}>
      <div className={styles.toolbar}>
        <label className={styles.search}>
          <MagnifyingGlass size={15} aria-hidden="true" />
          <input type="search" aria-label="Tabloda ara" placeholder="Ara" value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} />
        </label>
        <div className={styles.toolbarActions}>
          {filterableCols.length ? (
            <button type="button" className={styles.btn} aria-expanded={showFilters} aria-controls={`${uid}-filters`} onClick={() => setShowFilters((v) => !v)}>
              <Funnel size={14} aria-hidden="true" /> Filtreler{activeFilterLabels.length ? <span className={styles.count}>{activeFilterLabels.length}</span> : null}
            </button>
          ) : null}
          <button type="button" className={styles.btn} onClick={() => window.dispatchEvent(new CustomEvent("cronhr:export", { detail: { title: props.title, rows: filtered } }))}>
            <Export size={14} aria-hidden="true" /> <span className={styles.hideNarrow}>Dışa aktar</span>
          </button>
          {(search || activeFilterLabels.length || aiNote) ? (
            <button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={clearAll}><X size={14} aria-hidden="true" /> Temizle</button>
          ) : null}
        </div>
      </div>

      {props.selectable && selected.size > 0 ? (
        <div className={styles.bulkBar} role="region" aria-label="Toplu işlem">
          <span>{selected.size} seçili</span>
          <button type="button" className={styles.aiBtn} onClick={runBulk} disabled={bulkThinking}><Sparkle size={13} weight="fill" aria-hidden="true" /> {bulkThinking ? "Değerlendiriyor" : "AI ile değerlendir"}</button>
          <button type="button" className={`${styles.btn} ${styles.ghost}`} onClick={clearSelection}><X size={13} aria-hidden="true" /> Seçimi temizle</button>
        </div>
      ) : null}
      {bulk ? (
        <div className={styles.bulkResult} role="status">
          <p className={styles.summary}><Sparkle size={12} weight="fill" aria-hidden="true" /> {bulk.summary}</p>
          <ul>
            {bulk.verdicts.map((v) => {
              const row = (filtered as Row[]).find((r) => String(r[rowKey]) === v.id);
              return <li key={v.id}><span className="badge" data-tone={v.verdict === "Onayla" ? "good" : v.verdict === "Reddet" ? "critical" : "warning"}>{v.verdict}</span> <strong>{row ? displayName(row) : v.id}</strong> — {v.reason}</li>;
            })}
          </ul>
        </div>
      ) : null}

      <form className={styles.ai} onSubmit={(e) => { e.preventDefault(); runAi(); }}>
        <span className={styles.aiOrb} aria-hidden="true"><Sparkle size={12} weight="fill" /></span>
        <input type="text" aria-label="AI ile filtrele" placeholder={preset?.aiPlaceholder ?? "Doğal dille filtrele: örn. 'satış riski yüksek riske göre sırala'"} value={aiText} onChange={(e) => setAiText(e.target.value)} />
        <button type="submit" className={styles.aiBtn} disabled={aiThinking}>{aiThinking ? "Düşünüyor" : "Uygula"}</button>
      </form>
      {aiNote ? <p className={styles.aiNote} role="status">AI: {aiNote}</p> : null}
      {preset?.aiChips?.length ? (
        <div className={styles.chips}>
          {preset.aiChips.map((c) => <button key={c} type="button" className={styles.chip} onClick={() => { setAiText(c); const q = parseAiQuery(c, columns); setFilters(q.filters); if (q.sort) setSort(q.sort); setSearch(q.search); setPage(0); setAiNote(`${describeAiQuery(q, columns)} · ${applyAiQuery(props.rows as readonly Row[], columns, q).length} kayıt`); }}><Sparkle size={11} weight="fill" aria-hidden="true" />{c}</button>)}
        </div>
      ) : null}

      {showFilters && filterableCols.length ? (
        <div id={`${uid}-filters`} className={styles.filters}>
          {filterableCols.map((col) => (
            <fieldset key={col.key} className={styles.filterGroup}>
              <legend>{col.label}</legend>
              {col.type === "enum" && col.options ? (
                <div className={styles.checks}>
                  {col.options.map((opt) => {
                    const checked = ((filters[col.key] as string[] | undefined) ?? []).includes(opt);
                    return (
                      <label key={opt} className={styles.check}>
                        <input type="checkbox" checked={checked} onChange={() => toggleEnum(col.key, opt)} aria-label={opt} />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className={styles.range}>
                  <input type="number" inputMode="numeric" aria-label={`${col.label} en az`} placeholder="en az" value={(filters[col.key] as NumberRange | undefined)?.min ?? ""} onChange={(e) => setRange(col.key, "min", e.target.value)} />
                  <span aria-hidden="true">–</span>
                  <input type="number" inputMode="numeric" aria-label={`${col.label} en çok`} placeholder="en çok" value={(filters[col.key] as NumberRange | undefined)?.max ?? ""} onChange={(e) => setRange(col.key, "max", e.target.value)} />
                </div>
              )}
            </fieldset>
          ))}
        </div>
      ) : null}

      {activeFilterLabels.length ? (
        <div className={styles.active} aria-label="Etkin filtreler">
          {activeFilterLabels.map((l) => <span key={l} className={styles.activeChip}>{l}</span>)}
        </div>
      ) : null}

      {summary ? (
        <p className={styles.summary} role="status" aria-label="AI özeti"><Sparkle size={12} weight="fill" aria-hidden="true" /> {summary}</p>
      ) : null}

      {total === 0 ? (
        <p className={styles.empty}>{props.emptyText ?? "Ölçüte uyan kayıt yok."}</p>
      ) : narrow ? (
        <ul className={styles.cards}>
          {pageRows.map((row) => (
            <li key={String(row[rowKey])} className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardPrimary}>{cellValue(row, primaryCol)}</div>
                {rowAi ? rowAi(row) : null}
              </div>
              <dl className={styles.cardBody}>
                {columns.filter((c) => c !== primaryCol && !c.hideOnCards).map((c) => (
                  <div key={c.key} className={styles.cardField}>
                    <dt>{c.label}</dt>
                    <dd>{cellValue(row, c)}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.wrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                {props.selectable ? <th scope="col" className={styles.selectCol}><label className={styles.srOnly}>Sayfadaki tümünü seç</label><input type="checkbox" aria-label="Sayfadaki tümünü seç" checked={allPageSelected} onChange={toggleAllOnPage} /></th> : null}
                {columns.map((col) => {
                  const active = sort?.key === col.key;
                  return (
                    <th key={col.key} scope="col" aria-sort={active ? (sort!.dir === "asc" ? "ascending" : "descending") : undefined} style={{ textAlign: col.align ?? "start", width: col.width }}>
                      {col.sortable ? (
                        <button type="button" className={styles.sortBtn} onClick={() => toggleSort(col.key)} data-active={active}>
                          {col.label}
                          {active ? (sort!.dir === "asc" ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />) : <ArrowsDownUp size={12} aria-hidden="true" className={styles.sortIdle} />}
                        </button>
                      ) : col.label}
                    </th>
                  );
                })}
                {rowAi ? <th scope="col" className={styles.aiCol}>AI</th> : null}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const id = String(row[rowKey]);
                return (
                  <tr key={id} aria-selected={props.selectable ? selected.has(id) : undefined}>
                    {props.selectable ? <td className={styles.selectCol}><input type="checkbox" aria-label={`${displayName(row)} seç`} checked={selected.has(id)} onChange={() => toggleRow(id)} /></td> : null}
                    {columns.map((col) => <td key={col.key} style={{ textAlign: col.align ?? "start" }}>{cellValue(row, col)}</td>)}
                    {rowAi ? <td className={styles.aiCol}>{rowAi(row)}</td> : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.footer}>
        <p className={styles.counter} aria-live="polite">{from}–{to} / {total}</p>
        <div className={styles.pager}>
          <div className={styles.pageSize}>
            <Select id={`${uid}-ps`} label="Sayfa boyutu" hideLabel options={PAGE_SIZES.map((n) => ({ value: String(n), label: `${n} / sayfa` }))} value={String(pageSize)} onChange={(v) => { setPageSize(Number(v)); setPage(0); }} />
          </div>
          <button type="button" className={styles.iconBtn} aria-label="Önceki sayfa" disabled={safePage === 0} onClick={() => setPage((p) => Math.max(0, p - 1))}><CaretLeft size={14} /></button>
          <span className={styles.pageNo}>{safePage + 1} / {pageCount}</span>
          <button type="button" className={styles.iconBtn} aria-label="Sonraki sayfa" disabled={safePage >= pageCount - 1} onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}><CaretRight size={14} /></button>
        </div>
      </div>
    </section>
  );
}

export default DataTable;
