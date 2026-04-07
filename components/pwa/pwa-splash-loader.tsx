"use client";

import { Leaf } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "soilmates-pwa-splash-seen";

/**
 * Branded splash on first open in standalone (installed) mode — feels like a native shell.
 */
export function PwaSplashLoader() {
  // Initialize to true. Render instantly, no black flashing voids!
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ===
        true;
    if (!standalone) {
      setVisible(false);
      return;
    }
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) {
        setVisible(false);
        return;
      }
    } catch {
      /* private mode */
    }
    
    const t = window.setTimeout(() => {
      setFading(true);
      setTimeout(() => {
        setVisible(false);
      }, 500); // Wait for CSS transition
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 1200);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-surface transition-opacity duration-500 ease-in-out ${fading ? "opacity-0" : "opacity-100"}`}
      aria-hidden
    >
      <div className="flex flex-col items-center gap-5 px-8 text-center">
        <span className="flex size-20 items-center justify-center rounded-3xl bg-primary/15 text-primary shadow-[0_8px_30px_-10px_rgba(0,0,0,0.12)] ring-1 ring-outline-variant/20 dark:shadow-[0_8px_30px_-10px_rgba(0,0,0,0.6)]">
          <Leaf className="size-10" strokeWidth={1.5} aria-hidden />
        </span>
        <div>
          <p className="font-display text-xl font-bold tracking-tight text-on-surface">
            Soil Mates
          </p>
          <p className="mt-2 text-[0.85rem] font-bold text-on-surface-variant">
            Waking up the greenhouse...
          </p>
        </div>
        <span
          className="mt-6 inline-block size-8 animate-spin rounded-full border-2 border-primary/20 border-t-primary"
          aria-label="Loading"
        />
      </div>
    </div>
  );
}
