import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Select } from "../src/islands/Select";

const OPTIONS = [
  { value: "mon-fri", label: "Pazartesi – Cuma" },
  { value: "mon-sat", label: "Pazartesi – Cumartesi" },
  { value: "shift", label: "Vardiyalı" },
];

function setup(props: Partial<Parameters<typeof Select>[0]> = {}) {
  const onChange = vi.fn();
  const utils = render(<Select id="week" label="Çalışma haftası" options={OPTIONS} value="mon-fri" onChange={onChange} {...props} />);
  const button = screen.getByRole("combobox", { name: /çalışma haftası/i });
  return { ...utils, button, onChange };
}

describe("Select (standart dropdown)", () => {
  it("combobox rolü, etiket ve seçili değerle render olur; liste kapalıdır", () => {
    const { button } = setup();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-haspopup", "listbox");
    expect(button).toHaveTextContent("Pazartesi – Cuma");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("tıklayınca listbox açılır, seçili seçenek aria-selected ve odaklıdır", async () => {
    const user = userEvent.setup();
    const { button } = setup();
    await user.click(button);
    const list = screen.getByRole("listbox");
    const opts = within(list).getAllByRole("option");
    expect(opts).toHaveLength(3);
    expect(opts[0]).toHaveAttribute("aria-selected", "true");
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(list.getAttribute("aria-activedescendant") ?? button.getAttribute("aria-activedescendant")).toBe(opts[0].id);
  });

  it("ArrowDown ile açılır ve gezinir, Enter seçer, odak düğmeye döner", async () => {
    const user = userEvent.setup();
    const { button, onChange } = setup();
    button.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    await user.keyboard("{ArrowDown}{Enter}");
    expect(onChange).toHaveBeenCalledWith("mon-sat");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(button).toHaveFocus();
    expect(button).toHaveTextContent("Pazartesi – Cumartesi");
  });

  it("Escape kapatır, seçim değişmez", async () => {
    const user = userEvent.setup();
    const { button, onChange } = setup();
    await user.click(button);
    await user.keyboard("{ArrowDown}{Escape}");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onChange).not.toHaveBeenCalled();
    expect(button).toHaveFocus();
  });

  it("Home/End ile ilk ve son seçeneğe gider; yazarak (typeahead) eşleşen seçeneğe atlar", async () => {
    const user = userEvent.setup();
    const { button } = setup();
    await user.click(button);
    await user.keyboard("{End}");
    let active = document.getElementById(button.getAttribute("aria-activedescendant")!);
    expect(active).toHaveTextContent("Vardiyalı");
    await user.keyboard("{Home}");
    active = document.getElementById(button.getAttribute("aria-activedescendant")!);
    expect(active).toHaveTextContent("Pazartesi – Cuma");
    await user.keyboard("v");
    active = document.getElementById(button.getAttribute("aria-activedescendant")!);
    expect(active).toHaveTextContent("Vardiyalı");
  });

  it("dışarı tıklayınca kapanır", async () => {
    const user = userEvent.setup();
    const { button } = setup();
    await user.click(button);
    await user.click(document.body);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("yerel <select> render etmez ve Phosphor ok ikonu taşır", () => {
    const { container } = setup();
    expect(container.querySelector("select")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});
