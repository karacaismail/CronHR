import { useMemo, useState } from "react";
import { Check, PencilSimple, Sparkle } from "@phosphor-icons/react";
import { parseEmployeeText, type EmployeeDraft } from "../ai/quickCreate";
import styles from "./QuickCreate.module.css";

const FIELD_LABELS: Record<keyof EmployeeDraft, string> = {
  name: "Ad soyad",
  startDate: "Başlangıç",
  department: "Departman",
  title: "Ünvan",
  location: "Konum",
  manager: "Yönetici",
};

function formatDate(iso: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-").map(Number);
  const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
  return `${d} ${months[m - 1]} ${y}`;
}

/**
 * Serbest metinden çalışan taslağı: AI alanları çıkarır ve güvenle işaretler.
 * Düşük güvenli alanlar sarı çerçeveyle vurgulanır ve elle düzenlenebilir;
 * hiçbir kayıt onay olmadan oluşturulmaz.
 */
export function QuickCreate() {
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const [draft, setDraft] = useState<EmployeeDraft | null>(null);
  const [edited, setEdited] = useState<Record<string, string>>({});
  const [created, setCreated] = useState(false);

  const run = () => {
    if (!text.trim()) return;
    setThinking(true);
    setCreated(false);
    window.setTimeout(() => {
      setDraft(parseEmployeeText(text));
      setEdited({});
      setThinking(false);
    }, 550);
  };

  const fields = useMemo(() => (draft ? (Object.keys(FIELD_LABELS) as (keyof EmployeeDraft)[]) : []), [draft]);
  const complete = draft ? fields.filter((k) => (edited[k] ?? draft[k].value)).length : 0;

  return (
    <div className={styles.root}>
      <label className={styles.srOnly} htmlFor="quick-create-text">Çalışan bilgisi</label>
      <textarea id="quick-create-text" className="textarea" value={text} onChange={(e) => setText(e.target.value)} placeholder="Örn: Ayşe Kara, 15 Eylül'de Ürün ekibine Ürün Tasarımcısı olarak başlıyor, İstanbul hibrit, yöneticisi Elif Demir." />
      <div className="row-between">
        <span className="field-ai"><Sparkle size={12} weight="fill" /> Alanlar AI ile doldurulur, siz onaylarsınız.</span>
        <button type="button" className="btn btn-ai btn-sm" onClick={run} disabled={thinking || !text.trim()}>
          <Sparkle size={12} weight="fill" /> {thinking ? "Okunuyor…" : "Taslak oluştur"}
        </button>
      </div>

      {draft ? (
        <div className={styles.draft}>
          <div className={styles.draftHead}>
            <span>{complete} / {fields.length} alan dolduruldu</span>
            {created ? <span className={styles.doneTag}><Check size={12} weight="bold" /> Oluşturuldu</span> : null}
          </div>
          <dl className={styles.grid}>
            {fields.map((key) => {
              const f = draft[key];
              const value = edited[key] ?? f.value;
              const low = f.confidence < 0.5;
              return (
                <div key={key} className={styles.field} data-low={low}>
                  <dt>
                    {FIELD_LABELS[key]}
                    {!low && f.value ? <span className={styles.conf}>%{Math.round(f.confidence * 100)}</span> : null}
                  </dt>
                  <dd>
                    <input
                      className={styles.input}
                      value={key === "startDate" && !edited[key] ? formatDate(value) : value}
                      placeholder={low ? "AI emin değil — elle girin" : ""}
                      onChange={(e) => setEdited((s) => ({ ...s, [key]: e.target.value }))}
                    />
                    {low ? <PencilSimple size={13} className={styles.pencil} aria-hidden="true" /> : null}
                  </dd>
                </div>
              );
            })}
          </dl>
          <button type="button" className="btn btn-primary btn-sm" onClick={() => setCreated(true)} disabled={created}>
            <Check size={13} weight="bold" /> {created ? "Kayıt oluşturuldu" : "Onayla ve kaydı oluştur"}
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default QuickCreate;
