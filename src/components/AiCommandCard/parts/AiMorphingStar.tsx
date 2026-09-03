/**
 * AiMorphingStar — orb'un merkez glifi. Yumuşak (yuvarlatılmış) uçlu yıldız;
 * 12 sn'lik döngüde çizgileri CANLI akarak 5 uçlu → 3 uçlu → 4 uçlu formlar
 * arasında morph eder. Üç yol da aynı 72 köşeli örneklemden üretildiği için
 * SMIL d-morph'u kesintisiz interpolasyon yapar. Dekoratif; aria-hidden
 * ebeveyn tarafından sağlanır.
 */

const STAR_5 =
  "M 12.0 2.2 L 12.8 2.5 L 13.5 3.5 L 14.0 4.7 L 14.2 5.8 L 14.5 6.7 L 14.7 7.3 L 15.1 7.6 L 15.5 7.8 L 16.0 8.0 L 16.8 8.0 L 17.9 7.9 L 19.2 7.9 L 20.4 8.1 L 21.2 8.7 L 21.4 9.5 L 20.9 10.4 L 20.0 11.3 L 19.0 12.0 L 18.1 12.5 L 17.5 13.0 L 17.2 13.4 L 17.1 13.8 L 17.0 14.3 L 17.2 15.0 L 17.5 15.9 L 18.0 17.0 L 18.3 18.3 L 18.2 19.4 L 17.6 20.0 L 16.7 20.1 L 15.6 19.7 L 14.5 18.9 L 13.7 18.2 L 13.0 17.6 L 12.5 17.4 L 12.0 17.4 L 11.5 17.4 L 11.0 17.6 L 10.3 18.2 L 9.5 18.9 L 8.4 19.7 L 7.3 20.1 L 6.4 20.0 L 5.8 19.4 L 5.7 18.3 L 6.0 17.0 L 6.5 15.9 L 6.8 15.0 L 7.0 14.3 L 6.9 13.8 L 6.8 13.4 L 6.5 13.0 L 5.9 12.5 L 5.0 12.0 L 4.0 11.3 L 3.1 10.4 L 2.6 9.5 L 2.8 8.7 L 3.6 8.1 L 4.8 7.9 L 6.1 7.9 L 7.2 8.0 L 8.0 8.0 L 8.5 7.8 L 8.9 7.6 L 9.3 7.3 L 9.5 6.7 L 9.8 5.8 L 10.0 4.7 L 10.5 3.5 L 11.2 2.5 Z";

const STAR_3 =
  "M 12.0 2.2 L 12.8 2.3 L 13.6 2.8 L 14.3 3.4 L 14.8 4.2 L 15.2 5.1 L 15.5 6.0 L 15.7 6.8 L 15.8 7.4 L 16.0 8.0 L 16.2 8.5 L 16.4 8.9 L 16.7 9.3 L 16.9 9.7 L 17.1 10.1 L 17.5 10.5 L 17.9 11.0 L 18.4 11.4 L 19.0 12.0 L 19.6 12.7 L 20.1 13.4 L 20.6 14.3 L 20.8 15.2 L 20.8 16.1 L 20.5 16.9 L 19.9 17.6 L 19.2 18.0 L 18.3 18.3 L 17.3 18.3 L 16.4 18.2 L 15.5 18.0 L 14.7 17.8 L 14.0 17.6 L 13.5 17.5 L 13.0 17.4 L 12.5 17.4 L 12.0 17.4 L 11.5 17.4 L 11.0 17.4 L 10.5 17.5 L 10.0 17.6 L 9.3 17.8 L 8.5 18.0 L 7.6 18.2 L 6.7 18.3 L 5.7 18.3 L 4.8 18.0 L 4.1 17.6 L 3.5 16.9 L 3.2 16.1 L 3.2 15.2 L 3.4 14.3 L 3.9 13.4 L 4.4 12.7 L 5.0 12.0 L 5.6 11.4 L 6.1 11.0 L 6.5 10.5 L 6.9 10.1 L 7.1 9.7 L 7.3 9.3 L 7.6 8.9 L 7.8 8.5 L 8.0 8.0 L 8.2 7.4 L 8.3 6.8 L 8.5 6.0 L 8.8 5.1 L 9.2 4.2 L 9.7 3.4 L 10.4 2.8 L 11.2 2.3 Z";

