import type { AiCommandBreadcrumbItem } from "../AiCommandCard.types";
import styles from "./AiCommandCardBreadcrumb.module.css";

interface AiCommandCardBreadcrumbProps {
  breadcrumbs: readonly AiCommandBreadcrumbItem[];
  isCardExpanded: boolean;
}

/**
 * One breadcrumb instance for both card states. The current-page node is
 * always the same DOM element; ancestor levels stay mounted and are revealed
 * by CSS when the card expands (hidden from AT while collapsed).
 */
export function AiCommandCardBreadcrumb({
  breadcrumbs,
  isCardExpanded,
}: AiCommandCardBreadcrumbProps) {
  const ancestors = breadcrumbs.slice(0, -1);
  const currentPage = breadcrumbs[breadcrumbs.length - 1];

  return (
    <nav
      className={styles.breadcrumb}
      data-slot="ai-command-card-breadcrumb"
      aria-label="Sayfa konumu"
    >
      <ol className={styles.breadcrumbList}>
        {ancestors.map((item) => (
          <li
            key={item.id}
            className={styles.breadcrumbAncestor}
            aria-hidden={!isCardExpanded}
          >
            <span>{item.label}</span>
            <span className={styles.breadcrumbSeparator} aria-hidden="true">
              /
            </span>
          </li>
        ))}
        {currentPage ? (
          <li
            key={currentPage.id}
            className={styles.currentPage}
            data-slot="ai-command-card-current-page"
            aria-current="page"
            title={currentPage.label}
          >
            {currentPage.label}
          </li>
        ) : null}
      </ol>
    </nav>
  );
}
