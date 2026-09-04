/**
 * Basit sapma tespiti (z-skoru). Grafiklerde AI'nın "bu nokta anormal"
 * işaretlemesi için kullanılır — kaynak repodaki SVG grafiklerin üstüne
 * halka olarak çizilir.
 */
export function findAnomalies(values: readonly number[], threshold = 1.8): number[] {
  if (values.length < 3) return [];
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((a, b) => a + (b - mean) ** 2, 0) / values.length;
  const sd = Math.sqrt(variance);
  if (sd === 0) return [];
  const out: number[] = [];
  values.forEach((v, i) => { if (Math.abs(v - mean) / sd >= threshold) out.push(i); });
  return out;
}
