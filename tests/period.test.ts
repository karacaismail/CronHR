import { describe, expect, it } from "vitest";
import { fromInputDate, formatPeriodLabel, GRANULARITY_OPTIONS, rangeFor, spanDays, stepRange, toInputDate } from "../src/scripts/period";

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

describe("Görünüm modu seçenekleri", () => {
  it("7 mod içerir: Gün, Hafta, Ay, 3 Ay, 6 Ay, Yıl, Özel aralık", () => {
    expect(GRANULARITY_OPTIONS.map((o) => o.label)).toEqual(["Gün", "Hafta", "Ay", "3 Ay", "6 Ay", "Yıl", "Özel aralık"]);
  });
});

describe("rangeFor — hizalanmış aralıklar", () => {
  it("day: tek günü verir", () => {
    const r = rangeFor("day", d(2026, 9, 9));
    expect(spanDays(r)).toBe(1);
  });

  it("week: pazartesi başlangıçlı 7 gün", () => {
    // 9 Eylül 2026 Çarşamba; o haftanın pazartesisi 7 Eylül
    const r = rangeFor("week", d(2026, 9, 9));
    expect(r.start.getDate()).toBe(7);
    expect(r.start.getDay()).toBe(1); // Pazartesi
    expect(spanDays(r)).toBe(7);
  });

  it("month: ayın tamamı", () => {
    const r = rangeFor("month", d(2026, 9, 15));
    expect(r.start.getDate()).toBe(1);
    expect(r.end.getMonth()).toBe(8); // Eylül (0-index)
    expect(r.end.getDate()).toBe(30);
  });

  it("quarter: 3 aylık, çeyreğe hizalı", () => {
    const r = rangeFor("quarter", d(2026, 8, 1)); // Ağustos → Ç3 (Tem-Eyl)
    expect(r.start.getMonth()).toBe(6); // Temmuz
    expect(r.end.getMonth()).toBe(8); // Eylül
  });

  it("half: 6 aylık, yarıya hizalı", () => {
    const r = rangeFor("half", d(2026, 2, 1)); // Şubat → 1. yarı (Oca-Haz)
    expect(r.start.getMonth()).toBe(0);
    expect(r.end.getMonth()).toBe(5);
  });

  it("year: yılın tamamı", () => {
    const r = rangeFor("year", d(2026, 5, 5));
    expect(r.start.getMonth()).toBe(0);
    expect(r.start.getDate()).toBe(1);
    expect(r.end.getMonth()).toBe(11);
    expect(r.end.getDate()).toBe(31);
  });

  it("custom: verilen aralığı aynen kullanır", () => {
    const custom = { start: d(2026, 9, 3), end: d(2026, 10, 12) };
    const r = rangeFor("custom", d(2026, 9, 9), custom);
    expect(r.start.getDate()).toBe(3);
    expect(r.end.getDate()).toBe(12);
    expect(r.end.getMonth()).toBe(9); // Ekim
  });
});

describe("stepRange — ileri/geri gezinme", () => {
  it("week: bir sonraki/önceki hafta tam 7 gün kayar", () => {
    const cur = rangeFor("week", d(2026, 9, 9));
    const next = stepRange("week", cur, 1);
    expect(next.start.getDate()).toBe(14);
    const prev = stepRange("week", cur, -1);
    expect(prev.start.getDate()).toBe(31); // Ağustos 31
  });

  it("month: bir sonraki ay, gün sayısı farklı olsa da ayın 1'ine hizalanır", () => {
    const cur = rangeFor("month", d(2026, 1, 15)); // Ocak
    const next = stepRange("month", cur, 1);
    expect(next.start.getMonth()).toBe(1); // Şubat
    expect(next.end.getDate()).toBe(28); // 2026 artık yıl değil
  });

  it("custom: aynı uzunluktaki pencereyi kaydırır", () => {
    const cur = rangeFor("custom", d(2026, 9, 9), { start: d(2026, 9, 1), end: d(2026, 9, 10) }); // 10 gün
    const next = stepRange("custom", cur, 1);
    expect(spanDays(next)).toBe(spanDays(cur));
    expect(next.start.getDate()).toBe(11);
  });
});

describe("formatPeriodLabel — Türkçe etiketler", () => {
  it("day/week/month/quarter/half/year/custom için okunur etiket üretir", () => {
    expect(formatPeriodLabel("day", rangeFor("day", d(2026, 9, 9)))).toBe("9 Eylül 2026");
    expect(formatPeriodLabel("week", rangeFor("week", d(2026, 9, 9)))).toBe("7 – 13 Eylül 2026");
    expect(formatPeriodLabel("month", rangeFor("month", d(2026, 9, 9)))).toBe("Eylül 2026");
    expect(formatPeriodLabel("quarter", rangeFor("quarter", d(2026, 9, 9)))).toBe("3. Çeyrek 2026 (Tem–Eyl)");
    expect(formatPeriodLabel("half", rangeFor("half", d(2026, 9, 9)))).toBe("2. Yarı 2026 (Tem–Ara)");
    expect(formatPeriodLabel("year", rangeFor("year", d(2026, 9, 9)))).toBe("2026");
  });
});

describe("input[type=date] dönüşümleri", () => {
  it("toInputDate/fromInputDate birbirini tersine çevirir", () => {
    const date = d(2026, 9, 9);
    expect(toInputDate(date)).toBe("2026-09-09");
    const back = fromInputDate("2026-09-09");
    expect(back.getFullYear()).toBe(2026);
    expect(back.getMonth()).toBe(8);
    expect(back.getDate()).toBe(9);
  });
});
