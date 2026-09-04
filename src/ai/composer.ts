/**
 * Yazı asistanı — kısalt / resmileştir / çevir / taslak yaz. Kural tabanlı
 * dönüşümler; metin kutularının yanında (AiHint benzeri) kullanılabilir.
 */
export type RewriteMode = "shorten" | "formal" | "translate" | "draft";

const EN_DICT: [RegExp, string][] = [
  [/izin talebi/gi, "leave request"],
  [/onayland[iı]/gi, "approved"],
  [/onaylanmışt[iı]r/gi, "has been approved"],
  [/reddedildi/gi, "rejected"],
  [/bekliyor/gi, "pending"],
  [/çalışan/gi, "employee"],
  [/yönetici/gi, "manager"],
];

function foldTr(s: string) { return s.toLocaleLowerCase("tr"); }

export function rewrite(text: string, mode: RewriteMode, opts: { context?: string } = {}): string {
  const t = text.trim();
  switch (mode) {
    case "shorten": {
      if (!t) return "";
      const sentences = t.split(/(?<=[.!?])\s+/);
      const half = Math.max(1, Math.ceil(sentences.length / 2));
      const picked = sentences.slice(0, half).join(" ");
      return picked.length < t.length ? picked : t.slice(0, Math.ceil(t.length * 0.6)).trim() + "…";
    }
    case "formal": {
      if (!t) return "Sayın yetkili,\n\nKonuyla ilgili bilgilerinizi rica ederim.\n\nSaygılarımla.";
      let out = t;
      out = out.replace(/^selam[,!]?\s*/i, "Sayın yetkili,\n\n");
      out = out.replace(/\bistiyorum\b/gi, "talep ediyorum");
      out = out.replace(/\bpls\b|\blütfen\b/gi, "rica ederim");
      if (!/sayın/i.test(out)) out = `Sayın yetkili,\n\n${out}`;
      if (!/saygı/i.test(out)) out += "\n\nSaygılarımla.";
      return out;
    }
    case "translate": {
      let out = t;
      for (const [tr, en] of EN_DICT) out = out.replace(tr, en);
      return out;
    }
    case "draft": {
      const ctx = opts.context ?? "genel bir konu";
      return `Bu ${ctx} taslağı AI tarafından hazırlandı. Ana noktalar: mevcut durum, etkilenen kişiler, önerilen aksiyon ve zaman çizelgesi. Göndermeden önce gözden geçirip kişiselleştirin; hiçbir taslak onaysız gönderilmez.`;
    }
    default:
      return t;
  }
}

export function toneOf(text: string): "resmi" | "dengeli" | "samimi" {
  const t = foldTr(text);
  if (/sayin|rica ederim|saygilarimla/.test(t)) return "resmi";
  if (/selam|merhaba canim|hey/.test(t)) return "samimi";
  return "dengeli";
}
