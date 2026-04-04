"use client";

import { useEffect } from "react";

/**
 * Registers `/sw.js` for Web Push and offline cache. Safe to call on every load.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    async function register() {
      try {
        await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      } catch {
        // Dev or unsupported context
      }
    }

    register();
  }, []);

  return null;
}
