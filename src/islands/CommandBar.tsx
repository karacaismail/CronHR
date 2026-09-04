import { useCallback, useEffect, useMemo, useState } from "react";
import CronHRMark from "../components/CronHRMark";
import { AiCommandCard, type AiCommandMenuItem } from "../components/AiCommandCard";
import { COMMAND_CARD_ITEMS, resolvePage } from "../data/nav";
import { simulateHrQuery } from "./hrReports";

interface CommandBarProps {
  /** Aktif sayfa kimliği (nav.tsx: grup ya da yaprak). */
  currentPageId: string;
  /** Sayfa içi alt başlık; breadcrumb'a son kırıntı olarak eklenir. */
  section?: string;
  /** Astro `import.meta.env.BASE_URL` — GitHub Pages alt yolu. */
  base: string;
}

/**
 * AiCommandCard'ın CronHR bağlayıcısı. Kart tek kalıcı yüzeydir; burada
 * yalnızca menü (12 üst grup), breadcrumb, öneriler ve navigasyon bağlanır.
 * Sayfa içindeki "AI'ya sor" düğmeleri `cronhr:ask` olayıyla kartı açar.
 */
export function CommandBar({ currentPageId, section, base }: CommandBarProps) {
  const page = resolvePage(currentPageId);
  const [expanded, setExpanded] = useState(false);
  const [reducedByTheme, setReducedByTheme] = useState(false);

  useEffect(() => {
    const onAsk = () => setExpanded(true);
    const readTheme = () => setReducedByTheme(document.documentElement.dataset.theme === "a11y");
    readTheme();
    window.addEventListener("cronhr:ask", onAsk);
    window.addEventListener("cronhr:theme", readTheme);
    return () => {
      window.removeEventListener("cronhr:ask", onAsk);
      window.removeEventListener("cronhr:theme", readTheme);
    };
  }, []);

  const menuItems = useMemo<AiCommandMenuItem[]>(
    () =>
      COMMAND_CARD_ITEMS.map((item) => {
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
    crumbs.push({ id: page.group.id, label: page.group.label });
    if (page.leaf) crumbs.push({ id: page.leaf.id, label: page.leaf.label });
    if (section) crumbs.push({ id: "section", label: section });
    return crumbs;
  }, [page, section]);

  const suggestions = useMemo(
    () => page.suggestions.map((label, index) => ({ id: `${currentPageId}-s${index}`, label })),
    [page, currentPageId],
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
      logo={<CronHRMark size={18} />}
      logoLabel="CronHR"
      breadcrumbs={breadcrumbs}
      menuItems={menuItems}
      querySuggestions={suggestions}
      notificationCount={4}
      profile={{ name: "İsmail Karaca", initials: "İK" }}
      searchPlaceholder={`${section ?? page.label} için AI'ya sor`}
      submitLabel="Sor"
      onAiQuerySubmit={simulateHrQuery}
      onMenuItemSelect={(item) => go(resolvePage(item.id).href)}
      onNotificationActivate={() => go("/bildirimler/")}
      onProfileActivate={() => go("/calisan-portali/")}
      onLogoActivate={() => go("/")}
      motionPreference={reducedByTheme ? "reduced" : "system"}
    />
  );
}

export default CommandBar;
