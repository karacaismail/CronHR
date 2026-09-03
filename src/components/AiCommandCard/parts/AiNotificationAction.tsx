import { Bell } from "@phosphor-icons/react";
import base from "./actionBase.module.css";
import styles from "./AiNotificationAction.module.css";

interface AiNotificationActionProps {
  notificationCount: number;
  onNotificationActivate: () => void;
}

/** Icon-only notifications button; its clicks never bubble into card expansion. */
export function AiNotificationAction({
  notificationCount,
  onNotificationActivate,
}: AiNotificationActionProps) {
  const hasUnread = notificationCount > 0;
  return (
    <button
      type="button"
      className={base.iconAction}
      data-slot="ai-notification-action"
      aria-label={
        hasUnread
          ? `Bildirimler, ${notificationCount} okunmamış`
          : "Bildirimler"
      }
      onClick={(event) => {
        // Interactive child isolation: never let this activate card expansion.
        event.stopPropagation();
        onNotificationActivate();
      }}
    >
      <span aria-hidden="true">
        <Bell size={20} />
      </span>
      {hasUnread ? (
        <span className={styles.notificationBadge} aria-hidden="true">
          {notificationCount > 99 ? "99+" : notificationCount}
        </span>
      ) : null}
    </button>
  );
}