const STAR_4 =
  "M 12.0 2.2 L 12.8 2.4 L 13.6 3.1 L 14.1 4.0 L 14.5 5.1 L 14.8 6.0 L 15.0 6.8 L 15.2 7.4 L 15.5 7.8 L 15.8 8.2 L 16.2 8.5 L 16.6 8.8 L 17.2 9.0 L 18.0 9.2 L 18.9 9.5 L 20.0 9.9 L 20.9 10.4 L 21.6 11.2 L 21.8 12.0 L 21.6 12.8 L 20.9 13.6 L 20.0 14.1 L 18.9 14.5 L 18.0 14.8 L 17.2 15.0 L 16.6 15.2 L 16.2 15.5 L 15.8 15.8 L 15.5 16.2 L 15.2 16.6 L 15.0 17.2 L 14.8 18.0 L 14.5 18.9 L 14.1 20.0 L 13.6 20.9 L 12.8 21.6 L 12.0 21.8 L 11.2 21.6 L 10.4 20.9 L 9.9 20.0 L 9.5 18.9 L 9.2 18.0 L 9.0 17.2 L 8.8 16.6 L 8.5 16.2 L 8.2 15.8 L 7.8 15.5 L 7.4 15.2 L 6.8 15.0 L 6.0 14.8 L 5.1 14.5 L 4.0 14.1 L 3.1 13.6 L 2.4 12.8 L 2.2 12.0 L 2.4 11.2 L 3.1 10.4 L 4.0 9.9 L 5.1 9.5 L 6.0 9.2 L 6.8 9.0 L 7.4 8.8 L 7.8 8.5 L 8.2 8.2 L 8.5 7.8 L 8.8 7.4 L 9.0 6.8 L 9.2 6.0 L 9.5 5.1 L 9.9 4.0 L 10.4 3.1 L 11.2 2.4 Z";

const EASE = "0.65 0 0.35 1";

/* Yıldızın içi ve çizgisi kendi taban renklerini taşır; butondaki 24sn'lik
 * hue-rotate döngüsü bu tabanları gökkuşağı gibi sürekli kaydırır. */
export function AiMorphingStar({ size = 24 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size}>
      <path
        d={STAR_5}
        fill="hsla(325, 90%, 60%, 0.55)"
        stroke="hsl(52, 100%, 80%)"
        strokeWidth={2.7}
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* 12sn: 5 uçlu (bekle) → 3 uçlu (bekle) → 4 uçlu (bekle) → 5 uçlu */}
        <animate
          attributeName="d"
          dur="12s"
          repeatCount="indefinite"
          values={`${STAR_5};${STAR_5};${STAR_3};${STAR_3};${STAR_4};${STAR_4};${STAR_5}`}
          keyTimes="0;0.24;0.32;0.57;0.65;0.92;1"
          calcMode="spline"
          keySplines={`${EASE};${EASE};${EASE};${EASE};${EASE};${EASE}`}
        />
        {/* Çizgi rengi: 24sn gökkuşağı — doygunluk %100, açıklık %80 sabit. */}
        <animate
          attributeName="stroke"
          dur="24s"
          repeatCount="indefinite"
          values="hsl(52,100%,80%);hsl(112,100%,80%);hsl(172,100%,80%);hsl(232,100%,80%);hsl(292,100%,80%);hsl(352,100%,80%);hsl(52,100%,80%)"
        />
        {/* İç dolgu: 24sn gökkuşağı — pastel-koyu: S90, L60, alfa 0.55. */}
        <animate
          attributeName="fill"
          dur="24s"
          repeatCount="indefinite"
          values="hsla(325,90%,60%,0.55);hsla(25,90%,60%,0.55);hsla(85,90%,60%,0.55);hsla(145,90%,60%,0.55);hsla(205,90%,60%,0.55);hsla(265,90%,60%,0.55);hsla(325,90%,60%,0.55)"
        />
      </path>
    </svg>
  );
}
