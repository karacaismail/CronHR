import { useEffect, useId, useRef, useState } from "react";
import { ArrowRight, ArrowUp, CaretRight, Check, HandPointing, Sparkle, ThumbsDown, ThumbsUp, X } from "@phosphor-icons/react";
import { replyTo, type CopilotAction, type CopilotTurn } from "../ai/copilot";
import styles from "./Copilot.module.css";

interface Props {
  pageId: string;
  base: string;
}

interface DisplayTurn extends CopilotTurn {
  id: string;
  actions?: CopilotAction[];
  followUps?: string[];
  confidence?: number;
  sources?: string[];
  applied?: string;
  feedback?: "up" | "down";
}

const OPENERS: Record<string, string> = {
  panel: "Bugün dikkat etmem gereken 3 şey ne?",
  calisanlar: "Ayrılma riski yüksek çalışanları listele",
  izinler: "Bugün kaç kişi izinli?",
  puantaj: "Puantaj bordroya hazır mı?",
  bordro: "Bordro anomalilerini göster",
  "ise-alim": "Mülakat bekleyen adaylar kim?",
};

/**
 * CronHR Copilot — sayfa genelinde açılan sohbet çekmecesi. Çok turlu,
 * bağlamı hatırlar (bkz. src/ai/copilot.ts), aksiyon önerir (git/uygula),
 * kaynak ve güven gösterir, geri bildirim ve geri alma sunar. Komuta
 * kartından farklı: burada serbest sohbet ve aksiyon yürütme var.
 */
