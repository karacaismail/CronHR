import type { AiCommandProfileSummary } from "../AiCommandCard.types";
import base from "./actionBase.module.css";
import styles from "./AiProfileAction.module.css";

interface AiProfileActionProps {
  profile: AiCommandProfileSummary;
  onProfileActivate: () => void;
}

/** Profile control; only visible (and focusable) in the expanded layout. */
export function AiProfileAction({ profile, onProfileActivate }: AiProfileActionProps) {
  return (
    <button
      type="button"
      className={`${base.iconAction} ${styles.profileAction} ${styles.expandedOnlyAction}`}
      data-slot="ai-profile-action"
      aria-label={`Profil: ${profile.name}`}
      onClick={(event) => {
        event.stopPropagation();
        onProfileActivate();
      }}
    >
      <span aria-hidden="true">{profile.initials}</span>
    </button>
  );
}
