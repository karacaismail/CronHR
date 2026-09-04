/**
 * Tarih aralığı / görünüm modu mantığı — saf, DOM'suz, test edilebilir.
 * Gün/Hafta/Ay/Çeyrek/6 Ay/Yıl/Özel aralık arasında geçiş ve etiketleme.
 */

export type Granularity = "day" | "week" | "month" | "quarter" | "half" | "year" | "custom";

export interface DateRange {
  start: Date;
  end: Date;
}

export const GRANULARITY_OPTIONS: readonly { value: Granularity; label: string }[] = [
  { value: "day", label: "Gün" },
  { value: "week", label: "Hafta" },
  { value: "month", label: "Ay" },
  { value: "quarter", label: "3 Ay" },
  { value: "half", label: "6 Ay" },
  { value: "year", label: "Yıl" },
  { value: "custom", label: "Özel aralık" },
];

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS_TR = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
const MONTHS_TR_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

function atStartOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function atEndOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(23, 59, 59, 999);
  return c;
}

function startOfWeek(d: Date): Date {
  const c = atStartOfDay(d);
  const dow = (c.getDay() + 6) % 7; // 0=Pazartesi
  c.setDate(c.getDate() - dow);
  return c;
}

/** Verilen çapa tarihine göre, seçili görünüm modunun hizalanmış aralığını döner. */
export function rangeFor(granularity: Granularity, anchor: Date, custom?: DateRange): DateRange {
  const a = atStartOfDay(anchor);
  switch (granularity) {
    case "day":
      return { start: a, end: atEndOfDay(a) };
    case "week": {
      const start = startOfWeek(a);
      return { start, end: atEndOfDay(new Date(start.getTime() + 6 * DAY_MS)) };
    }
    case "month": {
      const start = new Date(a.getFullYear(), a.getMonth(), 1);
      const end = new Date(a.getFullYear(), a.getMonth() + 1, 0);
      return { start, end: atEndOfDay(end) };
    }
    case "quarter": {
      const q = Math.floor(a.getMonth() / 3);
      const start = new Date(a.getFullYear(), q * 3, 1);
      const end = new Date(a.getFullYear(), q * 3 + 3, 0);
      return { start, end: atEndOfDay(end) };
    }
    case "half": {
      const h = a.getMonth() < 6 ? 0 : 6;
      const start = new Date(a.getFullYear(), h, 1);
      const end = new Date(a.getFullYear(), h + 6, 0);
      return { start, end: atEndOfDay(end) };
    }
    case "year": {
      const start = new Date(a.getFullYear(), 0, 1);
      const end = new Date(a.getFullYear(), 11, 31);
      return { start, end: atEndOfDay(end) };
    }
    case "custom":
      return custom ? { start: atStartOfDay(custom.start), end: atEndOfDay(custom.end) } : rangeFor("week", a);
  }
}

/** Bir önceki/sonraki döneme geçer. "custom" için aynı uzunlukta pencereyi kaydırır. */
export function stepRange(granularity: Granularity, current: DateRange, dir: 1 | -1): DateRange {
  if (granularity === "custom") {
    const span = current.end.getTime() - current.start.getTime() + 1;
    return { start: new Date(current.start.getTime() + dir * span), end: new Date(current.end.getTime() + dir * span) };
  }
  const anchor = new Date(current.start);
  switch (granularity) {
    case "day": anchor.setDate(anchor.getDate() + dir); break;
    case "week": anchor.setDate(anchor.getDate() + 7 * dir); break;
    case "month": anchor.setMonth(anchor.getMonth() + dir); break;
    case "quarter": anchor.setMonth(anchor.getMonth() + 3 * dir); break;
    case "half": anchor.setMonth(anchor.getMonth() + 6 * dir); break;
    case "year": anchor.setFullYear(anchor.getFullYear() + dir); break;
  }
  return rangeFor(granularity, anchor);
}

/** Toplam gün sayısı (uçlar dahil). */
export function spanDays(range: DateRange): number {
  return Math.round((atStartOfDay(range.end).getTime() - atStartOfDay(range.start).getTime()) / DAY_MS) + 1;
}

export function formatPeriodLabel(granularity: Granularity, range: DateRange): string {
  const { start, end } = range;
  const sameYear = start.getFullYear() === end.getFullYear();
  switch (granularity) {
    case "day":
      return `${start.getDate()} ${MONTHS_TR[start.getMonth()]} ${start.getFullYear()}`;
    case "week": {
      if (start.getMonth() === end.getMonth()) {
        return `${start.getDate()} – ${end.getDate()} ${MONTHS_TR[start.getMonth()]} ${end.getFullYear()}`;
      }
      return `${start.getDate()} ${MONTHS_TR_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTHS_TR_SHORT[end.getMonth()]} ${end.getFullYear()}`;
    }
    case "month":
      return `${MONTHS_TR[start.getMonth()]} ${start.getFullYear()}`;
    case "quarter": {
      const q = Math.floor(start.getMonth() / 3) + 1;
      return `${q}. Çeyrek ${start.getFullYear()} (${MONTHS_TR_SHORT[start.getMonth()]}–${MONTHS_TR_SHORT[end.getMonth()]})`;
    }
    case "half": {
      const h = start.getMonth() < 6 ? 1 : 2;
      return `${h}. Yarı ${start.getFullYear()} (${MONTHS_TR_SHORT[start.getMonth()]}–${MONTHS_TR_SHORT[end.getMonth()]})`;
    }
    case "year":
      return `${start.getFullYear()}`;
    case "custom":
      return sameYear
        ? `${start.getDate()} ${MONTHS_TR_SHORT[start.getMonth()]} – ${end.getDate()} ${MONTHS_TR_SHORT[end.getMonth()]} ${end.getFullYear()}`
        : `${start.getDate()} ${MONTHS_TR_SHORT[start.getMonth()]} ${start.getFullYear()} – ${end.getDate()} ${MONTHS_TR_SHORT[end.getMonth()]} ${end.getFullYear()}`;
  }
}

/** "YYYY-MM-DD" (input[type=date] değeri). */
export function toInputDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function fromInputDate(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}
