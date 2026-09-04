import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CronHRMark from "../components/CronHRMark";
import { AiCommandCard, type AiCommandMenuItem } from "../components/AiCommandCard";
import { EXPAND_DURATION_MS } from "../components/AiCommandCard/AiCommandCard.motion";
import { COMMAND_CARD_ITEMS, resolvePage } from "../data/nav";
import { simulateHrQuery } from "./hrReports";
import NotificationsMenu from "./NotificationsMenu";

/**
 * "AI'ya sor" çipleri (data-ask-ai) `cronhr:ask` olayını sorgu metniyle
 * fırlatır; kart genişledikten sonra kompozitörün gerçek <input>'una
 * yazıp formu programatik olarak gönderiyoruz — kilitli AiCommandCard'ın
 * kaynağına dokunmadan, yalnızca zaten render ettiği herkese açık DOM'u
 * (data-slot="ai-search-composer") kullanıyoruz.
 */
function submitIntoComposer(query: string): boolean {
  const form = document.querySelector<HTMLFormElement>('[data-slot="ai-search-composer"]');
  const input = form?.querySelector<HTMLInputElement>("input");
  if (!form || !input) return false;
  const setValue = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
  setValue?.call(input, query);
  input.dispatchEvent(new Event("input", { bubbles: true }));
  form.requestSubmit();
  return true;
}

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
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifAnchor, setNotifAnchor] = useState<DOMRect | null>(null);
  const askTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const expandedRef = useRef(expanded);
  expandedRef.current = expanded;

  useEffect(() => {
    const onAsk = (event: Event) => {
      const query = (event as CustomEvent<{ query?: string }>).detail?.query?.trim();
      if (askTimeoutRef.current) clearTimeout(askTimeoutRef.current);
      if (!query) {
        setExpanded(true);
        return;
      }
      if (expandedRef.current) {
        // Kart zaten açık: kompozitör zaten görünür, geçiş beklemeden gönder.
        submitIntoComposer(query);
        return;
      }
      setExpanded(true);
      askTimeoutRef.current = setTimeout(() => submitIntoComposer(query), EXPAND_DURATION_MS + 60);
    };
    const readTheme = () => setReducedByTheme(document.documentElement.dataset.theme === "a11y");
    readTheme();
    window.addEventListener("cronhr:ask", onAsk);
    window.addEventListener("cronhr:theme", readTheme);
    return () => {
      window.removeEventListener("cronhr:ask", onAsk);
      window.removeEventListener("cronhr:theme", readTheme);
      if (askTimeoutRef.current) clearTimeout(askTimeoutRef.current);
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

  const toggleNotifications = useCallback(() => {
    setNotifOpen((wasOpen) => {
      if (wasOpen) return false;
      const bell = document.querySelector<HTMLElement>('[data-slot="ai-notification-action"]');
      setNotifAnchor(bell ? bell.getBoundingClientRect() : null);
      return true;
    });
  }, []);

  return (
    <>
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
        onNotificationActivate={toggleNotifications}
        onProfileActivate={() => go("/calisan-portali/")}
        onLogoActivate={() => go("/")}
        motionPreference={reducedByTheme ? "reduced" : "system"}
      />
      <NotificationsMenu base={base} open={notifOpen} anchorRect={notifAnchor} onClose={() => setNotifOpen(false)} />
    </>
  );
}

export default CommandBar;
