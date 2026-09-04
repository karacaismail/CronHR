import { useMemo, useState } from "react";
import { Sparkle } from "@phosphor-icons/react";
import { simulatePayroll } from "../ai/whatIf";
import { tl } from "../data/hr";
import styles from "./WhatIf.module.css";

/**
 * Bordro "ne olur?" simülatörü: kaydırıcılarla anlık AI tahmini. Hiçbir
 * değişikliği kaydetmez; yalnızca senaryo gösterir.
 */
export function WhatIf() {
  const [overtimeCap, setOvertimeCap] = useState(72);
  const [raisePct, setRaisePct] = useState(0);
  const [headcountDelta, setHeadcountDelta] = useState(0);

  const result = useMemo(() => simulatePayroll({ overtimeCap, raisePct, headcountDelta }), [overtimeCap, raisePct, headcountDelta]);
  const base = useMemo(() => simulatePayroll({ overtimeCap: 72, raisePct: 0, headcountDelta: 0 }), []);
  const diff = result.gross - base.gross;

  return (
    <div className={styles.root}>
      <div className={styles.sliders}>
        <label className={styles.slider}>
          <span className={styles.label}>Fazla mesai sınırı<b>{overtimeCap} sa</b></span>
          <input type="range" min={24} max={72} step={4} value={overtimeCap} onChange={(e) => setOvertimeCap(Number(e.target.value))} />
        </label>
        <label className={styles.slider}>
          <span className={styles.label}>Genel zam<b>%{raisePct}</b></span>
          <input type="range" min={0} max={20} step={1} value={raisePct} onChange={(e) => setRaisePct(Number(e.target.value))} />
        </label>
        <label className={styles.slider}>
          <span className={styles.label}>Kadro değişimi<b>{headcountDelta > 0 ? "+" : ""}{headcountDelta}</b></span>
          <input type="range" min={-10} max={10} step={1} value={headcountDelta} onChange={(e) => setHeadcountDelta(Number(e.target.value))} />
        </label>
      </div>
      <div className={styles.result}>
        <div className={styles.stat}><b>{tl(result.gross)}</b><span>tahmini brüt maliyet</span></div>
        <div className={styles.stat}><b className={diff <= 0 ? styles.good : styles.bad}>{diff >= 0 ? "+" : ""}{tl(diff)}</b><span>taban senaryoya göre</span></div>
        <div className={styles.stat}><b>{tl(result.overtimeCost)}</b><span>fazla mesai maliyeti</span></div>
        <div className={styles.stat}><b>{result.headcount}</b><span>kadro</span></div>
      </div>
      <p className={styles.note}><Sparkle size={12} weight="fill" aria-hidden="true" /> {result.note}</p>
    </div>
  );
}

export default WhatIf;
