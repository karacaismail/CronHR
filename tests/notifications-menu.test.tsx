import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { NotificationsMenu } from "../src/islands/NotificationsMenu";
import { NOTIFICATIONS } from "../src/data/hr";

const ROOT = join(__dirname, "..");

const RECT = { top: 40, bottom: 60, left: 900, right: 940, width: 40, height: 20 } as DOMRect;

describe("NotificationsMenu (üst çubuk bildirim dropdown'u)", () => {
  it("kapalıyken hiçbir şey render etmez", () => {
    render(<NotificationsMenu base="/CronHR/" open={false} anchorRect={null} onClose={vi.fn()} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("açıkken varsayılan olarak Tümü sekmesi aktiftir ve tüm bildirimleri listeler", () => {
    render(<NotificationsMenu base="/CronHR/" open={true} anchorRect={RECT} onClose={vi.fn()} />);
    expect(screen.getByRole("tab", { name: "Tümü" })).toHaveAttribute("aria-selected", "true");
    for (const n of NOTIFICATIONS) {
      expect(screen.getByText(n.title)).toBeInTheDocument();
    }
  });

  it("Yüksek sekmesi yalnızca yüksek öncelikli bildirimleri gösterir", async () => {
    const user = userEvent.setup();
    render(<NotificationsMenu base="/CronHR/" open={true} anchorRect={RECT} onClose={vi.fn()} />);
    await user.click(screen.getByRole("tab", { name: "Yüksek" }));
    const highCount = NOTIFICATIONS.filter((n) => n.priority === "Yüksek").length;
    const lowCount = NOTIFICATIONS.filter((n) => n.priority === "Düşük").length;
    expect(highCount).toBeGreaterThan(0);
    expect(lowCount).toBeGreaterThan(0);
    for (const n of NOTIFICATIONS.filter((x) => x.priority === "Yüksek")) {
      expect(screen.getByText(n.title)).toBeInTheDocument();
    }
    for (const n of NOTIFICATIONS.filter((x) => x.priority !== "Yüksek")) {
      expect(screen.queryByText(n.title)).toBeNull();
    }
  });

  it("altta erişilebilir (>=44px), 'Tümünü göster' bağlantısı vardır ve /bildirimler/'e gider", () => {
    render(<NotificationsMenu base="/CronHR/" open={true} anchorRect={RECT} onClose={vi.fn()} />);
    const link = screen.getByRole("link", { name: /tümünü göster/i });
    expect(link).toHaveAttribute("href", "/CronHR/bildirimler/");
  });

  it("Escape ile kapanır", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<NotificationsMenu base="/CronHR/" open={true} anchorRect={RECT} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});

describe("NotificationsMenu.module.css: 'Tümünü göster' erişilebilir hedef boyutu", () => {
  it(".showAll min-block-size >= 44px içerir", () => {
    const css = readFileSync(join(ROOT, "src/islands/NotificationsMenu.module.css"), "utf8");
    const rule = css.match(/\.showAll\s*\{([^}]*)\}/);
    expect(rule, ".showAll kuralı bulunamadı").not.toBeNull();
    expect(rule![1]).toMatch(/min-block-size:\s*44px/);
  });
});
