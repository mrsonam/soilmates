"use client";

import { Leaf } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "soilmates-pwa-splash-seen";

/**
 * Branded splash on first open in standalone (installed) mode — feels like a native shell.
 * Skips in browser tabs to avoid flashing on every navigation.
 */
export function PwaSplashLoader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    if (!standalone) return;
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      /* private mode */
    }
    setVisible(true);
    const t = window.setTimeout(() => {
      setVisible(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 900);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-10000 flex flex-col items-center justify-center bg-[#fbf9f6] dark:bg-[#121411]"
      aria-hidden
    >
      <div className="flex flex-col items-center gap-5 px-8 text-center">
        <span className="flex size-20 items-center justify-center rounded-3xl bg-primary/12 text-primary shadow-(--shadow-ambient) ring-1 ring-outline-variant/10">
          <Leaf className="size-10" strokeWidth={1.5} aria-hidden />
        </span>
        <div>
          <p className="font-display text-xl font-semibold tracking-tight text-on-surface">
            Soil Mates
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Mindful plant care
          </p>
        </div>
        <span
          className="inline-block size-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary"
          aria-label="Loading"
        />
      </div>
    </div>
  );
}
