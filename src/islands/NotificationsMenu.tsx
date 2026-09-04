import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Check, Clock, Lightning, Sparkle, WarningCircle, X } from "@phosphor-icons/react";
import { NOTIFICATIONS, type Notification } from "../data/hr";
import { rankInsights, type Insight, type Severity } from "../ai/insights";
import styles from "./NotificationsMenu.module.css";

export interface NotificationsMenuProps {
  base: string;
  open: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
}

type InsightState = Record<string, "applied" | "snoozed" | "dismissed">;
const INSIGHT_KEY = "cronhr-insights-v1";

function loadInsightState(): InsightState {
  try { return JSON.parse(localStorage.getItem(INSIGHT_KEY) ?? "{}"); } catch { return {}; }
}
function saveInsightState(s: InsightState) {
  try { localStorage.setItem(INSIGHT_KEY, JSON.stringify(s)); } catch { /* yoksay */ }
}

const TABS: readonly { value: "all" | Severity; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "critical", label: "Kritik" },
  { value: "warning", label: "Uyarı" },
  { value: "info", label: "Bilgi" },
];

function notificationSeverity(n: Notification): Severity {
  if (n.tone === "serious") return "warning";
  if (n.tone === "ai" || n.tone === "info") return "info";
  return n.tone as Severity;
}

function notificationIcon(n: Notification) {
  if (n.tone === "ai") return <Sparkle size={16} weight="fill" />;
  if (n.tone === "critical" || n.tone === "warning" || n.tone === "serious") return <WarningCircle size={16} />;
  return <Lightning size={16} />;
}

function hrefFor(base: string, page: string): string {
  const prefix = base.endsWith("/") ? base.slice(0, -1) : base;
  return page === "panel" ? `${prefix}/` : `${prefix}/${page}/`;
}

export function NotificationsMenu({ base, open, anchorRect, onClose }: NotificationsMenuProps) {
  const [tab, setTab] = useState<"all" | Severity>("all");
  const [insightState, setInsightState] = useState<InsightState>({});
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTab("all");
    setInsightState(loadInsightState());
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const insights = useMemo(() => rankInsights("panel").filter((i) => insightState[i.id] !== "dismissed" && insightState[i.id] !== "snoozed"), [insightState]);

  const updateInsight = (id: string, value: InsightState[string] | undefined) => {
    setInsightState((s) => {
      const next = { ...s };
      if (value) next[id] = value; else delete next[id];
      saveInsightState(next);
      return next;
    });
  };

  const applyInsight = (i: Insight) => {
    updateInsight(i.id, "applied");
    setToast(i.applyResult);
    window.setTimeout(() => setToast(null), 4000);
  };

  if (!open || !anchorRect) return null;

  const matchesTab = (severity: Severity) => tab === "all" || tab === severity;
  const visibleInsights = insights.filter((i) => matchesTab(i.severity));
  const visibleNotifications = NOTIFICATIONS.filter((n) => matchesTab(notificationSeverity(n)));
  const total = visibleInsights.length + visibleNotifications.length;
  const top = anchorRect.bottom + 8;

  return (
    <>
      <div className="overlay-scrim" style={{ position: "fixed", inset: 0, zIndex: 80 }} onClick={onClose} aria-hidden="true" />
      <div className={styles.menu} style={{ top }} role="dialog" aria-label="Bildirim merkezi">
        <div className={styles.tabs} role="tablist" aria-label="Öneme göre filtrele">
          {TABS.map((t) => (
            <button key={t.value} type="button" role="tab" aria-selected={tab === t.value} className={styles.tab} onClick={() => setTab(t.value)}>
              {t.label}
            </button>
          ))}
        </div>
        <ul className={styles.list}>
          {visibleInsights.map((i) => {
            const applied = insightState[i.id] === "applied";
            return (
              <li key={i.id} className={styles.insightItem}>
                <span className="list-icon" data-tone={i.severity === "good" ? "good" : i.severity}>
                  {i.severity === "info" ? <Sparkle size={16} weight="fill" /> : <WarningCircle size={16} />}
                </span>
                <div className={styles.itemMain}>
                  <span className={styles.itemTitle}>{i.title}</span>
                  <span className={styles.itemBody}>{i.body}</span>
                  {applied ? (
                    <p className={styles.appliedNote}><Check size={12} weight="bold" /> Uygulandı <button type="button" onClick={() => updateInsight(i.id, undefined)}>Geri al</button></p>
                  ) : (
                    <div className={styles.insightActions}>
                      <button type="button" className={styles.insightPrimary} onClick={() => applyInsight(i)}>{i.actionLabel}</button>
                      <a className={styles.insightGhost} href={`${base.endsWith("/") ? base.slice(0, -1) : base}${i.actionHref}`} onClick={onClose}>
                        Sayfaya git <ArrowRight size={11} />
                      </a>
                      <button type="button" className={styles.iconGhost} aria-label="Ertele" title="Ertele" onClick={() => updateInsight(i.id, "snoozed")}><Clock size={13} /></button>
                      <button type="button" className={styles.iconGhost} aria-label="Kapat" title="Kapat" onClick={() => updateInsight(i.id, "dismissed")}><X size={13} /></button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
          {visibleNotifications.map((n) => (
            <li key={n.id} className={styles.item}>
              <span className="list-icon" data-tone={n.tone === "serious" ? "warning" : n.tone === "ai" ? "ai" : n.tone}>{notificationIcon(n)}</span>
              <a className={styles.itemMain} href={hrefFor(base, n.page)} onClick={onClose}>
                <span className={styles.itemTitle}>{n.title}</span>
                <span className={styles.itemBody}>{n.body}</span>
              </a>
              <span className={styles.itemTime}>{n.time}</span>
            </li>
          ))}
          {total === 0 ? <li className={styles.empty}>Bu kategoride bildirim yok.</li> : null}
        </ul>
        {toast ? <div className={styles.toast} role="status">{toast}</div> : null}
        <a className={styles.showAll} href={`${base.endsWith("/") ? base.slice(0, -1) : base}/bildirimler/`}>
          Tümünü göster
        </a>
      </div>
    </>
  );
}

export default NotificationsMenu;
