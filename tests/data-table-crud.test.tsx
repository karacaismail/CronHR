import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { DataTable } from "../src/islands/DataTable";
import type { ColumnDef } from "../src/islands/tableTypes";

/**
 * "Bütün eksik kalmış CRUD işlemlerini tamamla": tablolarda oluşturma/
 * düzenleme/silme yoktu, yalnızca listeleme vardı. DataTable artık her
 * preset için ortak bir kayıt formu (sütunlardan türetilir) ve her satırda
 * bir işlemler menüsü (Düzenle/Sil) sunuyor.
 */
const COLUMNS: ColumnDef[] = [
  { key: "name", label: "Ad", type: "text", primary: true, sortable: true },
  { key: "team", label: "Takım", type: "enum", options: ["A Takımı", "B Takımı"], filter: true, sortable: true },
];
const ROWS = [
  { id: "r1", name: "Ali Veli", team: "A Takımı" },
  { id: "r2", name: "Ayşe Kara", team: "B Takımı" },
];

function setup() {
  return render(<DataTable columns={COLUMNS} rows={ROWS} rowKey="id" title="Test Tablosu" />);
}

describe("DataTable CRUD — Yeni ekle", () => {
  beforeEach(() => localStorage.clear());

  it("'Yeni ekle' düğmesi sütunlardan üretilen bir form açar", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /yeni ekle/i }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(/^ad$/i)).toBeInTheDocument();
  });

  it("formu doldurup gönderince yeni satır tabloya eklenir", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /yeni ekle/i }));
    await user.type(screen.getByLabelText(/^ad$/i), "Deniz Aksoy");
    await user.click(screen.getByRole("button", { name: /^oluştur$/i }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByText("Deniz Aksoy")).toBeInTheDocument();
    expect(screen.getByText(/1–3 \/ 3/)).toBeInTheDocument();
  });
});

describe("DataTable CRUD — satır işlemleri (Düzenle/Sil)", () => {
  beforeEach(() => localStorage.clear());

  it("her satırda bir işlemler menüsü vardır (Düzenle, Sil)", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /ali veli işlemleri/i }));
    const menu = screen.getByRole("menu");
    expect(within(menu).getByRole("menuitem", { name: /düzenle/i })).toBeInTheDocument();
    expect(within(menu).getByRole("menuitem", { name: /sil/i })).toBeInTheDocument();
  });

  it("Düzenle, formu mevcut değerlerle açar; kaydedince tablo güncellenir", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /ali veli işlemleri/i }));
    await user.click(screen.getByRole("menuitem", { name: /düzenle/i }));
    const nameInput = screen.getByLabelText(/^ad$/i) as HTMLInputElement;
    expect(nameInput.value).toBe("Ali Veli");
    await user.clear(nameInput);
    await user.type(nameInput, "Ali Veli Güncel");
    await user.click(screen.getByRole("button", { name: /^kaydet$/i }));
    expect(screen.getByText("Ali Veli Güncel")).toBeInTheDocument();
    expect(screen.queryByText("Ali Veli")).not.toBeInTheDocument();
  });

  it("Sil, onay ister; onaylanınca satır tablodan kalkar", async () => {
    const user = userEvent.setup();
    setup();
    expect(screen.getByText(/1–2 \/ 2/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /ali veli işlemleri/i }));
    await user.click(screen.getByRole("menuitem", { name: /sil/i }));
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /^sil$/i }));
    expect(screen.queryByText("Ali Veli")).not.toBeInTheDocument();
    expect(screen.getByText(/1–1 \/ 1/)).toBeInTheDocument();
  });

  it("Escape, işlemler menüsünü kapatır", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: /ali veli işlemleri/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
