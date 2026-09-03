import { forwardRef, type RefObject } from "react";
import type { AiQueryState } from "../AiCommandCard.types";
import styles from "./AiSearchComposer.module.css";

interface AiSearchComposerProps {
  queryValue: string;
  queryState: AiQueryState;
  searchPlaceholder: string;
  onQueryValueChange: (queryValue: string) => void;
  onQuerySubmitRequested: () => void;
  /**
   * Landing pad for the AI orb: the persistent trigger glides here when the
   * card expands and acts as the submit control (there is no separate text
   * submit button; Enter in the input also submits).
   */
  orbSlotRef: RefObject<HTMLSpanElement>;
}

/** The AI query input. Rendered once, revealed on expansion. */
export const AiSearchComposer = forwardRef<HTMLInputElement, AiSearchComposerProps>(
  function AiSearchComposer(
    {
      queryValue,
      queryState,
      searchPlaceholder,
      onQueryValueChange,
      onQuerySubmitRequested,
      orbSlotRef,
    },
    ref,
  ) {
    const isSubmitting = queryState === "submitting";
    return (
      <form
        className={styles.composer}
        data-slot="ai-search-composer"
        onSubmit={(event) => {
          event.preventDefault();
          onQuerySubmitRequested();
        }}
      >
        <input
          ref={ref}
          className={styles.composerInput}
          type="text"
          value={queryValue}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          disabled={isSubmitting}
          onChange={(event) => onQueryValueChange(event.target.value)}
        />
        <span
          ref={orbSlotRef}
          className={styles.orbSlot}
          data-slot="ai-composer-orb-slot"
          aria-hidden="true"
        />
      </form>
    );
  },
);
