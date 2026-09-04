import { describe, expect, it } from "vitest";
import { parseAiQuery, applyAiQuery, describeAiQuery } from "../src/islands/aiQuery";
import type { ColumnDef } from "../src/islands/tableTypes";

const COLS: ColumnDef[] = [
  { key: "name", label: "Çalışan", type: "text" },
  { key: "department", label: "Departman", type: "enum", options: ["Mühendislik", "Satış", "Destek"] },
  { key: "location", label: "Konum", type: "enum", options: ["İstanbul", "Ankara", "Uzaktan"] },
  { key: "attritionRisk", label: "Ayrılma riski", type: "number" },
  { key: "status", label: "Durum", type: "enum", options: ["Aktif", "Deneme", "İzinli"] },
];

const ROWS = [
  { name: "Ahmet", department: "Mühendislik", location: "İstanbul", attritionRisk: 78, status: "Aktif" },
  { name: "Elif", department: "Satış", location: "Uzaktan", attritionRisk: 22, status: "Aktif" },
  { name: "Mert", department: "Satış", location: "Ankara", attritionRisk: 41, status: "Deneme" },
  { name: "Selin", department: "Mühendislik", location: "Uzaktan", attritionRisk: 64, status: "Aktif" },
];

describe("AI doğal dil filtresi", () => {
  it("enum değerleri metinden yakalar (Türkçe, büyük/küçük harf duyarsız)", () => {
    const q = parseAiQuery("mühendislik uzaktan çalışanlar", COLS);
    expect(q.filters).toEqual({ department: ["Mühendislik"], location: ["Uzaktan"] });
  });

  it("sayısal eşikleri 'üstü/altı/yüksek/düşük' ile çözer", () => {
    expect(parseAiQuery("riski 60 üstü", COLS).filters).toEqual({ attritionRisk: { min: 60 } });
    expect(parseAiQuery("ayrılma riski yüksek", COLS).filters).toEqual({ attritionRisk: { min: 55 } });
    expect(parseAiQuery("riski 30 altı", COLS).filters).toEqual({ attritionRisk: { max: 30 } });
  });

  it("sıralama niyetini anlar", () => {
    expect(parseAiQuery("riske göre sırala", COLS).sort).toEqual({ key: "attritionRisk", dir: "desc" });
    expect(parseAiQuery("isme göre artan sırala", COLS).sort).toEqual({ key: "name", dir: "asc" });
  });

  it("uygulandığında satırları daraltır ve sıralar", () => {
    const q = parseAiQuery("mühendislik riski yüksek riske göre sırala", COLS);
    const out = applyAiQuery(ROWS, COLS, q);
    expect(out.map((r) => r.name)).toEqual(["Ahmet", "Selin"]);
  });

  it("insan okunur açıklama üretir", () => {
    const q = parseAiQuery("satış deneme", COLS);
    expect(describeAiQuery(q, COLS)).toBe("Departman: Satış · Durum: Deneme");
    expect(describeAiQuery(parseAiQuery("bilinmeyen kelime", COLS), COLS)).toBe("Eşleşen filtre bulunamadı; metin araması uygulandı");
  });
});
