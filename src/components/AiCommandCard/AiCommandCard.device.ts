import { useEffect, useState } from "react";

/**
 * Adaptive cihaz sistemi — "320px iPhone 4 FIRST".
 *
 * Taban tasarım her zaman en dar gerçek cihazdır (320px). Daha büyük ekranlar
 * media-sorgusu yamaları değil, host'a damgalanan data-device /
 * data-orientation öznitelikleri üzerinden AYRI AYRI kodlanır: her parça kendi
 * CSS'inde cihaz sınıfı başına açık blok yazar.
 *
 *   phone-narrow : < 360px  (iPhone 4/5 — TABAN)
 *   phone        : 360–767px
 *   tablet       : 768–1023px
 *   desktop      : >= 1024px
 */
export type AiDeviceClass = "phone-narrow" | "phone" | "tablet" | "desktop";
export type AiOrientation = "portrait" | "landscape";

const DEVICE_QUERIES: readonly { device: AiDeviceClass; query: string }[] = [
  { device: "desktop", query: "(min-width: 1024px)" },
  { device: "tablet", query: "(min-width: 768px)" },
  { device: "phone", query: "(min-width: 360px)" },
];

function resolveDeviceClass(): AiDeviceClass {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "phone-narrow"; // 320-first: bilinmeyen ortamda taban cihaz
  }
  for (const { device, query } of DEVICE_QUERIES) {
    if (window.matchMedia(query).matches) return device;
  }
  return "phone-narrow";
}

function resolveOrientation(): AiOrientation {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return "portrait";
  }
  return window.matchMedia("(orientation: landscape)").matches
    ? "landscape"
    : "portrait";
}

/** Canlı cihaz sınıfı + yön; ekran döndürme ve yeniden boyutlandırmayı izler. */
export function useAiDeviceClass(): {
  deviceClass: AiDeviceClass;
  orientation: AiOrientation;
} {
  const [deviceClass, setDeviceClass] = useState<AiDeviceClass>(resolveDeviceClass);
  const [orientation, setOrientation] = useState<AiOrientation>(resolveOrientation);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const update = () => {
      setDeviceClass(resolveDeviceClass());
      setOrientation(resolveOrientation());
    };
    const queries = [
      ...DEVICE_QUERIES.map(({ query }) => window.matchMedia(query)),
      window.matchMedia("(orientation: landscape)"),
    ];
    for (const mq of queries) mq.addEventListener("change", update);
    return () => {
      for (const mq of queries) mq.removeEventListener("change", update);
    };
  }, []);

  return { deviceClass, orientation };
}
