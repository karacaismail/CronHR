import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Buildings, CaretUpDown, Check } from "@phosphor-icons/react";
import selectStyles from "./Select.module.css";

export interface Tenant {
  readonly id: string;
  readonly tenant: string;
  readonly company: string;
}

export const TENANTS: readonly Tenant[] = [
  { id: "karaca", tenant: "Karaca Holding", company: "Karaca Teknoloji A.Ş." },
  { id: "atlas", tenant: "Atlas Holding", company: "Atlas Üretim A.Ş." },
  { id: "marmara", tenant: "Marmara Grup", company: "Marmara Perakende A.Ş." },
] as const;

const STORAGE_KEY = "cronhr-tenant";

function readStoredTenantId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    if (id && TENANTS.some((t) => t.id === id)) return id;
  } catch {
    /* localStorage kapalı olabilir; varsayılana düş. */
  }
  return TENANTS[0].id;
}

/**
 * Tenant/şirket değiştirici — kenar çubuğunda (masaüstü ve mobil çekmece
 * aynı bileşeni paylaşır). Seçim yalnızca bu etiketi değiştirir; sayfa
 * yeniden yüklenmez, başka hiçbir veri değişmez (kozmetik demo anahtarı).
 */
export function TenantSwitcher() {
  const [selectedId, setSelectedId] = useState(TENANTS[0].id);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const uid = useId();
  const listId = `${uid}-tenant-listbox`;
  const optionId = (i: number) => `${uid}-tenant-opt-${i}`;

  useEffect(() => {
    setSelectedId(readStoredTenantId());
  }, []);

  const selectedIndex = Math.max(0, TENANTS.findIndex((t) => t.id === selectedId));
  const current = TENANTS[selectedIndex];

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);

  const openList = useCallback(() => {
    setActive(selectedIndex);
    setOpen(true);
  }, [selectedIndex]);

  const commit = useCallback((index: number) => {
    const t = TENANTS[index];
    if (!t) return;
    setSelectedId(t.id);
    try { localStorage.setItem(STORAGE_KEY, t.id); } catch { /* yoksay */ }
    close();
  }, [close]);

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

  const move = (delta: number) => setActive((i) => Math.min(TENANTS.length - 1, Math.max(0, i + delta)));

  const onKeyDown = (event: React.KeyboardEvent) => {
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
      case "End": event.preventDefault(); setActive(TENANTS.length - 1); break;
      case "Enter":
      case " ": event.preventDefault(); commit(active); break;
      case "Escape": event.preventDefault(); close(); break;
      case "Tab": setOpen(false); break;
    }
  };

  return (
    <div style={{ position: "relative", inlineSize: "100%" }}>
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        className="context-switch"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-activedescendant={open ? optionId(active) : undefined}
        aria-label="Tenant / şirket değiştir"
        title="Tenant / şirket değiştir"
        data-open={open}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKeyDown}
      >
        <Buildings size={15} />
        <span className="context-text">
          <span className="context-tenant">{current.tenant}</span>
          <span className="context-company">{current.company}</span>
        </span>
        <CaretUpDown size={13} color="var(--ink-faint)" />
      </button>
      {open ? (
        <div className="overlay-scrim" style={{ position: "fixed", inset: 0, zIndex: 80 }} onClick={() => close()} aria-hidden="true" />
      ) : null}
      {open ? (
        <ul ref={listRef} id={listId} role="listbox" className={selectStyles.list} data-place="down" aria-label="Tenant / şirket değiştir" tabIndex={-1} style={{ zIndex: 90 }}>
          {TENANTS.map((t, i) => (
            <li
              key={t.id}
              id={optionId(i)}
              role="option"
              aria-selected={i === selectedIndex}
              data-active={i === active}
              className={selectStyles.option}
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => commit(i)}
            >
              <span className={selectStyles.optionLabel}>
                {t.company}
                <span className={selectStyles.optionHint}>{t.tenant}</span>
              </span>
              {i === selectedIndex ? <Check size={14} weight="bold" aria-hidden="true" /> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default TenantSwitcher;
