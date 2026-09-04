import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { AccountMenu } from "../src/islands/AccountMenu";

const ROOT = join(__dirname, "..");

function setup() {
  return render(<AccountMenu base="/CronHR/" name="İsmail Karaca" initials="İK" />);
}

describe("AccountMenu (sol alt 'options' dropdown)", () => {
  it("kapalı başlar; avatar + isim gösterir, ok yukarı bakar ('AI asistan çevrimiçi' yazmaz)", () => {
    setup();
    const trigger = screen.getByRole("button", { name: /karaca/i });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(trigger).toHaveTextContent("İK");
    expect(screen.queryByText(/ai asistan çevrimiçi/i)).toBeNull();
    expect(screen.queryByText(/karaca teknoloji.*120 çalışan/i)).toBeNull();
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("tıklayınca yukarı açılan bir menü gösterir (Ayarlar, Profilim, Hesabım); ok aşağı döner", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: /karaca/i });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    const items = screen.getAllByRole("menuitem").map((i) => i.textContent?.trim());
    expect(items).toEqual(["Ayarlar", "Profilim", "Hesabım"]);
  });

  it("Ayarlar öğesi doğru base'e bağlanır (geliştirici/platform mimarisi menüde yer almaz)", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /karaca/i }));
    expect(screen.getByRole("menuitem", { name: /^ayarlar$/i })).toHaveAttribute("href", "/CronHR/ayarlar/");
    expect(screen.queryByRole("menuitem", { name: /mimari/i })).toBeNull();
  });

  it("Escape ile kapanır, odak tetikleyiciye döner", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: /karaca/i });
    await user.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("bir öğeye tıklayınca menü kapanır", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /karaca/i }));
    await user.click(screen.getByRole("menuitem", { name: /profilim/i }));
    expect(screen.queryByRole("menu")).toBeNull();
  });
});

describe("AccountMenu.module.css: <button> menü öğeleri tarayıcı gövdesini almaz (regresyon)", () => {
  it(".item kuralı appearance:none + border:none + background:transparent içerir", () => {
    const css = readFileSync(join(ROOT, "src/islands/AccountMenu.module.css"), "utf8");
    const rule = css.match(/\.item\s*\{([^}]*)\}/);
    expect(rule, ".item kuralı bulunamadı").not.toBeNull();
    const body = rule![1];
    expect(body).toMatch(/appearance:\s*none/);
    expect(body).toMatch(/border:\s*none/);
    expect(body).toMatch(/background:\s*transparent/);
  });
});
