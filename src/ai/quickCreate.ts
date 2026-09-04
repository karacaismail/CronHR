/**
 * Serbest metinden çalışan kaydı çıkarımı (AI form doldurma simülasyonu).
 * Her alan {value, confidence} taşır; düşük güven alanları arayüzde
 * kullanıcı onayı ister (asla sessizce uygulanmaz).
 */
export interface ExtractedField<T = string> {
  value: T;
  confidence: number;
}

export interface EmployeeDraft {
  name: ExtractedField;
  startDate: ExtractedField;
  department: ExtractedField;
  title: ExtractedField;
  location: ExtractedField;
  manager: ExtractedField;
}

const DEPARTMENTS = ["Mühendislik", "Satış", "Destek", "Ürün", "Pazarlama", "Finans", "İnsan Kaynakları"];
const LOCATIONS = ["İstanbul", "Ankara", "İzmir", "Uzaktan"];
const MONTHS: Record<string, number> = { ocak: 1, şubat: 2, subat: 2, mart: 3, nisan: 4, mayıs: 5, mayis: 5, haziran: 6, temmuz: 7, ağustos: 8, agustos: 8, eylül: 9, eylul: 9, ekim: 10, kasım: 11, kasim: 11, aralık: 12, aralik: 12 };

function fold(s: string) { return s.toLocaleLowerCase("tr"); }

function empty(): ExtractedField { return { value: "", confidence: 0 }; }

export function parseEmployeeText(text: string, referenceYear = 2026): EmployeeDraft {
  const draft: EmployeeDraft = { name: empty(), startDate: empty(), department: empty(), title: empty(), location: empty(), manager: empty() };
  const t = text.trim();
  if (!t) return draft;

  const nameMatch = t.match(/^([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)+)/);
  if (nameMatch) draft.name = { value: nameMatch[1].trim(), confidence: 0.95 };

  const dateMatch = t.match(/(\d{1,2})\s*([A-Za-zçğıöşüÇĞİÖŞÜ]+)('?[dt]e|'?[dt]a)?\b/);
  if (dateMatch) {
    const day = Number(dateMatch[1]);
    const monthName = fold(dateMatch[2]).replace(/['’].*$/, "");
    const month = MONTHS[monthName];
    if (month && day >= 1 && day <= 31) draft.startDate = { value: `${referenceYear}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`, confidence: 0.85 };
  } else if (/\byarin\b/.test(fold(t))) {
    draft.startDate = { value: "", confidence: 0.3 };
  }

  for (const dep of DEPARTMENTS) {
    if (t.includes(dep)) { draft.department = { value: dep, confidence: 0.9 }; break; }
  }

  const titleMatch = t.match(/([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+){0,2})\s+olarak/);
  if (titleMatch) draft.title = { value: titleMatch[1].trim(), confidence: 0.88 };

  for (const loc of LOCATIONS) {
    if (t.includes(loc)) { draft.location = { value: loc, confidence: 0.9 }; break; }
  }

  const managerMatch = t.match(/yöneticisi\s+([A-ZÇĞİÖŞÜ][a-zçğıöşü]+(?:\s+[A-ZÇĞİÖŞÜ][a-zçğıöşü]+)+)/i);
  if (managerMatch) draft.manager = { value: managerMatch[1].trim(), confidence: 0.9 };

  return draft;
}
