import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CaretUp, Gear, MapTrifold, User, UserCircle } from "@phosphor-icons/react";
import styles from "./AccountMenu.module.css";

export interface AccountMenuProps {
  base: string;
  name: string;
  initials: string;
}

/**
 * Sol alt "options" alanı — kenar çubuğunun en altında, gerçek bir dropdown.
 * Yukarı açılır (aşağıda yer yok): kapalıyken ok yukarı bakar ("üstte daha
 * fazlası var"), açılınca aşağı döner (içerik zaten üstte belirdi).
 */
export function AccountMenu({ base, name, initials }: AccountMenuProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const uid = useId();
  const menuId = `${uid}-account-menu`;

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
    <div className={styles.root}>
      <button
        ref={buttonRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="avatar" data-hue="0" aria-hidden="true">{initials}</span>
        <span className={styles.name}>{name}</span>
        <CaretUp size={13} weight="bold" aria-hidden="true" className={styles.caret} style={{ rotate: open ? "180deg" : "0deg" }} />
      </button>
      {open ? (
        <ul ref={menuRef} id={menuId} role="menu" className={styles.menu} aria-label="Hesap seçenekleri">
          <li role="none">
            <a role="menuitem" className={styles.item} href={`${base}mimari/`} onClick={() => close(false)}>
              <MapTrifold size={16} aria-hidden="true" /> Yardım ve mimari
            </a>
          </li>
          <li role="none">
            <a role="menuitem" className={styles.item} href={`${base}ayarlar/`} onClick={() => close(false)}>
              <Gear size={16} aria-hidden="true" /> Ayarlar
            </a>
          </li>
          <li role="none">
            <button role="menuitem" type="button" className={styles.item} onClick={() => close()}>
              <User size={16} aria-hidden="true" /> Profilim
            </button>
          </li>
          <li role="none">
            <button role="menuitem" type="button" className={styles.item} onClick={() => close()}>
              <UserCircle size={16} aria-hidden="true" /> Hesabım
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

export default AccountMenu;
