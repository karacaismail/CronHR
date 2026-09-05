import { useEffect, useId, useMemo, useRef, useState } from "react";
import { X } from "@phosphor-icons/react";
import { EMPLOYEES } from "../data/hr";
import type { ColumnDef, Row } from "./tableTypes";
import { Select } from "./Select";
import styles from "./RecordForm.module.css";

const SUBKEY_LABELS: Record<string, string> = { title: "Ünvan", role: "Pozisyon" };
const EMPLOYEE_REF_KEYS = new Set(["employeeId", "holder"]);

interface FormField {
  key: string;
  label: string;
  kind: "select" | "number" | "employee" | "text";
  options?: readonly string[];
}

function fieldsFor(columns: readonly ColumnDef[], rowKey: string): FormField[] {
  const fields: FormField[] = [];
  for (const col of columns) {
    if (col.key === rowKey && col.type !== "person") continue; // dahili kimlik alanı, otomatik üretilir
    if (EMPLOYEE_REF_KEYS.has(col.key)) fields.push({ key: col.key, label: col.label, kind: "employee" });
    else if (col.type === "enum" && col.options) fields.push({ key: col.key, label: col.label, kind: "select", options: col.options });
    else if (col.type === "number" || col.type === "money" || col.type === "meter") fields.push({ key: col.key, label: col.label, kind: "number" });
    else fields.push({ key: col.key, label: col.label, kind: "text" });
    if (col.subKey && !columns.some((c) => c.key === col.subKey) && !fields.some((f) => f.key === col.subKey)) {
      fields.push({ key: col.subKey, label: SUBKEY_LABELS[col.subKey] ?? col.subKey, kind: "text" });
    }
  }
  return fields;
}

export interface RecordFormProps {
  title: string;
  columns: readonly ColumnDef[];
  rowKey: string;
  /** Boşsa "yeni kayıt" modu; doluysa mevcut satırın düzenlenmesi. */
  initial?: Row | null;
  onCancel: () => void;
  onSubmit: (values: Row) => void;
}

/**
 * Sütun tanımlarından (tableTypes.ColumnDef) üretilen genel CRUD formu.
 * Tüm tablo preset'leri aynı bileşeni kullanır; alan türü sütun `type`'ından
 * çıkarılır (enum→Select, number/money/meter→sayı, employeeId/holder→çalışan
 * seçici, diğerleri→metin).
 */
export function RecordForm({ title, columns, rowKey, initial, onCancel, onSubmit }: RecordFormProps) {
  const fields = useMemo(() => fieldsFor(columns, rowKey), [columns, rowKey]);
  const primaryKey = columns.find((c) => c.primary)?.key ?? fields[0]?.key;
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const f of fields) {
      if (initial) v[f.key] = String((initial as Row)[f.key] ?? "");
      else v[f.key] = f.kind === "select" ? (f.options?.[0] ?? "") : "";
    }
    return v;
  });
  const dialogRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  useEffect(() => {
    dialogRef.current?.querySelector<HTMLElement>("input, button")?.focus();
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const employeeOptions = useMemo(() => EMPLOYEES.map((e) => ({ value: e.id, label: e.name })), []);

  const setField = (key: string, v: string) => setValues((s) => ({ ...s, [key]: v }));

  const submit = () => {
    const out: Row = { ...(initial as Row | undefined) };
    for (const f of fields) out[f.key] = f.kind === "number" ? Number(values[f.key] || 0) : values[f.key];
    onSubmit(out);
  };

  return (
    <div className={`${styles.backdrop} overlay-scrim`} onClick={onCancel}>
      <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby={`${uid}-title`} className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <h3 id={`${uid}-title`}>{title}</h3>
          <button type="button" className={styles.iconBtn} aria-label="Kapat" onClick={onCancel}><X size={14} /></button>
        </div>
        <form
          className={styles.body}
          onSubmit={(e) => { e.preventDefault(); submit(); }}
        >
          <div className={styles.grid}>
            {fields.map((f) => {
              const id = `${uid}-${f.key}`;
              if (f.kind === "select") {
                return (
                  <div key={f.key} className={styles.field}>
                    <Select id={id} label={f.label} options={(f.options ?? []).map((o) => ({ value: o, label: o }))} value={values[f.key] || f.options?.[0]} onChange={(v) => setField(f.key, v)} />
                  </div>
                );
              }
              if (f.kind === "employee") {
                return (
                  <div key={f.key} className={styles.field}>
                    <Select id={id} label={f.label} options={[{ value: "", label: "— Seçilmedi —" }, ...employeeOptions]} value={values[f.key] || ""} onChange={(v) => setField(f.key, v)} />
                  </div>
                );
              }
              return (
                <label key={f.key} className={styles.field}>
                  <span className={styles.label}>{f.label}</span>
                  <input
                    id={id}
                    className={styles.input}
                    type={f.kind === "number" ? "number" : "text"}
                    required={f.key === primaryKey}
                    value={values[f.key] ?? ""}
                    onChange={(e) => setField(f.key, e.target.value)}
                  />
                </label>
              );
            })}
          </div>
          <div className={styles.foot}>
            <button type="button" className={styles.btn} onClick={onCancel}>Vazgeç</button>
            <button type="submit" className={styles.btnPrimary}>{initial ? "Kaydet" : "Oluştur"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordForm;
