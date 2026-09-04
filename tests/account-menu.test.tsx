import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { AccountMenu } from "../src/islands/AccountMenu";

describe("AccountMenu (sol alt 'options' dropdown)", () => {
  it("kapalı başlar; tıklayınca yukarı açılan bir menü gösterir (Yardım, Ayarlar, Profilim, Hesabım)", async () => {
    const user = userEvent.setup();
    render(<AccountMenu base="/CronHR/" />);
    const trigger = screen.getByRole("button", { name: /ai asistan çevrimiçi/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("menu")).toBeNull();

    await user.click(trigger);
    const menu = screen.getByRole("menu");
    expect(menu).toHaveAttribute("data-place", "up");
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const items = screen.getAllByRole("menuitem").map((i) => i.textContent?.trim());
    expect(items).toEqual(["Yardım ve mimari", "Ayarlar", "Profilim", "Hesabım"]);
  });

  it("Yardım ve Ayarlar öğeleri doğru base'e bağlanır", async () => {
    const user = userEvent.setup();
    render(<AccountMenu base="/CronHR/" />);
    await user.click(screen.getByRole("button", { name: /ai asistan çevrimiçi/i }));
    expect(screen.getByRole("menuitem", { name: /yardım ve mimari/i })).toHaveAttribute("href", "/CronHR/mimari/");
    expect(screen.getByRole("menuitem", { name: /^ayarlar$/i })).toHaveAttribute("href", "/CronHR/ayarlar/");
  });

  it("Escape ile kapanır, odak tetikleyiciye döner", async () => {
    const user = userEvent.setup();
    render(<AccountMenu base="/CronHR/" />);
    const trigger = screen.getByRole("button", { name: /ai asistan çevrimiçi/i });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("bir öğeye tıklayınca menü kapanır", async () => {
    const user = userEvent.setup();
    render(<AccountMenu base="/CronHR/" />);
    await user.click(screen.getByRole("button", { name: /ai asistan çevrimiçi/i }));
    await user.click(screen.getByRole("menuitem", { name: /profilim/i }));
    expect(screen.queryByRole("menu")).toBeNull();
  });
});
