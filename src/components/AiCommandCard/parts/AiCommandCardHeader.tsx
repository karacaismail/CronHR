import type { ReactNode, RefObject } from "react";
import type {
  AiCommandBreadcrumbItem,
  AiCommandProfileSummary,
} from "../AiCommandCard.types";
import styles from "./AiCommandCardHeader.module.css";
import { AiCommandCardLogo } from "./AiCommandCardLogo";
import { AiCommandCardBreadcrumb } from "./AiCommandCardBreadcrumb";
import { AiCommandTrigger } from "./AiCommandTrigger";
import { AiNotificationAction } from "./AiNotificationAction";
import { AiProfileAction } from "./AiProfileAction";

interface AiCommandCardHeaderProps {
  logo: ReactNode;
  logoLabel?: string;
  breadcrumbs: readonly AiCommandBreadcrumbItem[];
  notificationCount: number;
  profile: AiCommandProfileSummary;
  isCardExpanded: boolean;
  hasPendingQuery: boolean;
  askLabel: string;
  expandedContentId: string;
  triggerRef: RefObject<HTMLButtonElement>;
  /** Static anchor the orb FLIP is measured from (never transformed). */
  triggerHomeRef: RefObject<HTMLSpanElement>;
  /** Wrapper around expanded-only header actions; the controller toggles the
   * `inert` attribute on it (React 18 cannot express inert removal as a prop). */
  profileHostRef: RefObject<HTMLSpanElement>;
  onToggleRequested: () => void;
  onNotificationActivate: () => void;
  onProfileActivate: () => void;
  onLogoActivate?: () => void;
}

/**
 * The single header row shared by both card states. Every element here is
 * mounted exactly once; expansion only repositions/reveals, never remounts.
 */
export function AiCommandCardHeader({
  logo,
  logoLabel,
  breadcrumbs,
  notificationCount,
  profile,
  isCardExpanded,
  hasPendingQuery,
  askLabel,
  expandedContentId,
  triggerRef,
  triggerHomeRef,
  profileHostRef,
  onToggleRequested,
  onNotificationActivate,
  onProfileActivate,
  onLogoActivate,
}: AiCommandCardHeaderProps) {
  return (
    <div className={styles.header} data-slot="ai-command-card-header">
      <AiCommandCardLogo logo={logo} logoLabel={logoLabel} onLogoActivate={onLogoActivate} />

      <AiCommandCardBreadcrumb breadcrumbs={breadcrumbs} isCardExpanded={isCardExpanded} />

      <div className={styles.headerActions}>
        <span ref={triggerHomeRef} className={styles.triggerHome}>
          <AiCommandTrigger
            ref={triggerRef}
            isCardExpanded={isCardExpanded}
            hasPendingQuery={hasPendingQuery}
            askLabel={askLabel}
            expandedContentId={expandedContentId}
            onActivate={onToggleRequested}
          />
        </span>
        <AiNotificationAction
          notificationCount={notificationCount}
          onNotificationActivate={onNotificationActivate}
        />
        <span
          ref={profileHostRef}
          className={styles.profileHost}
          aria-hidden={!isCardExpanded}
        >
          <AiProfileAction profile={profile} onProfileActivate={onProfileActivate} />
        </span>
      </div>
    </div>
  );
}
