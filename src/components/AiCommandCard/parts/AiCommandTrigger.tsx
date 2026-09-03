import { forwardRef } from "react";
import base from "./actionBase.module.css";
import styles from "./AiCommandTrigger.module.css";
import { AiMorphingStar } from "./AiMorphingStar";
import { AiParticleField } from "./AiParticleField";

interface AiCommandTriggerProps {
  isCardExpanded: boolean;
  /** True when the query input holds text — the orb then acts as "ask AI". */
  hasPendingQuery: boolean;
  /** Accessible label for the ask-AI role (the card's `submitLabel`). */
  askLabel: string;
  expandedContentId: string;
  onActivate: () => void;
}

/**
 * The AI orb. One persistent button for the whole lifecycle: it opens the
 * card, then glides into the composer's submit slot (via a translate FLIP the
 * master computes) and becomes the "ask AI" control — never remounted.
 */
export const AiCommandTrigger = forwardRef<HTMLButtonElement, AiCommandTriggerProps>(
  function AiCommandTrigger(
    { isCardExpanded, hasPendingQuery, askLabel, expandedContentId, onActivate },
    ref,
  ) {
    const label = !isCardExpanded
      ? "AI komuta alanını aç"
      : hasPendingQuery
        ? askLabel
        : "AI komuta alanını kapat";
    return (
      <button
        ref={ref}
        type="button"
        className={`${base.iconAction} ${styles.aiTrigger}`}
        data-slot="ai-command-trigger"
        aria-expanded={isCardExpanded}
        aria-controls={expandedContentId}
        aria-label={label}
        onClick={onActivate}
      >
        <span className={styles.aiOrbGlow} aria-hidden="true" />
        <span className={styles.aiOrb} aria-hidden="true">
          <AiMorphingStar size={24} />
        </span>
        <AiParticleField />
      </button>
    );
  },
);
