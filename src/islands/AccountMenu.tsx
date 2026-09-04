import { useCallback, useEffect, useId, useRef, useState } from "react";
import { CaretUp, Gear, MapTrifold, User, UserCircle } from "@phosphor-icons/react";
import selectStyles from "./Select.module.css";

export interface AccountMenuProps {
  base: string;
}

// Menü öğesi <a> ise tarayıcı stili sorun çıkarmaz; <button> ise tarayıcının
// varsayılan gövde/kenarlığını (Profilim, Hesabım) burada sıfırlıyoruz.
const BUTTON_RESET: React.CSSProperties = {
  inlineSize: "100%",
  border: "none",
  background: "transparent",
  font: "inherit",
  textAlign: "start",
  cursor: "pointer",
};

/**
 * Sol alt "options" alanı — kenar çubuğunun en altında, gerçek bir dropdown.
 * Yukarı açılır (aşağıda yer yok): yardım/mimari, ayarlar, profil, hesap.
 */
export function AccountMenu({ base }: AccountMenuProps) {
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
    <div style={{ position: "relative", inlineSize: "100%" }}>
      <button
        ref={buttonRef}
        type="button"
        className="ai-status ai-status-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="ai-dot" aria-hidden="true"></span>
        <span>AI asistan çevrimiçi</span>
        <CaretUp size={12} weight="bold" aria-hidden="true" style={{ marginInlineStart: "auto", rotate: open ? "0deg" : "180deg", transition: "rotate 160ms ease" }} />
      </button>
      {open ? (
        <ul ref={menuRef} id={menuId} role="menu" className={selectStyles.list} data-place="up" aria-label="Hesap seçenekleri">
          <li role="none">
            <a role="menuitem" className={selectStyles.option} href={`${base}mimari/`} onClick={() => close(false)}>
              <MapTrifold size={15} aria-hidden="true" /> <span className={selectStyles.optionLabel}>Yardım ve mimari</span>
            </a>
          </li>
          <li role="none">
            <a role="menuitem" className={selectStyles.option} href={`${base}ayarlar/`} onClick={() => close(false)}>
              <Gear size={15} aria-hidden="true" /> <span className={selectStyles.optionLabel}>Ayarlar</span>
            </a>
          </li>
          <li role="none">
            <button role="menuitem" type="button" className={selectStyles.option} style={BUTTON_RESET} onClick={() => close()}>
              <User size={15} aria-hidden="true" /> <span className={selectStyles.optionLabel}>Profilim</span>
            </button>
          </li>
          <li role="none">
            <button role="menuitem" type="button" className={selectStyles.option} style={BUTTON_RESET} onClick={() => close()}>
              <UserCircle size={15} aria-hidden="true" /> <span className={selectStyles.optionLabel}>Hesabım</span>
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
}

export default AccountMenu;
