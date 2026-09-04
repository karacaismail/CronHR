import { useEffect, useState } from "react";
import { ArrowRight, Check, Clock, Sparkle, WarningCircle, X } from "@phosphor-icons/react";
import { rankInsights, type Insight, type Severity } from "../ai/insights";
import styles from "./AiInsightFeed.module.css";

interface Props {
  pageId: string;
  base: string;
  /** Gösterilecek kart sayısı. */
  limit?: number;
}

type StateMap = Record<string, "applied" | "snoozed" | "dismissed">;
const KEY = "cronhr-insights-v1";

function load(): StateMap {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "{}"); } catch { return {}; }
}
function save(s: StateMap) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* noop */ }
}

const ICON: Record<Severity, typeof WarningCircle> = { critical: WarningCircle, warning: WarningCircle, info: Sparkle, good: Check };

/**
 * Proaktif AI içgörü akışı: veriden hesaplanan kartlar, her biri Uygula /
 * Ertele / Kapat alır. Durum tarayıcıda kalıcıdır (aynı öneri tekrar
 * gösterilmez); "Uygula" geri alınabilir toast bırakır.
 */
export function AiInsightFeed({ pageId, base, limit = 4 }: Props) {
  const [state, setState] = useState<StateMap>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => setState(load()), []);

  const update = (id: string, value: StateMap[string] | undefined) => {
    setState((s) => {
      const next = { ...s };
      if (value) next[id] = value; else delete next[id];
      save(next);
      return next;
    });
  };

  const all = rankInsights(pageId);
  const visible = all.filter((i) => state[i.id] !== "dismissed" && state[i.id] !== "snoozed").slice(0, limit);
  if (!visible.length) return null;

  const act = (i: Insight, kind: "apply" | "navigate") => {
    if (kind === "navigate") {
      const prefix = base.endsWith("/") ? base.slice(0, -1) : base;
      window.location.assign(`${prefix}${i.actionHref}`);
      return;
    }
    update(i.id, "applied");
    setToast(i.applyResult);
    window.setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className={styles.feed} aria-label="AI içgörüleri">
      {visible.map((i) => {
        const Icon = ICON[i.severity];
        const applied = state[i.id] === "applied";
        return (
          <article key={i.id} className={styles.card} data-severity={i.severity}>
            <span className={styles.icon} data-severity={i.severity}><Icon size={16} weight={i.severity === "info" ? "fill" : "regular"} /></span>
            <div className={styles.body}>
              <h3>{i.title}</h3>
              <p>{i.body}</p>
              {applied ? (
                <p className={styles.appliedNote}><Check size={12} weight="bold" /> Uygulandı <button type="button" onClick={() => update(i.id, undefined)}>Geri al</button></p>
              ) : (
                <div className={styles.actions}>
                  <button type="button" className={styles.primary} onClick={() => act(i, "apply")}>{i.actionLabel}</button>
                  <button type="button" className={styles.ghost} onClick={() => act(i, "navigate")}>Sayfaya git <ArrowRight size={12} /></button>
                  <button type="button" className={styles.iconGhost} aria-label="Ertele" title="Ertele" onClick={() => update(i.id, "snoozed")}><Clock size={14} /></button>
                  <button type="button" className={styles.iconGhost} aria-label="Kapat" title="Kapat" onClick={() => update(i.id, "dismissed")}><X size={14} /></button>
                </div>
              )}
            </div>
          </article>
        );
      })}
      {toast ? <div className={styles.toast} role="status">{toast}</div> : null}
    </div>
  );
}

export default AiInsightFeed;
