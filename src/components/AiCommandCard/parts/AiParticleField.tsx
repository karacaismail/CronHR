import type { ReactNode } from "react";
import styles from "./AiParticleField.module.css";

/**
 * Takımyıldız alanı: 5 deterministik UYDU YILDIZ (3, 4 ve 5 uçlu — nokta
 * değil), 12 sn'lik sonsuz döngüde farklı formasyonlar kurar (3'lü → 5'li →
 * 4'lü), görünür sayı 2-5 arasında değişir. Yıldızlar taban ölçüsünü korur;
 * derinlik hissi scale 1x↔2x (yakınlaşma/uzaklaşma) ile verilir.
 */

/** 3 uçlu kıvılcım yıldızı (Phosphor'da yok; dekoratif mikro glif). */
function ThreePointStar() {
  return (
    <svg viewBox="0 0 10 10" className={styles.starGlyph}>
      <path d="M5 0 C5.6 3 6.8 4.6 9.5 7.6 C6.4 6.6 3.6 6.6 0.5 7.6 C3.2 4.6 4.4 3 5 0 Z" />
    </svg>
  );
}

/** 4 uçlu kıvılcım yıldızı. */
function FourPointStar() {
  return (
    <svg viewBox="0 0 10 10" className={styles.starGlyph}>
      <path d="M5 0 C5.5 3.2 6.8 4.5 10 5 C6.8 5.5 5.5 6.8 5 10 C4.5 6.8 3.2 5.5 0 5 C3.2 4.5 4.5 3.2 5 0 Z" />
    </svg>
  );
}

/** 5 uçlu yıldız. */
function FivePointStar() {
  return (
    <svg viewBox="0 0 10 10" className={styles.starGlyph}>
      <path d="M5 0.5 L6.18 3.9 L9.76 3.95 L6.9 6.1 L7.94 9.55 L5 7.45 L2.06 9.55 L3.1 6.1 L0.24 3.95 L3.82 3.9 Z" />
    </svg>
  );
}

/* Aynı anda görünen uydular birbirinden farklı uç sayısında olacak şekilde
 * dağıtıldı (A:3, B:5, C:4, D:3, E:4). */
const SATELLITES: readonly {
  className: string;
  top: string;
  left: string;
  Star: () => ReactNode;
}[] = [
  { className: "particleA", top: "12%", left: "18%", Star: ThreePointStar },
  { className: "particleB", top: "22%", left: "74%", Star: FivePointStar },
  { className: "particleC", top: "76%", left: "46%", Star: FourPointStar },
  { className: "particleD", top: "40%", left: "88%", Star: ThreePointStar },
  { className: "particleE", top: "70%", left: "10%", Star: FourPointStar },
];

/** Decorative AI constellation. Hidden from AT, never intercepts pointers. */
export function AiParticleField() {
  return (
    <span className={styles.particleField} data-slot="ai-particle-field" aria-hidden="true">
      {SATELLITES.map(({ className, top, left, Star }) => (
        <span key={className} className={`${styles.particle} ${styles[className]}`} style={{ top, left }}>
          <Star />
        </span>
      ))}
    </span>
  );
}
