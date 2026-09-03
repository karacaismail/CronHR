import { useCallback, useEffect, useMemo, useState } from "react";
import { Timer } from "@phosphor-icons/react";
import { AiCommandCard, type AiCommandMenuItem } from "../components/AiCommandCard";
import { NAV_PAGES, findPage } from "../data/nav";
import { simulateHrQuery } from "./hrReports";

interface CommandBarProps {
  /** Aktif sayfa kimliği (nav.tsx). */
  currentPageId: string;
  /** Sayfa içi alt başlık; breadcrumb'a son kırıntı olarak eklenir. */
  section?: string;
  /** Astro `import.meta.env.BASE_URL` — GitHub Pages alt yolu. */
  base: string;
}

/**
 * AiCommandCard'ın CronHR bağlayıcısı. Kart tek kalıcı yüzeydir; burada
 * yalnızca menü, breadcrumb, öneriler ve navigasyon bağlanır.
 * Sayfa içindeki "AI'ya sor" düğmeleri `cronhr:ask` olayıyla kartı açar.
 */
export function CommandBar({ currentPageId, section, base }: CommandBarProps) {
  const page = findPage(currentPageId);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const onAsk = () => setExpanded(true);
    window.addEventListener("cronhr:ask", onAsk);
    return () => window.removeEventListener("cronhr:ask", onAsk);
  }, []);

  const menuItems = useMemo<AiCommandMenuItem[]>(
    () =>
      NAV_PAGES.map((item) => {
        const Icon = item.icon;
        return {
          id: item.id,
          label: item.label,
          description: item.description,
          icon: <Icon size={18} />,
          badge: item.badge,
        };
      }),
    [],
  );

  const breadcrumbs = useMemo(() => {
    const crumbs = [{ id: "home", label: "CronHR" }];
    if (page.id !== "panel") crumbs.push({ id: page.id, label: page.label });
    else crumbs.push({ id: "panel", label: "Panel" });
    if (section) crumbs.push({ id: "section", label: section });
    return crumbs;
  }, [page, section]);

  const suggestions = useMemo(
    () => page.suggestions.map((label, index) => ({ id: `${page.id}-s${index}`, label })),
    [page],
  );

  const go = useCallback(
    (href: string) => {
      const prefix = base.endsWith("/") ? base.slice(0, -1) : base;
      window.location.assign(`${prefix}${href}`);
    },
    [base],
  );

  return (
    <AiCommandCard
      expanded={expanded}
      onExpandedChange={setExpanded}
      logo={<Timer size={18} weight="fill" />}
      logoLabel="CronHR"
      breadcrumbs={breadcrumbs}
      menuItems={menuItems}
      querySuggestions={suggestions}
      notificationCount={4}
      profile={{ name: "İsmail Karaca", initials: "İK" }}
      searchPlaceholder={`${page.label} için AI'ya sor`}
      submitLabel="Sor"
      onAiQuerySubmit={simulateHrQuery}
      onMenuItemSelect={(item) => go(findPage(item.id).href)}
      onNotificationActivate={() => go("/bildirimler/")}
      onProfileActivate={() => go("/ayarlar/")}
      onLogoActivate={() => go("/")}
    />
  );
}

export default CommandBar;
