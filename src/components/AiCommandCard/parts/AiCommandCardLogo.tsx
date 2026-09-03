import type { ReactNode } from "react";
import styles from "./AiCommandCardLogo.module.css";

interface AiCommandCardLogoProps {
  logo: ReactNode;
  /** Wordmark/placeholder text in the band right of the icon (e.g. "Logo"). */
  logoLabel?: string;
  onLogoActivate?: () => void;
}

/** Marka alanı: karo ikon + sağa uzayan açık zeminde wordmark/placeholder.
 * Aksiyonu varsa button, yoksa dekoratif statik yüzey. */
export function AiCommandCardLogo({ logo, logoLabel, onLogoActivate }: AiCommandCardLogoProps) {
  const content = (
    <>
      <span className={styles.logoGlyph} aria-hidden="true">
        {logo}
      </span>
      {logoLabel ? <span className={styles.logoLabel}>{logoLabel}</span> : null}
    </>
  );

  if (onLogoActivate) {
    return (
      <button
        type="button"
        className={styles.logoAction}
        data-slot="ai-command-card-logo"
        aria-label={logoLabel ?? "Ana sayfa"}
        onClick={(event) => {
          event.stopPropagation();
          onLogoActivate();
        }}
      >
        {content}
      </button>
    );
  }
  return (
    <span
      className={`${styles.logoAction} ${styles.logoStatic}`}
      data-slot="ai-command-card-logo"
      aria-hidden="true"
    >
      {content}
    </span>
  );
}
