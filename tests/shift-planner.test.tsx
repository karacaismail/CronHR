import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ShiftPlanner } from "../src/islands/ShiftPlanner";

describe("ShiftPlanner (görünüm modu denetleyicisi)", () => {
  it("varsayılan olarak Hafta modunda haftalık ızgarayı gösterir", () => {
    render(<ShiftPlanner />);
    expect(screen.getByRole("combobox", { name: /görünüm/i })).toHaveTextContent("Hafta");
    expect(screen.getByText(/7 gün/)).toBeInTheDocument();
  });

  it("Ay moduna geçince ısı haritası (aggregate) görünümüne döner, ızgara kaybolur", async () => {
    const user = userEvent.setup();
    render(<ShiftPlanner />);
    await user.click(screen.getByRole("combobox", { name: /görünüm/i }));
    await user.click(screen.getByRole("option", { name: "Ay" }));
    expect(screen.getAllByText(/Eylül 2026/).length).toBeGreaterThan(0);
    expect(screen.queryByText("Çalışan")).toBeNull();
  });

  it("Özel aralık modunda iki tarih girişi gösterir", async () => {
    const user = userEvent.setup();
    render(<ShiftPlanner />);
    await user.click(screen.getByRole("combobox", { name: /görünüm/i }));
    await user.click(screen.getByRole("option", { name: "Özel aralık" }));
    expect(screen.getByLabelText("Başlangıç tarihi")).toBeInTheDocument();
    expect(screen.getByLabelText("Bitiş tarihi")).toBeInTheDocument();
  });

  it("Sonraki dönem düğmesi haftayı bir sonraki haftaya taşır", async () => {
    const user = userEvent.setup();
    render(<ShiftPlanner />);
    const before = screen.getByText(/Eylül 2026/).textContent;
    await user.click(screen.getByRole("button", { name: "Sonraki dönem" }));
    const after = screen.getByText(/2026/).textContent;
    expect(after).not.toBe(before);
  });

  it("Gün moduna geçince çalışan listesini (avatar + vardiya rozeti) gösterir", async () => {
    const user = userEvent.setup();
    render(<ShiftPlanner />);
    await user.click(screen.getByRole("combobox", { name: /görünüm/i }));
    await user.click(screen.getByRole("option", { name: "Gün" }));
    expect(screen.getByText(/1 gün/)).toBeInTheDocument();
    expect(screen.getAllByText("Mühendislik").length).toBeGreaterThan(0);
  });
});
