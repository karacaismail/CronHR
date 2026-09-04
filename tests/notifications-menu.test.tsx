import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NotificationsMenu } from "../src/islands/NotificationsMenu";
import { NOTIFICATIONS } from "../src/data/hr";
import { rankInsights } from "../src/ai/insights";

const ROOT = join(__dirname, "..");
const RECT = { top: 40, bottom: 60, left: 900, right: 940, width: 40, height: 20 } as DOMRect;

describe("NotificationsMenu (bildirim merkezi — üst çubuk zili)", () => {
  beforeEach(() => localStorage.clear());

  it("kapalıyken hiçbir şey render etmez", () => {
    render(<NotificationsMenu base="/CronHR/" open={false} anchorRect={null} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("açıkken varsayılan olarak Tümü sekmesi aktiftir; içgörüler + bildirimler birlikte listelenir", () => {
    render(<NotificationsMenu base="/CronHR/" open={true} anchorRect={RECT} onClose={vi.fn()} />);
    expect(screen.getByRole("tab", { name: "Tümü" })).toHaveAttribute("aria-selected", "true");
    for (const n of NOTIFICATIONS) {
      expect(screen.getByText(n.title)).toBeInTheDocument();
    }
    for (const i of rankInsights("panel")) {
      expect(screen.getByText(i.title)).toBeInTheDocument();
    }
  });

  it("4 önem sekmesi vardır: Tümü, Kritik, Uyarı, Bilgi", () => {
    render(<NotificationsMenu base="/CronHR/" open={true} anchorRect={RECT} onClose={vi.fn()} />);
    expect(screen.getAllByRole("tab").map((t) => t.textContent)).toEqual(["Tümü", "Kritik", "Uyarı", "Bilgi"]);
  });

  it("bir içgörüde 'Uygula' tıklanınca kalıcı olarak 'Uygulandı' durumuna geçer", async () => {
    const user = userEvent.setup();
    render(<NotificationsMenu base="/CronHR/" open={true} anchorRect={RECT} onClose={vi.fn()} />);
    const first = rankInsights("panel")[0];
    await user.click(screen.getByRole("button", { name: first.actionLabel }));
    expect(screen.getByText(/Uygulandı/)).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem("cronhr-insights-v1")!)[first.id]).toBe("applied");
  });

  it("altta erişilebilir (>=44px), 'Tümünü göster' bağlantısı vardır ve /bildirimler/'e gider", () => {
    render(<NotificationsMenu base="/CronHR/" open={true} anchorRect={RECT} onClose={vi.fn()} />);
    const link = screen.getByRole("link", { name: /tümünü göster/i });
    expect(link).toHaveAttribute("href", "/CronHR/bildirimler/");
  });

  it("Escape ile kapanır; arka plan perdesine tıklayınca da kapanır", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const { container } = render(<NotificationsMenu base="/CronHR/" open={true} anchorRect={RECT} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
    await user.click(container.querySelector(".overlay-scrim")!);
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});

describe("NotificationsMenu: konumlama sabit sağ kenara, zilin tam konumuna bağlı değil", () => {
  it("CSS'te inset-inline-end sabit bir değere ayarlıdır (anchorRect.right kullanılmaz)", () => {
    const css = readFileSync(join(ROOT, "src/islands/NotificationsMenu.module.css"), "utf8");
    const rule = css.match(/\.menu\s*\{([^}]*)\}/);
    expect(rule, ".menu kuralı bulunamadı").not.toBeNull();
    expect(rule![1]).toMatch(/inset-inline-end:/);
  });

  it(".showAll min-block-size >= 44px içerir", () => {
    const css = readFileSync(join(ROOT, "src/islands/NotificationsMenu.module.css"), "utf8");
    const rule = css.match(/\.showAll\s*\{([^}]*)\}/);
    expect(rule![1]).toMatch(/min-block-size:\s*44px/);
  });
});

describe("Kaldırılan AiInsightFeed paneli — Dashboard'da artık ayrı gösterilmiyor", () => {
  it("src/islands/AiInsightFeed.tsx yoktur", () => {
    expect(existsSync(join(ROOT, "src/islands/AiInsightFeed.tsx"))).toBe(false);
  });

  it("src/pages/index.astro artık AiInsightFeed'i import etmez", () => {
    const content = readFileSync(join(ROOT, "src/pages/index.astro"), "utf8");
    expect(content).not.toMatch(/AiInsightFeed/);
  });
});
