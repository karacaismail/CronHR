import { isValidElement, useEffect, useRef, useState, type ReactNode } from "react";
import { Sparkle } from "@phosphor-icons/react";
import type { AiQueryState } from "../AiCommandCard.types";
import styles from "./AiResponseArea.module.css";

interface AiResponseAreaProps {
  /** Plain string answers stream with a typewriter; rich nodes reveal at once. */
  response: ReactNode;
  queryState: AiQueryState;
  /** "reduced" renders the full answer immediately instead of streaming. */
  motion: "full" | "reduced";
}

const STREAM_TICK_MS = 24;
const STREAM_CHARS_PER_TICK = 3;

/**
 * The AI answer surface. Lives inside the same shell, never a separate panel.
 * String answers get a typewriter reveal; rich report nodes (charts, tables)
 * enter with a single soft reveal.
 */
export function AiResponseArea({ response, queryState, motion }: AiResponseAreaProps) {
  const isTextResponse = typeof response === "string";
  const responseText = isTextResponse ? response : "";
  const [visibleLength, setVisibleLength] = useState(0);
  const streamTimerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    clearInterval(streamTimerRef.current);
    if (!responseText) {
      setVisibleLength(0);
      return;
    }
    if (motion === "reduced") {
      setVisibleLength(responseText.length);
      return;
    }
    setVisibleLength(0);
    streamTimerRef.current = setInterval(() => {
      setVisibleLength((length) => {
        const next = length + STREAM_CHARS_PER_TICK;
        if (next >= responseText.length) {
          clearInterval(streamTimerRef.current);
          return responseText.length;
        }
        return next;
      });
    }, STREAM_TICK_MS);
    return () => clearInterval(streamTimerRef.current);
  }, [responseText, motion]);

  const isThinking = queryState === "submitting";
  const hasRichResponse = !isTextResponse && isValidElement(response);
  if (!isThinking && !responseText && !hasRichResponse) return null;

  return (
    <div className={styles.responseArea} data-slot="ai-command-card-response">
      <span className={styles.responseIcon} aria-hidden="true">
        <Sparkle size={14} weight="fill" />
      </span>
      {isThinking ? (
        <span className={styles.responseThinking} aria-hidden="true">
          <span className={styles.thinkingDot} />
          <span className={styles.thinkingDot} />
          <span className={styles.thinkingDot} />
        </span>
      ) : hasRichResponse ? (
        <div className={styles.responseRich}>{response}</div>
      ) : (
        <p className={styles.responseText}>
          {responseText.slice(0, visibleLength)}
          {visibleLength < responseText.length ? (
            <span className={styles.responseCaret} aria-hidden="true" />
          ) : null}
        </p>
      )}
    </div>
  );
}
