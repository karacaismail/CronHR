import { describe, expect, it } from "vitest";
import { GEN } from "../src/data/generate";

describe("üretilmiş demo verisi", () => {
  it("deterministik ve hacimli", () => {
    expect(GEN.employees.length).toBe(120);
    expect(GEN.candidates.length).toBeGreaterThanOrEqual(48);
    expect(GEN.leaves.length).toBeGreaterThanOrEqual(40);
    expect(GEN.timesheet.length).toBe(120);
    expect(GEN.exceptions.length).toBeGreaterThanOrEqual(36);
    expect(GEN.overtime.length).toBeGreaterThanOrEqual(30);
    expect(GEN.positions.length).toBeGreaterThanOrEqual(28);
    expect(GEN.docs.length).toBeGreaterThanOrEqual(40);
    expect(GEN.cases.length).toBeGreaterThanOrEqual(24);
    expect(GEN.variablePayments.length).toBeGreaterThanOrEqual(30);
    expect(GEN.deductions.length).toBeGreaterThanOrEqual(20);
    expect(GEN.automations.length).toBeGreaterThanOrEqual(18);
    // aynı tohum → aynı ilk kayıt
    expect(GEN.employees[0].name).toBe("Ahmet Yıldız");
    expect(GEN.employees[10].id).toBe("e11");
  });

  it("çalışanlar tutarlı: benzersiz kimlik, risk 0–100, geçerli tarih", () => {
    const ids = new Set(GEN.employees.map((e) => e.id));
    expect(ids.size).toBe(120);
    for (const e of GEN.employees) {
      expect(e.attritionRisk).toBeGreaterThanOrEqual(0);
      expect(e.attritionRisk).toBeLessThanOrEqual(100);
      expect(e.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it("puantaj her çalışan için bir satır ve saatler tutarlı", () => {
    for (const t of GEN.timesheet) {
      expect(t.workedHours).toBe(t.normalHours + t.overtime);
      expect(t.plannedDays).toBeGreaterThanOrEqual(t.workedDays + t.paidLeave + t.unpaidLeave + t.absent);
    }
  });
});
