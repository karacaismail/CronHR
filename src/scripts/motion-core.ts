/**
 * Hareket çekirdeği — saf, test edilebilir yardımcılar. GSAP'e bağımlı değil.
 * Kural: hareket amaçlıdır (giriş, geri bildirim, süreklilik), kısa (≤ 600ms),
 * ve reduced-motion / erişilebilirlik modunda tamamen kapalıdır.
 */

export interface MotionContext {
  reducedMotion: boolean;
  theme: string | undefined;
  /** Kullanıcı tercihi (localStorage "cronhr-motion" = "off"). */
  userOff?: boolean;
}

export function shouldAnimate(ctx: MotionContext): boolean {
  if (ctx.reducedMotion) return false;
  if (ctx.theme === "a11y") return false;
  if (ctx.userOff) return false;
  return true;
}

export function readMotionContext(): MotionContext {
  const reduced = typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : true;
  let userOff = false;
  try { userOff = typeof localStorage !== "undefined" && localStorage.getItem("cronhr-motion") === "off"; } catch { userOff = false; }
  return { reducedMotion: reduced, theme: typeof document !== "undefined" ? document.documentElement.dataset.theme : undefined, userOff };
}

/** "4.862.400 ₺", "%3,2", "4,86 M ₺", "17 / 20" → ilk sayı (tr-TR biçimi). */
export function parseNumeric(text: string): { value: number; decimals: number } | null {
  const m = text.match(/-?\d{1,3}(?:\.\d{3})+(?:,\d+)?|-?\d+(?:,\d+)?/);
  if (!m) return null;
  const raw = m[0];
  const normalized = raw.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  if (Number.isNaN(value)) return null;
  const decimals = raw.includes(",") ? raw.split(",")[1].length : 0;
  return { value, decimals };
}

/** Sayıyı, örnek metindeki ilk sayının yerine aynı biçimle yazar. */
export function formatLike(template: string, value: number): string {
  const parsed = parseNumeric(template);
  if (!parsed) return template;
  const m = template.match(/-?\d{1,3}(?:\.\d{3})+(?:,\d+)?|-?\d+(?:,\d+)?/)!;
  const formatted = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: parsed.decimals, maximumFractionDigits: parsed.decimals }).format(value);
  return template.replace(m[0], formatted);
}

/** Sayfa akışında sırayla ortaya çıkacak gruplar: her doğrudan blok bir grup;
 * grid içindeki kartlar aynı grupta (stagger). */
export function revealTargets(root: ParentNode): HTMLElement[][] {
  const content = root.querySelector<HTMLElement>(".content");
  if (!content) return [];
  const groups: HTMLElement[][] = [];
  for (const child of Array.from(content.children) as HTMLElement[]) {
    if (child.classList.contains("grid")) {
      const items = Array.from(child.children) as HTMLElement[];
      if (items.length) groups.push(items);
    } else if (child.tagName !== "SCRIPT" && child.tagName !== "STYLE") {
      groups.push([child]);
    }
  }
  return groups;
}
