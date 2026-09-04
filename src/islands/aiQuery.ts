import type { ColumnDef, FilterValue, NumberRange, Row, TableQuery } from "./tableTypes";

/**
 * Doğal dil → tablo sorgusu (AI filtre simülasyonu). Türkçe, kural tabanlı:
 * enum değerlerini metinde arar, sayısal sütunlar için "N üstü/altı" ve
 * "yüksek/düşük" eşiklerini çözer, "…e göre (artan|azalan) sırala" niyetini
 * anlar. Eşleşme yoksa metin aramasına düşer. Deterministik ve test edilebilir.
 */

const TR_LOWER = (s: string) => s.toLocaleLowerCase("tr");
const fold = (s: string) => TR_LOWER(s).replace(/[ıi̇]/g, "i").replace(/ş/g, "s").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ö/g, "o").replace(/ü/g, "u").replace(/â/g, "a");

/** Türkçe eklerden arınmış kaba kök: "riski", "riske", "riskine" → "risk". */
function stem(word: string): string {
  return fold(word).replace(/(lerin|ların|leri|ları|ler|lar|ine|ina|ini|ını|nin|nın|den|dan|ten|tan|i|ı|e|a|u|ü|ye|ya|de|da|te|ta)$/u, "");
}

/** Sık kullanılan Türkçe eş anlamlılar → sütun anahtarı. */
const SYNONYMS: Record<string, readonly string[]> = {
  name: ["isim", "isme", "ismi", "ad", "adi", "ada", "adina", "kisi", "calisan"],
  attritionRisk: ["risk", "riski", "riske", "riskli"],
  score: ["puan", "puani", "puana", "skor"],
  amount: ["tutar", "tutari", "tutara"],
  budget: ["butce", "butcesi", "butceye"],
  days: ["gun", "gunu", "gune"],
  hours: ["saat", "saati", "saate"],
  overtime: ["mesai", "mesaisi", "mesaiye"],
};

function columnForWord(word: string, columns: readonly ColumnDef[]): ColumnDef | undefined {
  const w = fold(word);
  const st = stem(word);
  for (const col of columns) {
    const lw = fold(col.label).split(/\s+/).map(stem);
    if (lw.includes(st) || st === fold(col.key) || w === fold(col.key)) return col;
    const syn = SYNONYMS[col.key];
    if (syn && (syn.includes(w) || syn.includes(st))) return col;
  }
  return undefined;
}

export function parseAiQuery(text: string, columns: readonly ColumnDef[]): TableQuery {
  const q: TableQuery = { search: "", filters: {} };
  const source = fold(text);
  const words = source.split(/[\s,;]+/).filter(Boolean);
  let consumed = new Set<number>();

  // 1) enum değerleri
  for (const col of columns) {
    if (col.type !== "enum" || !col.options) continue;
    for (const opt of col.options) {
      const f = fold(opt);
      const idx = source.indexOf(f);
      if (idx >= 0) {
        const list = (q.filters[col.key] as string[] | undefined) ?? [];
        if (!list.includes(opt)) list.push(opt);
        q.filters[col.key] = list;
        words.forEach((w, i) => { if (f.includes(w) && w.length > 2) consumed.add(i); });
      }
    }
  }

  // 2) sayısal eşikler
  const numericCols = columns.filter((c) => c.type === "number" || c.type === "meter" || c.type === "money");
  for (const col of numericCols) {
    const hit = words.findIndex((w, i) => !consumed.has(i) && columnForWord(w, columns)?.key === col.key);
    if (hit < 0) continue;
    const tail = words.slice(hit + 1, hit + 4);
    const numIdx = tail.findIndex((w) => /^\d+([.,]\d+)?$/.test(w));
    const range: NumberRange = {};
    if (numIdx >= 0) {
      const n = Number(tail[numIdx].replace(",", "."));
      const after = tail[numIdx + 1] ?? "";
      if (/^(ustu|ustunde|fazla|buyuk|ve\s*uzeri)/.test(after) || /^(ust|uzer)/.test(stem(after))) range.min = n;
      else if (/^(alti|altinda|az|kucuk)/.test(after) || /^(alt)/.test(stem(after))) range.max = n;
      else range.min = n;
      [hit, hit + 1 + numIdx, hit + 2 + numIdx].forEach((i) => consumed.add(i));
    } else if (tail.some((w) => /^(yuksek|riskli|fazla)/.test(w))) {
      range.min = 55; consumed.add(hit); consumed.add(hit + 1);
    } else if (tail.some((w) => /^(dusuk|az)/.test(w))) {
      range.max = 35; consumed.add(hit); consumed.add(hit + 1);
    } else {
      continue;
    }
    q.filters[col.key] = range;
  }

  // 3) sıralama
  const sortIdx = words.findIndex((w) => /^sirala|^siral|^sirali/.test(w));
  if (sortIdx >= 0) {
    const before = words.slice(Math.max(0, sortIdx - 4), sortIdx);
    const dir: "asc" | "desc" = before.some((w) => /^artan|^kucukten/.test(w)) ? "asc" : "desc";
    let target: ColumnDef | undefined;
    for (const w of before) { const c = columnForWord(w, columns); if (c) target = c; }
    if (target) {
      q.sort = { key: target.key, dir };
      for (let i = Math.max(0, sortIdx - 4); i <= sortIdx; i++) consumed.add(i);
    }
  }

  // 4) kalan kelimeler → metin araması (yalnız hiçbir yapısal eşleşme yoksa)
  const structural = Object.keys(q.filters).length > 0 || !!q.sort;
  if (!structural) {
    q.search = text.trim();
  }
  return q;
}

