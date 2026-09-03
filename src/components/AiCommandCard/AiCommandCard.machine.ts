import type {
  AiCommandCardExpansionEvent,
  AiCommandCardExpansionState,
} from "./AiCommandCard.types";

/**
 * Pure transition function for the persistent-shell expansion lifecycle.
 *
 * collapsed -> expanding -> expanded -> collapsing -> collapsed
 *
 * Interrupted animations reverse from the current visual position:
 * a CLOSE while "expanding" goes straight to "collapsing" (and vice versa),
 * which lets CSS transitions retarget without any visual jump and without
 * ever producing a second shell.
 */
export function transitionExpansionState(
  state: AiCommandCardExpansionState,
  event: AiCommandCardExpansionEvent,
): AiCommandCardExpansionState {
  switch (event.type) {
    case "OPEN_REQUESTED":
      return state === "collapsed" || state === "collapsing" ? "expanding" : state;
    case "CLOSE_REQUESTED":
      return state === "expanded" || state === "expanding" ? "collapsing" : state;
    case "TOGGLE_REQUESTED":
      return state === "collapsed" || state === "collapsing"
        ? "expanding"
        : "collapsing";
    case "OPEN_ANIMATION_COMPLETED":
      return state === "expanding" ? "expanded" : state;
    case "CLOSE_ANIMATION_COMPLETED":
      return state === "collapsing" ? "collapsed" : state;
  }
}

export function isVisuallyExpanded(state: AiCommandCardExpansionState): boolean {
  return state === "expanded" || state === "expanding";
}
