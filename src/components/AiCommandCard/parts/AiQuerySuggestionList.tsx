import type { AiQuerySuggestion } from "../AiCommandCard.types";
import styles from "./AiQuerySuggestionList.module.css";

interface AiQuerySuggestionListProps {
  querySuggestions: readonly AiQuerySuggestion[];
  onSuggestionSelect: (suggestion: AiQuerySuggestion) => void;
}

/** Wrapping pill list of query suggestions; never overflows horizontally. */
export function AiQuerySuggestionList({
  querySuggestions,
  onSuggestionSelect,
}: AiQuerySuggestionListProps) {
  if (querySuggestions.length === 0) return null;
  return (
    <ul
      className={styles.suggestionList}
      data-slot="ai-query-suggestions"
      aria-label="Sorgu önerileri"
    >
      {querySuggestions.map((suggestion, index) => (
        <li key={suggestion.id}>
          <button
            type="button"
            className={styles.suggestionPill}
            data-slot="ai-query-suggestion"
            style={{ ["--pill-index" as string]: index }}
            onClick={() => onSuggestionSelect(suggestion)}
          >
            {suggestion.label}
          </button>
        </li>
      ))}
    </ul>
  );
}
