import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, Check, Sparkle, X } from "@phosphor-icons/react";
import styles from "./AiHint.module.css";

interface AiHintProps {
  /** Düğme etiketi; boş bırakılırsa yalnızca ikon. */
  label?: string;
  /** Yanıtın başlığı (ör. "Neden riskli?"). */
  title: string;
  /** Daktilo ile akıtılacak AI yanıtı. */
  answer: string;
  /** Yanıt altındaki öneri aksiyonları. */
  actions?: readonly string[];
  /** inline: akışta genişler. popover: düğmeye bağlı küçük kart (tablolar). */
  mode?: "inline" | "popover";
  /** Düğme görünümü. */
  variant?: "ghost" | "chip" | "field";
}

const TICK_MS = 18;
const CHARS = 3;

/**
 * "Her şeyin içinde AI": tek bir satıra, alana veya karta bağlı küçük AI
 * yardımcısı. Tıklanınca düşünür (600ms), sonra yanıtı daktilo ile akıtır.
 * Kartın tek-yüzey kuralı buraya uygulanmaz; bu, sayfa düzeyinde bir yardımcıdır.
 */
export function AiHint({ label, title, answer, actions = [], mode = "inline", variant = "ghost" }: AiHintProps) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"idle" | "thinking" | "streaming" | "done">("idle");
  const [visible, setVisible] = useState(0);
  const [applied, setApplied] = useState<string | null>(null);
  const [pos, setPos] = useState<{ top: number; left: number; alignRight: boolean } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpenRef = useRef(false);
  const id = useId();

  useEffect(() => {
    if (!open) {
      setPhase("idle");
      setVisible(0);
      setApplied(null);
      // Kapanınca odak tetikleyiciye döner (WCAG 2.4.3).
      if (wasOpenRef.current) buttonRef.current?.focus();
      wasOpenRef.current = false;
      return;
    }
    wasOpenRef.current = true;
    setPhase("thinking");
    const think = setTimeout(() => setPhase("streaming"), 600);
    return () => clearTimeout(think);
  }, [open]);

  useEffect(() => {
    if (phase !== "streaming") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setVisible(answer.length);
      setPhase("done");
      return;
    }
    const timer = setInterval(() => {
      setVisible((n) => {
        const next = n + CHARS;
        if (next >= answer.length) {
          clearInterval(timer);
          setPhase("done");
          return answer.length;
        }
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, [phase, answer]);

  // Inline modda da Escape kapatır (WCAG 2.1.2 / klavye tutarlılığı).
  useEffect(() => {
    if (!open || mode !== "inline") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, mode]);

  useEffect(() => {
    if (!open || mode !== "popover") return;
    const place = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (!rect) return;
      const width = Math.min(340, window.innerWidth - 16);
      const alignRight = rect.right > window.innerWidth / 2;
      const left = alignRight ? Math.max(8, rect.right - width) : Math.min(rect.left, window.innerWidth - width - 8);
      setPos({ top: rect.bottom + 6, left, alignRight });
    };
    place();
    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, mode]);

  const panel = (
    <div
      ref={panelRef}
      id={id}
      role="region"
      aria-label={title}
      aria-live="polite"
      className={styles.panel}
      data-mode={mode}
      data-phase={phase}
      style={mode === "popover" && pos ? { top: pos.top, left: pos.left } : undefined}
    >
      <div className={styles.panelHead}>
        <span className={styles.orb} aria-hidden="true">
          <Sparkle size={11} weight="fill" />
        </span>
        <span className={styles.panelTitle}>{title}</span>
        <button type="button" className={styles.close} aria-label="Kapat" onClick={() => setOpen(false)}>
          <X size={12} />
        </button>
      </div>
      {phase === "thinking" ? (
        <p className={styles.thinking} role="status">
          <span /><span /><span />
          Bağlam okunuyor
        </p>
      ) : (
        <p className={styles.answer}>
          {answer.slice(0, visible)}
          {phase === "streaming" ? <span className={styles.caret} aria-hidden="true" /> : null}
        </p>
      )}
      {phase === "done" && actions.length ? (
        <div className={styles.actions}>
          {actions.map((action) => (
            <button
              key={action}
              type="button"
              className={styles.action}
              data-applied={applied === action}
              onClick={() => setApplied(action)}
            >
              {applied === action ? <Check size={12} weight="bold" /> : <ArrowRight size={12} />}
              {applied === action ? "Uygulandı" : action}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <span className={styles.root} data-mode={mode}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        data-variant={variant}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((v) => !v)}
        title={title}
        aria-label={label ? undefined : title}
      >
        <Sparkle size={13} weight={open ? "fill" : "regular"} />
        {label ? <span>{label}</span> : null}
      </button>
      {open ? panel : null}
    </span>
  );
}

export default AiHint;
