import { useCallback, useEffect, useId, useRef, useState } from "react";
import { DotsThreeVertical, PencilSimple, Trash } from "@phosphor-icons/react";
import styles from "./RowActionsMenu.module.css";

export interface RowActionsMenuProps {
  /** Erişilebilir isim: "Ahmet Yıldız işlemleri" gibi. */
  label: string;
  onEdit: () => void;
  onDelete: () => void;
}

/**
 * Her tablo satırı için CRUD aksiyon menüsü (Düzenle / Sil). AccountMenu ile
 * aynı desen: overlay-scrim dış tıklamayı yakalar, Escape kapatır, odak
 * kapanınca tetikleyiciye döner.
 */
export function RowActionsMenu({ label, onEdit, onDelete }: RowActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const uid = useId();
  const menuId = `${uid}-row-actions`;

  const close = useCallback((refocus = true) => {
    setOpen(false);
    if (refocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      const t = event.target as Node;
      if (menuRef.current?.contains(t) || buttonRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div className={styles.root} data-slot="row-actions">
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${label} işlemleri`}
        onClick={() => setOpen((o) => !o)}
      >
        <DotsThreeVertical size={16} weight="bold" aria-hidden="true" />
      </button>
      {open ? <div className="overlay-scrim" style={{ position: "fixed", inset: 0, zIndex: 80 }} onClick={() => close()} aria-hidden="true" /> : null}
      {open ? (
        <ul ref={menuRef} id={menuId} role="menu" className={styles.menu} aria-label={`${label} işlemleri`} style={{ zIndex: 90 }}>
          <li role="none">
            <button role="menuitem" type="button" className={styles.item} onClick={() => { close(false); onEdit(); }}>
              <PencilSimple size={15} aria-hidden="true" /> Düzenle
            </button>
          </li>
          <li role="none">
            <button role="menuitem" type="button" className={`${styles.item} ${styles.danger}`} onClick={() => { close(false); onDelete(); }}>
              <Trash size={15} aria-hidden="true" /> Sil
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

export default RowActionsMenu;
