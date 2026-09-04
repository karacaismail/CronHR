/**
 * Kenar çubuğu mottosunu döndürür: 6-9 sn'lik rastgele bir aralıkta, yumuşak
 * solup-belirme geçişiyle başka bir motto gösterir. Saf zamanlama/seçim
 * mantığı (nextIndex, pickInterval) DOM'dan bağımsız test edilir; startTagline
 * yalnızca orkestrasyonu yapar. Hareket tercihine (reduced-motion, a11y,
 * cronhr-motion=off) uyma kararı çağıran tarafa aittir (bkz. Sidebar.astro).
 */

export function nextIndex(current: number, total: number, random: () => number = Math.random): number {
  if (total <= 1) return 0;
  let next = Math.floor(random() * total);
  if (next === current) next = (next + 1) % total;
  return next;
}

export function pickInterval(min = 6000, max = 9000, random: () => number = Math.random): number {
  return Math.round(min + random() * (max - min));
}

export interface TaglineOptions {
  minMs?: number;
  maxMs?: number;
  fadeMs?: number;
  random?: () => number;
}

export interface TaglineController {
  stop: () => void;
}

export function startTagline(el: HTMLElement, taglines: readonly string[], opts: TaglineOptions = {}): TaglineController {
  const { minMs = 6000, maxMs = 9000, fadeMs = 400, random = Math.random } = opts;
  let current = 0;
  let outer: ReturnType<typeof setTimeout> | undefined;
  let inner: ReturnType<typeof setTimeout> | undefined;
  let stopped = false;

  el.style.transition = `opacity ${fadeMs}ms ease`;

  const schedule = () => {
    if (stopped) return;
    outer = setTimeout(() => {
      current = nextIndex(current, taglines.length, random);
      el.style.opacity = "0";
      inner = setTimeout(() => {
        el.textContent = taglines[current];
        el.style.opacity = "1";
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
