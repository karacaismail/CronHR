import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { CaretDown, Check } from "@phosphor-icons/react";
import styles from "./Select.module.css";

export interface SelectOption {
  readonly value: string;
  readonly label: string;
  readonly hint?: string;
}

export interface SelectProps {
  id: string;
  label: string;
  options: readonly SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  /** Etiketi görsel olarak gizle (aria-label kalır). */
  hideLabel?: boolean;
  /** Etiket yanı AI ipucu metni. */
  aiHint?: string;
  disabled?: boolean;
}

/**
 * Standart dropdown — yerel <select> yerine, tüm cihaz ve tarayıcılarda aynı
 * görünen APG "select-only combobox" deseni. Klavye: ArrowUp/Down, Home/End,
 * Enter/Space seçer, Escape kapatır, yazarak (typeahead) atlar. Odak kapanınca
 * düğmeye döner. Liste, yerel menü gibi viewport dışına taşmaz.
 */
export function Select({ id, label, options, value, onChange, hideLabel = false, aiHint, disabled = false }: SelectProps) {
  const [selected, setSelected] = useState<string | undefined>(value ?? options[0]?.value);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [placeUp, setPlaceUp] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const typeahead = useRef<{ text: string; at: number }>({ text: "", at: 0 });
  const uid = useId();
  const listId = `${id}-listbox`;
  const optionId = (i: number) => `${id}-opt-${i}`;

  useEffect(() => {
    if (value !== undefined) setSelected(value);
  }, [value]);

  const selectedIndex = useMemo(() => Math.max(0, options.findIndex((o) => o.value === selected)), [options, selected]);
  const current = options[selectedIndex];

  const openList = useCallback((startAt?: number) => {
    setActive(startAt ?? selectedIndex);
    const rect = buttonRef.current?.getBoundingClientRect();
    setPlaceUp(!!rect && window.innerHeight - rect.bottom < 240 && rect.top > 240);
    setOpen(true);
  }, [selectedIndex]);

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);

  const commit = useCallback((index: number) => {
    const opt = options[index];
    if (!opt) return;
    setSelected(opt.value);
    onChange?.(opt.value);
    close();
  }, [options, onChange, close]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      const t = event.target as Node;
      if (listRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>(`#${CSS.escape(optionId(active))}`)?.scrollIntoView({ block: "nearest" });
  }, [open, active]);

  const move = (delta: number) => setActive((i) => Math.min(options.length - 1, Math.max(0, i + delta)));

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (disabled) return;
    const key = event.key;
    if (!open) {
      if (key === "ArrowDown" || key === "ArrowUp" || key === "Enter" || key === " ") {
        event.preventDefault();
        openList();
      }
      return;
    }
    switch (key) {
      case "ArrowDown": event.preventDefault(); move(1); break;
      case "ArrowUp": event.preventDefault(); move(-1); break;
      case "Home": event.preventDefault(); setActive(0); break;
      case "End": event.preventDefault(); setActive(options.length - 1); break;
      case "Enter":
      case " ": event.preventDefault(); commit(active); break;
      case "Escape": event.preventDefault(); close(); break;
      case "Tab": setOpen(false); break;
      default: {
        if (key.length === 1 && /\S/.test(key)) {
          const now = Date.now();
          const text = now - typeahead.current.at < 700 ? typeahead.current.text + key : key;
          typeahead.current = { text: text.toLocaleLowerCase("tr"), at: now };
          const idx = options.findIndex((o) => o.label.toLocaleLowerCase("tr").startsWith(typeahead.current.text));
          if (idx >= 0) setActive(idx);
        }
      }
    }
  };

  return (
    <div className={styles.field} data-slot="select">
      <label htmlFor={id} className={hideLabel ? styles.hiddenLabel : styles.label}>
        <span>{label}</span>
        {aiHint ? <span className={styles.aiHint}>{aiHint}</span> : null}
      </label>
      <div className={styles.root}>
        <button
          ref={buttonRef}
          id={id}
          type="button"
          role="combobox"
          className={styles.button}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open ? optionId(active) : undefined}
          aria-labelledby={`${uid}-label ${id}`}
          disabled={disabled}
          data-open={open}
          onClick={() => (open ? close() : openList())}
          onKeyDown={onKeyDown}
        >
          <span id={`${uid}-label`} className={styles.srOnly}>{label}</span>
          <span className={styles.value}>{current?.label ?? "Seçin"}</span>
          <CaretDown size={14} className={styles.caret} aria-hidden="true" />
        </button>
        {open ? (
          <ul ref={listRef} id={listId} role="listbox" className={styles.list} data-place={placeUp ? "up" : "down"} aria-label={label} tabIndex={-1}>
            {options.map((o, i) => (
              <li
                key={o.value}
                id={optionId(i)}
                role="option"
                aria-selected={i === selectedIndex}
                data-active={i === active}
                className={styles.option}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => commit(i)}
              >
                <span className={styles.optionLabel}>{o.label}{o.hint ? <span className={styles.optionHint}>{o.hint}</span> : null}</span>
                {i === selectedIndex ? <Check size={14} weight="bold" aria-hidden="true" /> : null}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}

export default Select;