export function describeAiQuery(q: TableQuery, columns: readonly ColumnDef[]): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(q.filters)) {
    const col = columns.find((c) => c.key === key);
    const label = col?.label ?? key;
    if (Array.isArray(value)) parts.push(`${label}: ${value.join(", ")}`);
    else {
      const r = value as NumberRange;
      if (r.min !== undefined && r.max !== undefined) parts.push(`${label}: ${r.min}–${r.max}`);
      else if (r.min !== undefined) parts.push(`${label} ≥ ${r.min}`);
      else if (r.max !== undefined) parts.push(`${label} ≤ ${r.max}`);
    }
  }
  if (q.sort) {
    const col = columns.find((c) => c.key === q.sort!.key);
    parts.push(`Sıralama: ${col?.label ?? q.sort.key} (${q.sort.dir === "asc" ? "artan" : "azalan"})`);
  }
  if (!parts.length) return "Eşleşen filtre bulunamadı; metin araması uygulandı";
  return parts.join(" · ");
}

export function matchesFilters(row: Row, columns: readonly ColumnDef[], filters: Record<string, FilterValue>): boolean {
  for (const [key, value] of Object.entries(filters)) {
    const v = row[key];
    if (Array.isArray(value)) {
      if (value.length && !value.includes(String(v))) return false;
    } else {
      const r = value as NumberRange;
      const n = typeof v === "number" ? v : Number(String(v).replace(/[^\d,.-]/g, "").replace(",", "."));
      if (r.min !== undefined && !(n >= r.min)) return false;
      if (r.max !== undefined && !(n <= r.max)) return false;
    }
  }
  void columns;
  return true;
}

export function matchesSearch(row: Row, columns: readonly ColumnDef[], search: string): boolean {
  if (!search.trim()) return true;
  const needle = fold(search.trim());
  return columns.some((c) => fold(String(row[c.key] ?? "")).includes(needle) || (c.subKey ? fold(String(row[c.subKey] ?? "")).includes(needle) : false));
}

export function sortRows<T extends Row>(rows: readonly T[], columns: readonly ColumnDef[], sort?: { key: string; dir: "asc" | "desc" }): T[] {
  if (!sort) return [...rows];
  const col = columns.find((c) => c.key === sort.key);
  const numeric = col && (col.type === "number" || col.type === "meter" || col.type === "money");
  const collator = new Intl.Collator("tr");
  const out = [...rows].sort((a, b) => {
    const av = a[sort.key];
    const bv = b[sort.key];
    let cmp: number;
    if (numeric) cmp = Number(av) - Number(bv);
    else cmp = collator.compare(String(av ?? ""), String(bv ?? ""));
    return sort.dir === "asc" ? cmp : -cmp;
  });
  return out;
}

export function applyAiQuery<T extends Row>(rows: readonly T[], columns: readonly ColumnDef[], q: TableQuery): T[] {
  const filtered = rows.filter((r) => matchesFilters(r, columns, q.filters) && matchesSearch(r, columns, q.search));
  return sortRows(filtered, columns, q.sort);
}
