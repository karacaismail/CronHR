import { describe, expect, it } from "vitest";
import { replyTo } from "../src/ai/copilot";
import { rankInsights, INSIGHTS } from "../src/ai/insights";
import { parseEmployeeText } from "../src/ai/quickCreate";
import { simulatePayroll } from "../src/ai/whatIf";
import { findAnomalies } from "../src/ai/anomaly";
import { rewrite } from "../src/ai/composer";
import { bulkVerdicts } from "../src/ai/bulk";
import { GEN } from "../src/data/generate";

describe("Copilot motoru", () => {
  it("sayfa bağlamını bilir ve sayısal gerçeklerle yanıtlar", () => {
    const r = replyTo("bugün kaç kişi izinli?", { pageId: "izinler", history: [] });
    expect(r.text).toMatch(/\d+/);
    expect(r.confidence).toBeGreaterThan(0.5);
    expect(r.sources.length).toBeGreaterThan(0);
    expect(r.followUps.length).toBeGreaterThanOrEqual(2);
  });

  it("aksiyon niyetini aksiyona çevirir (git / uygula)", () => {
    const r = replyTo("riskli çalışanları göster", { pageId: "panel", history: [] });
    expect(r.actions.some((a) => a.kind === "navigate" && a.href.includes("/calisanlar/"))).toBe(true);
    const s = replyTo("slack bağlantısını yenile", { pageId: "panel", history: [] });
    expect(s.actions.some((a) => a.kind === "apply")).toBe(true);
    expect(s.undoable).toBe(true);
  });

  it("çok turlu: 'onlar' önceki konuya bağlanır", () => {
    const first = replyTo("fazla mesai sınırına yaklaşanlar kim?", { pageId: "puantaj", history: [] });
    const second = replyTo("onlara ne önerirsin?", { pageId: "puantaj", history: [{ role: "user", text: "fazla mesai sınırına yaklaşanlar kim?" }, { role: "ai", text: first.text, topic: first.topic }] });
    expect(second.topic).toBe(first.topic);
    expect(second.text).toMatch(/devret|rotasyon|telafi/i);
  });

  it("bilmediğinde dürüsttür ve düşük güven verir", () => {
    const r = replyTo("hava durumu nasıl?", { pageId: "panel", history: [] });
    expect(r.confidence).toBeLessThan(0.5);
    expect(r.text).toMatch(/kapsam|bilmiyorum|yardımcı olamam/i);
  });
});

describe("İçgörü akışı", () => {
  it("içgörüler veriden hesaplanır ve sayfaya göre sıralanır", () => {
    expect(INSIGHTS.length).toBeGreaterThanOrEqual(8);
    const forPanel = rankInsights("panel");
    expect(forPanel.length).toBeGreaterThanOrEqual(3);
    expect(forPanel[0].severity).toBe("critical");
    const forDocs = rankInsights("belgeler");
    expect(forDocs[0].pageIds).toContain("belgeler");
  });
});

describe("Serbest metinden çalışan kaydı", () => {
  it("ad, tarih, departman, ünvan, konum ve yöneticiyi çıkarır", () => {
    const f = parseEmployeeText("Ayşe Kara, 15 Eylül'de Ürün ekibine Ürün Tasarımcısı olarak başlıyor, İstanbul hibrit, yöneticisi Elif Demir.");
    expect(f.name.value).toBe("Ayşe Kara");
    expect(f.startDate.value).toBe("2026-09-15");
    expect(f.department.value).toBe("Ürün");
    expect(f.title.value).toBe("Ürün Tasarımcısı");
    expect(f.location.value).toBe("İstanbul");
    expect(f.manager.value).toBe("Elif Demir");
    expect(f.name.confidence).toBeGreaterThan(0.8);
  });

  it("eksik alanları düşük güvenle bırakır", () => {
    const f = parseEmployeeText("Mehmet Can yarın başlıyor");
    expect(f.name.value).toBe("Mehmet Can");
    expect(f.department.confidence).toBeLessThan(0.5);
    expect(f.department.value).toBe("");
  });
});

describe("Bordro ne-olur simülatörü", () => {
  it("mesai sınırı düşünce maliyet azalır, zam artırır; açıklama üretir", () => {
    const base = simulatePayroll({ overtimeCap: 72, raisePct: 0, headcountDelta: 0 });
    const capped = simulatePayroll({ overtimeCap: 48, raisePct: 0, headcountDelta: 0 });
    const raised = simulatePayroll({ overtimeCap: 72, raisePct: 10, headcountDelta: 0 });
    expect(capped.overtimeCost).toBeLessThan(base.overtimeCost);
    expect(raised.gross).toBeGreaterThan(base.gross);
    expect(capped.note).toMatch(/saat/);
    expect(simulatePayroll({ overtimeCap: 72, raisePct: 0, headcountDelta: 5 }).gross).toBeGreaterThan(base.gross);
  });
});

describe("Sapma tespiti", () => {
  it("z-skoru ile uç noktaları bulur", () => {
    expect(findAnomalies([3, 3.1, 2.9, 3.2, 5.6, 3, 3.1])).toEqual([4]);
    expect(findAnomalies([1, 1, 1, 1])).toEqual([]);
  });
});

describe("Yazı asistanı", () => {
  it("kısaltır, resmileştirir, çevirir ve boş metin için taslak yazar", () => {
    const long = "Bu ay ekipte fazla mesai çok arttı ve bunun sebebi sürüm kapanışı oldu, gelecek ay dengelemeyi düşünüyoruz.";
    expect(rewrite(long, "shorten").length).toBeLessThan(long.length);
    expect(rewrite("selam, izin istiyorum", "formal")).toMatch(/Sayın|talep ediyorum|Saygılarımla/);
    expect(rewrite("İzin talebi onaylandı", "translate")).toMatch(/[Ll]eave|approved/);
    expect(rewrite("", "draft", { context: "rapor" }).length).toBeGreaterThan(40);
  });
});

describe("Toplu AI değerlendirme", () => {
  it("seçili satırlar için karar ve özet üretir", () => {
    const rows = GEN.leaves.filter((l) => l.status === "Bekliyor").slice(0, 5);
    const r = bulkVerdicts("leaves", rows as unknown as Record<string, unknown>[]);
    expect(r.verdicts).toHaveLength(5);
    expect(r.verdicts.every((v) => ["Onayla", "Dikkat", "Reddet"].includes(v.verdict))).toBe(true);
    expect(r.summary).toMatch(/\d+/);
  });
});