export function Copilot({ pageId, base }: Props) {
  const [open, setOpen] = useState(false);
  const [turns, setTurns] = useState<DisplayTurn[]>([]);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const uid = useId();
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const openerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener("cronhr:copilot", onOpen);
    return () => window.removeEventListener("cronhr:copilot", onOpen);
  }, []);

  useEffect(() => {
    if (open) window.setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [turns, thinking]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape" && open) { setOpen(false); openerRef.current?.focus(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const send = (message: string) => {
    const trimmed = message.trim();
    if (!trimmed) return;
    const userTurn: DisplayTurn = { id: `${uid}-${turns.length}`, role: "user", text: trimmed };
    setTurns((t) => [...t, userTurn]);
    setText("");
    setThinking(true);
    window.setTimeout(() => {
      const history = [...turns, userTurn];
      const reply = replyTo(trimmed, { pageId, history });
      setTurns((t) => [...t, { id: `${uid}-${t.length}`, role: "ai", text: reply.text, topic: reply.topic, actions: reply.actions, followUps: reply.followUps, confidence: reply.confidence, sources: reply.sources }]);
      setThinking(false);
    }, 650);
  };

  const runAction = (turnId: string, action: CopilotAction) => {
    if (action.kind === "navigate") {
      const prefix = base.endsWith("/") ? base.slice(0, -1) : base;
      window.location.assign(`${prefix}${action.href}`);
      return;
    }
    if (action.kind === "apply") {
      setTurns((ts) => ts.map((t) => (t.id === turnId ? { ...t, applied: action.result ?? "Uygulandı." } : t)));
      setToast(action.result ?? "Uygulandı.");
      window.setTimeout(() => setToast(null), 4000);
    }
  };

  const undo = (turnId: string) => {
    setTurns((ts) => ts.map((t) => (t.id === turnId ? { ...t, applied: undefined } : t)));
    setToast("Geri alındı.");
    window.setTimeout(() => setToast(null), 2500);
  };

  const feedback = (turnId: string, value: "up" | "down") => {
    setTurns((ts) => ts.map((t) => (t.id === turnId ? { ...t, feedback: t.feedback === value ? undefined : value } : t)));
  };

  const opener = OPENERS[pageId] ?? OPENERS.panel;

  return (
    <>
      <button ref={openerRef} type="button" className={styles.launcher} aria-haspopup="dialog" aria-expanded={open} aria-controls={`${uid}-panel`} onClick={() => setOpen(true)}>
        <Sparkle size={18} weight="fill" />
        <span className={styles.srOnly}>CronHR Copilot'u aç</span>
      </button>
      {open ? (
        <div className={`${styles.backdrop} overlay-scrim`} onClick={() => setOpen(false)}>
          <section id={`${uid}-panel`} role="dialog" aria-modal="true" aria-label="CronHR Copilot" className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <header className={styles.head}>
              <span className={styles.orb} aria-hidden="true"><Sparkle size={14} weight="fill" /></span>
              <div className={styles.headText}>
                <h2>CronHR Copilot</h2>
                <p>Sorular, aksiyonlar ve öneriler için sohbet edin</p>
              </div>
              <button type="button" className={styles.close} aria-label="Kapat" onClick={() => setOpen(false)}><X size={16} /></button>
            </header>

            <div ref={listRef} className={styles.list} aria-live="polite">
              {turns.length === 0 ? (
                <div className={styles.empty}>
                  <p>Merhaba, ben CronHR Copilot. Verilerinize dayanarak soruları yanıtlar, aksiyon önerir ve uygularım. Her öneri onayınızla uygulanır.</p>
                  <button type="button" className={styles.suggestion} onClick={() => send(opener)}><Sparkle size={12} weight="fill" /> {opener}</button>
                  <button type="button" className={styles.suggestion} onClick={() => send("Bugün dikkat etmem gereken 3 şey ne?")}><Sparkle size={12} weight="fill" /> Bugün dikkat etmem gereken 3 şey ne?</button>
                </div>
              ) : null}
              {turns.map((t) => (
                <div key={t.id} className={styles.turn} data-role={t.role}>
                  {t.role === "ai" ? <span className={styles.bubbleOrb} aria-hidden="true"><Sparkle size={11} weight="fill" /></span> : null}
                  <div className={styles.bubble}>
                    <p>{t.text}</p>
                    {t.role === "ai" && t.confidence !== undefined ? (
                      <div className={styles.meta}>
                        <span className={styles.confidence} data-level={t.confidence >= 0.7 ? "high" : t.confidence >= 0.4 ? "mid" : "low"}>Güven %{Math.round(t.confidence * 100)}</span>
                        {t.sources?.length ? <span className={styles.sourceList}>Kaynak: {t.sources.join(", ")}</span> : null}
                      </div>
                    ) : null}
                    {t.role === "ai" && t.actions?.length ? (
                      <div className={styles.actions}>
                        {t.actions.map((a) => (
                          <button key={a.label} type="button" className={styles.actionBtn} data-kind={a.kind} onClick={() => runAction(t.id, a)} disabled={a.kind === "apply" && !!t.applied}>
                            {a.kind === "navigate" ? <CaretRight size={12} /> : a.kind === "apply" ? <HandPointing size={12} /> : <ArrowRight size={12} />}
                            {a.label}
                          </button>
                        ))}
                      </div>
                    ) : null}
                    {t.applied ? (
                      <p className={styles.applied}><Check size={12} weight="bold" /> {t.applied} <button type="button" onClick={() => undo(t.id)}>Geri al</button></p>
                    ) : null}
                    {t.role === "ai" ? (
                      <div className={styles.feedbackRow}>
                        <button type="button" aria-pressed={t.feedback === "up"} aria-label="Yararlı" onClick={() => feedback(t.id, "up")}><ThumbsUp size={13} weight={t.feedback === "up" ? "fill" : "regular"} /></button>
                        <button type="button" aria-pressed={t.feedback === "down"} aria-label="Yararlı değil" onClick={() => feedback(t.id, "down")}><ThumbsDown size={13} weight={t.feedback === "down" ? "fill" : "regular"} /></button>
                      </div>
                    ) : null}
                    {t.role === "ai" && t.followUps?.length ? (
                      <div className={styles.followUps}>
                        {t.followUps.map((f) => <button key={f} type="button" onClick={() => send(f)}>{f}</button>)}
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}
              {thinking ? (
                <div className={styles.turn} data-role="ai">
                  <span className={styles.bubbleOrb} aria-hidden="true"><Sparkle size={11} weight="fill" /></span>
                  <div className={styles.bubble}><p className={styles.thinking} role="status"><span /><span /><span />Düşünüyor</p></div>
                </div>
              ) : null}
            </div>

            <form className={styles.composer} onSubmit={(e) => { e.preventDefault(); send(text); }}>
              <input ref={inputRef} type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Bir şey sorun veya isteyin…" aria-label="Copilot'a mesaj yaz" />
              <button type="submit" aria-label="Gönder" disabled={!text.trim()}><ArrowUp size={16} weight="bold" /></button>
            </form>
          </section>
        </div>
      ) : null}
      {toast ? <div className={styles.toast} role="status">{toast}</div> : null}
    </>
  );
}

export default Copilot;
