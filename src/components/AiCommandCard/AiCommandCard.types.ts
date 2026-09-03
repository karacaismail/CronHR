import type * as React from "react";

/** Why the card's expanded state changed — surfaced through `onExpandedChange`. */
export type AiCommandCardExpansionReason =
  | "trigger-activation"
  | "collapsed-surface-activation"
  | "escape-key"
  | "close-action"
  | "outside-interaction"
  | "controlled-prop";

/** Lifecycle of the single persistent shell. Mirrored on `data-state`. */
export type AiCommandCardExpansionState =
  | "collapsed"
  | "expanding"
  | "expanded"
  | "collapsing";

export type AiCommandCardExpansionEvent =
  | { type: "OPEN_REQUESTED"; reason: AiCommandCardExpansionReason }
  | { type: "OPEN_ANIMATION_COMPLETED" }
  | { type: "CLOSE_REQUESTED"; reason: AiCommandCardExpansionReason }
  | { type: "CLOSE_ANIMATION_COMPLETED" }
  | { type: "TOGGLE_REQUESTED"; reason: AiCommandCardExpansionReason };

/** Query lifecycle is deliberately independent from the expansion lifecycle. */
export type AiQueryState = "idle" | "typing" | "submitting" | "success" | "error";

/** What a query may resolve to: nothing, streamed text, or a rich report. */
export type AiQuerySubmitResult = void | string | React.ReactNode;

export interface AiCommandBreadcrumbItem {
  readonly id: string;
  readonly label: string;
}

export interface AiCommandMenuItem {
  readonly id: string;
  readonly label: string;
  readonly description?: string;
  readonly icon?: React.ReactNode;
  readonly disabled?: boolean;
  readonly badge?: string;
}

export interface AiQuerySuggestion {
  readonly id: string;
  readonly label: string;
}

export interface AiCommandProfileSummary {
  readonly name: string;
  readonly initials: string;
}

export interface AiCommandQueryRequest {
  readonly query: string;
  readonly currentPageId?: string;
  readonly currentPageLabel?: string;
  readonly currentBreadcrumbPath: readonly string[];
}

export interface AiCommandCardProps {
  id?: string;
  className?: string;

  /** Controlled expanded state. Leave undefined for uncontrolled usage. */
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (
    expanded: boolean,
    reason: AiCommandCardExpansionReason,
  ) => void;

  logo: React.ReactNode;
  /** Optional wordmark/placeholder text shown in the light band right of the
   * logo icon (e.g. "Logo" until the real brand asset lands). */
  logoLabel?: string;

  breadcrumbs: readonly AiCommandBreadcrumbItem[];
  menuItems: readonly AiCommandMenuItem[];
  querySuggestions: readonly AiQuerySuggestion[];

  notificationCount?: number;
  profile: AiCommandProfileSummary;

  searchPlaceholder: string;
  submitLabel: string;

  /**
   * Submits an AI query. A resolved string streams into the response area as
   * the AI's answer; a resolved ReactNode (rich report: charts, tables, text)
   * renders there directly; void shows no answer surface.
   */
  onAiQuerySubmit: (
    request: AiCommandQueryRequest,
  ) => AiQuerySubmitResult | Promise<AiQuerySubmitResult>;
  onMenuItemSelect: (menuItem: AiCommandMenuItem) => void;
  onNotificationActivate: () => void;
  onProfileActivate: () => void;
  onLogoActivate?: () => void;

  /** "system" follows prefers-reduced-motion; "reduced" forces it off. */
  motionPreference?: "system" | "full" | "reduced";
}
