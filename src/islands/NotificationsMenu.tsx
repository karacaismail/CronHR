import { useEffect, useRef, useState } from "react";
import { Lightning, Sparkle, WarningCircle } from "@phosphor-icons/react";
import { NOTIFICATIONS, type Notification } from "../data/hr";
import styles from "./NotificationsMenu.module.css";

export interface NotificationsMenuProps {
  base: string;
  open: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
}

type Tab = "all" | Notification["priority"];

const TABS: readonly { value: Tab; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "Yüksek", label: "Yüksek" },
  { value: "Orta", label: "Orta" },
  { value: "Düşük", label: "Düşük" },
];

function toneIcon(tone: Notification["tone"]) {
  if (tone === "ai") return <Sparkle size={16} weight="fill" />;
  if (tone === "critical" || tone === "warning" || tone === "serious") return <WarningCircle size={16} />;
  return <Lightning size={16} />;
}

function iconTone(tone: Notification["tone"]): string | undefined {
  if (tone === "serious") return "warning";
  if (tone === "ai" || tone === "info") return "ai";
  return tone;
}

function hrefFor(base: string, page: string): string {
  const prefix = base.endsWith("/") ? base.slice(0, -1) : base;
  return page === "panel" ? `${prefix}/` : `${prefix}/${page}/`;
}

export function NotificationsMenu({ base, open, anchorRect, onClose }: NotificationsMenuProps) {
  const [tab, setTab] = useState<Tab>("all");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setTab("all");
    const onDoc = (event: MouseEvent) => {
      const t = event.target as Node;
      if (menuRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open || !anchorRect) return null;

  const items = tab === "all" ? NOTIFICATIONS : NOTIFICATIONS.filter((n) => n.priority === tab);
  const top = anchorRect.bottom + 8;
  const right = Math.max(8, window.innerWidth - anchorRect.right);

  return (
    <div ref={menuRef} className={styles.menu} style={{ top, right }} role="dialog" aria-label="Bildirimler">
      <div className={styles.tabs} role="tablist" aria-label="Bildirim önceliği">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            role="tab"
            aria-selected={tab === t.value}
            className={styles.tab}
            onClick={() => setTab(t.value)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ul className={styles.list}>
        {items.length ? (
          items.map((n) => (
            <li key={n.id} className={styles.item}>
              <span className="list-icon" data-tone={iconTone(n.tone)}>{toneIcon(n.tone)}</span>
              <a className={styles.itemMain} href={hrefFor(base, n.page)} onClick={onClose}>
                <span className={styles.itemTitle}>{n.title}</span>
                <span className={styles.itemBody}>{n.body}</span>
              </a>
              <span className={styles.itemTime}>{n.time}</span>
            </li>
          ))
        ) : (
          <li className={styles.empty}>Bu öncelikte bildirim yok.</li>
        )}
      </ul>
      <a className={styles.showAll} href={`${base.endsWith("/") ? base.slice(0, -1) : base}/bildirimler/`}>
        Tümünü göster
      </a>
    </div>
  );
}

export default NotificationsMenu;
