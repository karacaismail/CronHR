/**
 * Kenar çubuğundaki alıntıyı döndürür: 6-9 sn'lik rastgele bir aralıkta,
 * yumuşak solup-belirme geçişiyle listedeki BİR SONRAKİ alıntıyı (sırayla,
 * rastgele değil) gösterir — hem söz metnini hem yazar atfını günceller.
 * Saf zamanlama/seçim mantığı (nextIndex, pickInterval) DOM'dan bağımsız
 * test edilir; startQuoteRotation yalnızca orkestrasyonu yapar. Hareket
 * tercihine (reduced-motion, a11y, cronhr-motion=off) uyma kararı çağıran
 * tarafa aittir (bkz. Sidebar.astro).
 */
import type { Quote } from "../data/quotes";

/** Sırayla bir sonraki indeks (döngüsel); rastgelelik kullanılmaz. */
export function nextIndex(current: number, total: number): number {
  if (total <= 1) return 0;
  return (current + 1) % total;
}

export function pickInterval(min = 6000, max = 9000, random: () => number = Math.random): number {
  return Math.round(min + random() * (max - min));
}

export interface QuoteRotationOptions {
  minMs?: number;
  maxMs?: number;
  fadeMs?: number;
  random?: () => number;
  /** Test/SSR dışı başlangıç indeksi (varsayılan 0). */
  startAt?: number;
}

export interface QuoteRotationController {
  stop: () => void;
}

export function startQuoteRotation(
  textEl: HTMLElement,
  authorEl: HTMLElement,
  quotes: readonly Quote[],
  opts: QuoteRotationOptions = {},
): QuoteRotationController {
  const { minMs = 6000, maxMs = 9000, fadeMs = 400, random = Math.random, startAt = 0 } = opts;
  let current = startAt;
  let outer: ReturnType<typeof setTimeout> | undefined;
  let inner: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  textEl.style.transition = `opacity ${fadeMs}ms ease`;
  authorEl.style.transition = `opacity ${fadeMs}ms ease`;

  const schedule = () => {
    if (stopped) return;
    outer = setTimeout(() => {
      current = nextIndex(current, quotes.length);
      textEl.style.opacity = "0";
      authorEl.style.opacity = "0";
      inner = setTimeout(() => {
        const q = quotes[current];
        textEl.textContent = q.text;
        authorEl.textContent = q.author;
        textEl.style.opacity = "1";
        authorEl.style.opacity = "1";
      }, fadeMs);
      schedule();
    }, pickInterval(minMs, maxMs, random));
  };
  schedule();

  return {
    stop: () => {
      stopped = true;
      if (outer) clearTimeout(outer);
      if (inner) clearTimeout(inner);
    },
  };
}
