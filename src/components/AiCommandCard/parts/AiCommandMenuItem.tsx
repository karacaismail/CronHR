import type { AiCommandMenuItem } from "../AiCommandCard.types";
import styles from "./AiCommandMenuItem.module.css";

interface AiCommandMenuItemCardProps {
  menuItem: AiCommandMenuItem;
  /** Position in the reveal choreography; drives the CSS stagger delay. */
  staggerIndex: number;
  onMenuItemSelect: (menuItem: AiCommandMenuItem) => void;
}

export function AiCommandMenuItemCard({
  menuItem,
  staggerIndex,
  onMenuItemSelect,
}: AiCommandMenuItemCardProps) {
  return (
    <li className={styles.menuItem} data-slot="ai-command-menu-item">
      <button
        type="button"
        className={styles.menuItemButton}
        style={{ ["--menu-item-index" as string]: staggerIndex }}
        disabled={menuItem.disabled}
        onClick={() => onMenuItemSelect(menuItem)}
      >
        {menuItem.icon ? (
          <span className={styles.menuItemIcon} aria-hidden="true">
            {menuItem.icon}
          </span>
        ) : null}
        <span className={styles.menuItemLabel}>{menuItem.label}</span>
        {menuItem.description ? (
          <span className={styles.menuItemDescription}>{menuItem.description}</span>
        ) : null}
        {menuItem.badge ? (
          <span className={styles.menuItemBadge}>{menuItem.badge}</span>
        ) : null}
      </button>
    </li>
  );
}
