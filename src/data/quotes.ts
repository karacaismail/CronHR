/**
 * Kenar çubuğu için dönen alıntılar — iş dünyasına yön verenlerden gerçek,
 * doğrulanmış sözler (yazar atıflı). Kaynak doğrulaması için bkz. commit
 * mesajı / PR açıklaması. Cümle düzeninde yazılır (BÜYÜK HARF kullanılmaz).
 */

export interface Quote {
  readonly text: string;
  readonly author: string;
}

// PLACEHOLDER — gerçek 256 doğrulanmış alıntıyla değiştirilecek.
export const QUOTES: readonly Quote[] = [
  { text: "Bir araya gelmek başlangıçtır, birlikte kalmak ilerlemedir, birlikte çalışmak ise başarıdır.", author: "Henry Ford" },
  { text: "Kültürü strateji için yönetin, çünkü kültür stratejiyi her seferinde yener.", author: "Peter Drucker" },
  { text: "En büyük risk, hiç risk almamaktır.", author: "Mark Zuckerberg" },
];
