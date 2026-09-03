import type { AiQueryState } from "../AiCommandCard.types";
import styles from "./AiCommandCardStatus.module.css";

interface AiCommandCardStatusProps {
  queryState: AiQueryState;
  errorMessage?: string;
}

const STATUS_TEXT: Record<AiQueryState, string> = {
  idle: "",
  typing: "",
  submitting: "Sorgu gönderiliyor…",
  success: "Yanıt hazır.",
  error: "Sorgu gönderilemedi. Lütfen yeniden deneyin.",
};

/**
 * Dedicated live region for query lifecycle feedback, so the whole expanded
 * area never becomes an aria-live surface.
 */
export function AiCommandCardStatus({ queryState, errorMessage }: AiCommandCardStatusProps) {
  const text = queryState === "error" && errorMessage ? errorMessage : STATUS_TEXT[queryState];
  return (
    <p
      className={`${styles.status} ${queryState === "error" ? styles.statusError : ""}`}
      data-slot="ai-command-card-status"
      role="status"
      aria-live="polite"
    >
      {text}
    </p>
  );
}
