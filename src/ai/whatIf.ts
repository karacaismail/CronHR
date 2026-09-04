/**
 * Bordro "ne olur?" simülatörü — kaydırıcı girdileriyle anlık tahmini
 * sonuç üretir. Gerçek hesaplama motoru değildir; oranlar PAYROLL taban
 * verisinden türetilir ve açıklanabilir bir not döner.
 */
import { PAYROLL } from "../data/hr";
import { GEN } from "../data/generate";

export interface WhatIfInputs {
  /** Aylık fazla mesai üst sınırı (saat). Düşürmek fazla mesai maliyetini azaltır. */
  overtimeCap: number;
  /** Genel zam yüzdesi. */
  raisePct: number;
  /** Kadro değişimi (+/- kişi). */
  headcountDelta: number;
}

export interface WhatIfResult {
  gross: number;
  overtimeCost: number;
  employerCost: number;
  headcount: number;
  note: string;
}

const AVG_MONTHLY = PAYROLL.gross / PAYROLL.employees;
const OT_HOURLY = 180;

export function simulatePayroll(input: WhatIfInputs): WhatIfResult {
  const totalOt = GEN.timesheet.reduce((s, t) => s + Math.min(t.overtime, input.overtimeCap), 0);
  const cappedCount = GEN.timesheet.filter((t) => t.overtime > input.overtimeCap).length;
  const overtimeCost = Math.round(totalOt * OT_HOURLY);
  const headcount = PAYROLL.employees + input.headcountDelta;
  const baseGross = AVG_MONTHLY * headcount * (1 + input.raisePct / 100);
  const gross = Math.round(baseGross + overtimeCost);
  const employerCost = Math.round(gross * 0.235);
  const parts: string[] = [];
  if (input.overtimeCap < 72) parts.push(`Mesai sınırı ${input.overtimeCap} saate düşünce ${cappedCount} çalışanın fazlası kesiliyor, maliyet ${new Intl.NumberFormat("tr-TR").format(overtimeCost)} ₺'ye iniyor.`);
  if (input.raisePct) parts.push(`%${input.raisePct} zam brüt maliyeti ${new Intl.NumberFormat("tr-TR").format(Math.round(baseGross - AVG_MONTHLY * headcount))} ₺ artırıyor.`);
  if (input.headcountDelta) parts.push(`${input.headcountDelta > 0 ? "+" : ""}${input.headcountDelta} kadro değişimi maliyeti orantılı etkiliyor.`);
  if (!parts.length) parts.push("Taban senaryo: değişiklik yok.");
  return { gross, overtimeCost, employerCost, headcount, note: parts.join(" ") };
}
