import type { AiCommandMenuItem } from "../AiCommandCard.types";
import styles from "./AiCommandMenuGrid.module.css";
import { AiCommandMenuItemCard } from "./AiCommandMenuItem";

interface AiCommandMenuGridProps {
  menuItems: readonly AiCommandMenuItem[];
  onMenuItemSelect: (menuItem: AiCommandMenuItem) => void;
}

/** Responsive 2/3/4-column command grid driven by container queries. */
export function AiCommandMenuGrid({ menuItems, onMenuItemSelect }: AiCommandMenuGridProps) {
  return (
    <ul className={styles.menuGrid} data-slot="ai-command-menu-grid" aria-label="Komutlar">
      {menuItems.map((menuItem, index) => (
        <AiCommandMenuItemCard
          key={menuItem.id}
          menuItem={menuItem}
          staggerIndex={index}
          onMenuItemSelect={onMenuItemSelect}
        />
      ))}
    </ul>
  );
}
