import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { TENANTS, TenantSwitcher } from "../src/islands/TenantSwitcher";

const ROOT = join(__dirname, "..");
const read = (p: string) => readFileSync(join(ROOT, p), "utf8");

describe("Tenant verisi", () => {
  it("tam 3 tenant içerir, her biri tenant+şirket adına sahiptir", () => {
    expect(TENANTS.length).toBe(3);
    expect(new Set(TENANTS.map((t) => t.id)).size).toBe(3);
    for (const t of TENANTS) {
      expect(t.tenant.length).toBeGreaterThan(0);
      expect(t.company.length).toBeGreaterThan(0);
    }
  });
});

describe("TenantSwitcher (kenar çubuğu, dropdown)", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it("varsayılan olarak ilk tenant'ı gösterir, combobox rolündedir, liste kapalıdır", () => {
    render(<TenantSwitcher />);
    const button = screen.getByRole("combobox", { name: /tenant/i });
    expect(button).toHaveTextContent(TENANTS[0].tenant);
    expect(button).toHaveTextContent(TENANTS[0].company);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("tıklayınca 3 seçenekli listbox açılır, seçince yalnızca etiket değişir", async () => {
    const user = userEvent.setup();
    render(<TenantSwitcher />);
    const button = screen.getByRole("combobox", { name: /tenant/i });
    await user.click(button);
    const list = screen.getByRole("listbox");
    const opts = within(list).getAllByRole("option");
    expect(opts).toHaveLength(3);

    await user.click(opts[1]);
    expect(button).toHaveTextContent(TENANTS[1].tenant);
    expect(button).toHaveTextContent(TENANTS[1].company);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("seçim localStorage'a yazılır ve yeniden bağlanınca korunur", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<TenantSwitcher />);
    await user.click(screen.getByRole("combobox", { name: /tenant/i }));
    await user.click(within(screen.getByRole("listbox")).getAllByRole("option")[2]);
    expect(localStorage.getItem("cronhr-tenant")).toBe(TENANTS[2].id);
    unmount();

    render(<TenantSwitcher />);
    expect(await screen.findByText(TENANTS[2].company)).toBeInTheDocument();
  });

  it("Escape listeyi kapatır, odak düğmeye döner", async () => {
    const user = userEvent.setup();
    render(<TenantSwitcher />);
    const button = screen.getByRole("combobox", { name: /tenant/i });
    await user.click(button);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(button).toHaveFocus();
  });
});

describe("Sidebar/topbar bağlantısı: tenant anahtarı kenar çubuğunda, topbar'da tekrarlanmaz", () => {
  it("Sidebar.astro TenantSwitcher'ı marka ile menü arasında render eder", () => {
    const sidebar = read("src/components/Sidebar.astro");
    expect(sidebar).toMatch(/from ["'].*islands\/TenantSwitcher["']/);
    expect(sidebar).toMatch(/<TenantSwitcher\b/);
  });

  it("AdminLayout.astro'da artık statik context-switch düğmesi yoktur (tek kaynak: Sidebar)", () => {
    const layout = read("src/layouts/AdminLayout.astro");
    expect(layout).not.toMatch(/context-switch/);
    expect(layout).not.toMatch(/Karaca Teknoloji A\.Ş\./);
  });
});
