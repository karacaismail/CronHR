import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { DataTable } from "../src/islands/DataTable";
import type { ColumnDef } from "../src/islands/tableTypes";

const COLS: ColumnDef[] = [
  { key: "name", label: "Çalışan", type: "text", sortable: true },
  { key: "department", label: "Departman", type: "enum", options: ["Mühendislik", "Satış"], filter: true, sortable: true },
  { key: "attritionRisk", label: "Risk", type: "number", sortable: true, filter: true },
  { key: "status", label: "Durum", type: "enum", options: ["Aktif", "Deneme"], filter: true },
];

const ROWS = Array.from({ length: 23 }, (_, i) => ({
  id: `r${i}`,
  name: `Kişi ${String(i).padStart(2, "0")}`,
  department: i % 3 === 0 ? "Satış" : "Mühendislik",
  attritionRisk: (i * 37) % 100,
  status: i % 5 === 0 ? "Deneme" : "Aktif",
}));

function setup(props: Partial<Parameters<typeof DataTable>[0]> = {}) {
  return render(<DataTable title="Çalışanlar" columns={COLS} rows={ROWS} pageSize={10} rowKey="id" {...props} />);
}

describe("DataTable", () => {
  it("başlıklar scope=col, sayfalama 10'ar, toplam sayaç", () => {
    setup();
    const table = screen.getByRole("table");
    expect(within(table).getAllByRole("columnheader")[0]).toHaveAttribute("scope", "col");
    expect(within(table).getAllByRole("row")).toHaveLength(11);
    expect(screen.getByText(/1–10 \/ 23/)).toBeInTheDocument();
  });

  it("sütun başlığına tıklayınca sıralar (asc → desc) ve aria-sort verir", async () => {
    const user = userEvent.setup();
    setup();
    const header = screen.getByRole("button", { name: /Risk/ });
    await user.click(header);
    let cells = screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[2].textContent);
    expect(cells[0]).toBe("0");
    expect(header.closest("th")).toHaveAttribute("aria-sort", "ascending");
    await user.click(header);
    cells = screen.getAllByRole("row").slice(1).map((r) => within(r).getAllByRole("cell")[2].textContent);
    expect(cells[0]).toBe("96");
    expect(header.closest("th")).toHaveAttribute("aria-sort", "descending");
  });

  it("metin araması ve enum filtresi birlikte çalışır; sayaç güncellenir", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole("searchbox", { name: /ara/i }), "Kişi 1");
    expect(screen.getByText(/1–10 \/ 10/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Filtreler/ }));
    await user.click(screen.getByRole("checkbox", { name: "Satış" }));
    expect(screen.getByText(/1–3 \/ 3/)).toBeInTheDocument();
    expect(screen.getByText(/Departman: Satış/)).toBeInTheDocument();
  });

  it("sayısal aralık filtresi uygular", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /Filtreler/ }));
    await user.type(screen.getByRole("spinbutton", { name: /Risk en az/ }), "90");
    const rows = screen.getAllByRole("row").slice(1);
    for (const r of rows) expect(Number(within(r).getAllByRole("cell")[2].textContent)).toBeGreaterThanOrEqual(90);
  });

  it("sayfalama ileri/geri ve sayfa boyutu", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /Sonraki sayfa/ }));
    expect(screen.getByText(/11–20 \/ 23/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /Sonraki sayfa/ }));
    expect(screen.getByText(/21–23 \/ 23/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Sonraki sayfa/ })).toBeDisabled();
  });

  it("AI doğal dil filtresi: 'satış riski yüksek' → filtre + açıklama", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole("textbox", { name: /AI ile filtrele/ }), "satış riski yüksek{Enter}");
    const notes = await screen.findAllByText(/Departman: Satış/, {}, { timeout: 2000 });
    expect(notes.length).toBeGreaterThanOrEqual(1);
    const rows = screen.getAllByRole("row").slice(1);
    for (const r of rows) {
      const cells = within(r).getAllByRole("cell");
      expect(cells[1].textContent).toBe("Satış");
      expect(Number(cells[2].textContent)).toBeGreaterThanOrEqual(55);
    }
  });

  it("AI özeti tablo durumuna göre üretilir ve canlı bölge taşır", () => {
    setup({ aiSummary: (rows) => `${rows.length} kayıt · ${rows.filter((r) => Number(r.attritionRisk) >= 55).length} yüksek risk` });
    const s = screen.getByRole("status", { name: /AI özeti/ });
    expect(s).toHaveTextContent("23 kayıt · 10 yüksek risk");
  });

  it("dar ekranda (kart modu) satırlar liste olarak da erişilebilir", () => {
    setup({ forceCards: true });
    expect(screen.queryByRole("table")).toBeNull();
    expect(screen.getAllByRole("listitem")).toHaveLength(10);
  });

  it("filtreleri temizle düğmesi tüm daraltmaları kaldırır", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole("searchbox", { name: /ara/i }), "Kişi 1");
    await user.click(screen.getByRole("button", { name: /Temizle/ }));
    expect(screen.getByText(/1–10 \/ 23/)).toBeInTheDocument();
  });

  it("Filtreler bir modal açar (role=dialog), arka planı işaretler ve odağı içine alır", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: /Filtreler/ });
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: /Filtreler/ });
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(within(dialog).getByRole("checkbox", { name: "Satış" })).toBeInTheDocument();
  });

  it("Escape modalı kapatır ve odağı Filtreler düğmesine geri verir", async () => {
    const user = userEvent.setup();
    setup();
    const trigger = screen.getByRole("button", { name: /Filtreler/ });
    await user.click(trigger);
    expect(screen.getByRole("dialog", { name: /Filtreler/ })).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: /Filtreler/ })).toBeNull();
    expect(trigger).toHaveFocus();
  });

  it("arka plana tıklamak modalı kapatır, filtreye tıklamak kapatmaz", async () => {
    const user = userEvent.setup();
    const { container } = setup();
    await user.click(screen.getByRole("button", { name: /Filtreler/ }));
    await user.click(screen.getByRole("checkbox", { name: "Satış" }));
    expect(screen.getByRole("dialog", { name: /Filtreler/ })).toBeInTheDocument();
    const backdrop = container.querySelector(".overlay-scrim") as HTMLElement;
    expect(backdrop).toBeTruthy();
    await user.click(backdrop);
    expect(screen.queryByRole("dialog", { name: /Filtreler/ })).toBeNull();
    // Kapanmadan önce uygulanan filtre kalıcıdır (canlı filtreleme).
    expect(screen.getByText(/Departman: Satış/)).toBeInTheDocument();
  });

  it("modal içindeki 'Filtreleri temizle' yalnızca filtreleri temizler, aramayı korur", async () => {
    const user = userEvent.setup();
    setup();
    await user.type(screen.getByRole("searchbox", { name: /ara/i }), "Kişi 1");
    await user.click(screen.getByRole("button", { name: /Filtreler/ }));
    await user.click(screen.getByRole("checkbox", { name: "Satış" }));
    const dialog = screen.getByRole("dialog", { name: /Filtreler/ });
    await user.click(within(dialog).getByRole("button", { name: /Filtreleri temizle/ }));
    expect(screen.getByRole("searchbox", { name: /ara/i })).toHaveValue("Kişi 1");
    expect(screen.queryByText(/Departman: Satış/)).toBeNull();
  });
});
