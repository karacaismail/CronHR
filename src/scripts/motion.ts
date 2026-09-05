/**
 * CronHR hareket katmanı (GSAP + ScrollTrigger).
 *
 * İlkeler (GSAP/parallax UX değerlendirmesinden):
 * 1. Giriş koreografisi: sayfa akışı sırasıyla, kısa stagger (40ms), 420ms,
 *    yalnızca opacity + 8px translate; düzen kayması yok.
 * 2. Veri hissi: KPI sayıları 700ms'de sayarak yerleşir; grafik çizgileri
 *    çizilir; ölçüm çubukları 0'dan genişler.
 * 3. Kaydırma bağlamı: fold altındaki paneller görünürken ortaya çıkar
 *    (ScrollTrigger); AI özet orbu ve sayfa başlığı 0,08 oranında parallax
 *    (derinlik sezgisi, baş dönmesi yok).
 * 4. Geri bildirim: basma/hover CSS'te; burada yalnızca giriş ve kaydırma.
 * 5. Saygı: prefers-reduced-motion veya erişilebilirlik modunda hiçbir şey
 *    çalışmaz; her şey son halinde, anında görünür.
 */
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { formatLike, parseNumeric, readMotionContext, revealTargets, shouldAnimate } from "./motion-core";

gsap.registerPlugin(ScrollTrigger);

const EASE = "power2.out";
const SKELETON_DELAY_MS = 550;

/** Gerçek gecikme yok (statik demo veri) — his için kasıtlı, kısa bir bekleme. */
function skeletonThenReveal() {
  const groups = revealTargets(document);
  for (const group of groups) for (const el of group) el.classList.add("is-skeleton");
  window.setTimeout(() => {
    for (const group of groups) for (const el of group) el.classList.remove("is-skeleton");
    revealPage();
    countUp();
    drawCharts();
    parallax();
  }, SKELETON_DELAY_MS);
}

function clearSkeletons() {
  for (const el of document.querySelectorAll(".is-skeleton")) el.classList.remove("is-skeleton");
}

function revealPage() {
  const groups = revealTargets(document);
  const viewportBottom = window.innerHeight;
  let delay = 0;
  for (const group of groups) {
    const first = group[0];
    const inView = first.getBoundingClientRect().top < viewportBottom;
    if (inView) {
      gsap.fromTo(group, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.42, ease: EASE, stagger: 0.04, delay, clearProps: "transform" });
      delay += 0.05;
    } else {
      gsap.set(group, { autoAlpha: 0, y: 10 });
      ScrollTrigger.create({
        trigger: first,
        start: "top 92%",
        once: true,
        onEnter: () => gsap.to(group, { autoAlpha: 1, y: 0, duration: 0.42, ease: EASE, stagger: 0.04, clearProps: "transform" }),
      });
    }
  }
}

function countUp() {
  for (const el of document.querySelectorAll<HTMLElement>(".kpi-value, .stat b")) {
    const text = el.textContent ?? "";
    const parsed = parseNumeric(text);
    if (!parsed || parsed.value === 0) continue;
    const state = { v: 0 };
    el.setAttribute("aria-label", text); // ekran okuyucu son değeri duyar
    gsap.to(state, {
      v: parsed.value,
      duration: 0.7,
      ease: "power3.out",
      onUpdate: () => { el.textContent = formatLike(text, state.v); },
      onComplete: () => { el.textContent = text; el.removeAttribute("aria-label"); },
    });
  }
}

function drawCharts() {
  for (const path of document.querySelectorAll<SVGPathElement>(".chart svg path[stroke]")) {
    const len = path.getTotalLength?.() ?? 0;
    if (!len) continue;
    gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut", delay: 0.2, clearProps: "strokeDasharray,strokeDashoffset" });
  }
  for (const bar of document.querySelectorAll<HTMLElement>(".meter > span, .bar-fill")) {
    const w = bar.style.inlineSize || bar.style.width || getComputedStyle(bar).inlineSize;
    gsap.fromTo(bar, { inlineSize: 0 }, { inlineSize: w, duration: 0.7, ease: EASE, delay: 0.15, clearProps: "inlineSize" });
  }
}

function parallax() {
  const orb = document.querySelector<HTMLElement>(".ai-brief-orb");
  const head = document.querySelector<HTMLElement>(".page-head");
  const targets = [orb, head].filter(Boolean) as HTMLElement[];
  if (!targets.length) return;
  gsap.to(targets, {
    y: (i) => (i === 0 ? -14 : -6),
    ease: "none",
    scrollTrigger: { trigger: document.querySelector(".content"), start: "top top", end: "+=600", scrub: 0.4 },
  });
}

function microFeedback() {
  // Anahtar ve onay kutularında küçük "yerleşme" hissi; CSS geçişlerini tamamlar.
  document.addEventListener("click", (event) => {
    const el = (event.target as HTMLElement).closest<HTMLElement>(".switch, .check-box, .theme-switch button, .segment > button");
    if (!el) return;
    gsap.fromTo(el, { scale: 0.94 }, { scale: 1, duration: 0.28, ease: "back.out(2)", clearProps: "scale" });
  });
}

/** Güvenlik payı: rAF durursa (arka plan sekmesi, gizli pencere) içerik
 * 1,6 sn içinde yine de görünür olur; animasyon asla içeriği rehin almaz. */
function finishAll() {
  clearSkeletons();
  for (const t of gsap.globalTimeline.getChildren(true, true, true)) {
    if (!(t as { scrollTrigger?: unknown }).scrollTrigger) t.progress(1);
  }
  gsap.set(".content > *, .grid > *", { clearProps: "opacity,visibility,transform" });
}

function safetyNet() {
  window.setTimeout(finishAll, 1600);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") finishAll();
  }, { once: true });
}

export function startMotion() {
  const ctx = readMotionContext();
  document.documentElement.dataset.motion = shouldAnimate(ctx) ? "on" : "off";
  if (!shouldAnimate(ctx)) return;
  safetyNet();
  skeletonThenReveal();
  microFeedback();
  window.addEventListener("cronhr:theme", () => {
    const next = readMotionContext();
    document.documentElement.dataset.motion = shouldAnimate(next) ? "on" : "off";
    if (!shouldAnimate(next)) {
      clearSkeletons();
      ScrollTrigger.getAll().forEach((t) => t.kill());
      gsap.globalTimeline.clear();
      gsap.set(".content > *, .grid > *, .ai-brief-orb, .page-head", { clearProps: "all" });
    }
  });
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", startMotion, { once: true });
  else startMotion();
}
