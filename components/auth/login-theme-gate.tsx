"use client";

import { useLayoutEffect } from "react";
import { PWA_THEME_COLOR_LIGHT } from "@/lib/pwa/branding";

/**
 * Login is always light so the marketing-style sign-in screen matches design
 * regardless of saved app theme or OS dark mode. The authenticated app still
 * uses ThemeProvider after sign-in.
 */
export function LoginThemeGate() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    root.style.colorScheme = "light";

    document.querySelectorAll('meta[name="theme-color"]').forEach((el) => {
      if (el.id !== "soilmates-theme-color") el.remove();
    });

    let tc = document.getElementById(
      "soilmates-theme-color",
    ) as HTMLMetaElement | null;
    if (!tc) {
      tc = document.createElement("meta");
      tc.id = "soilmates-theme-color";
      tc.name = "theme-color";
    }
    tc.setAttribute("content", PWA_THEME_COLOR_LIGHT);
    document.head.appendChild(tc);

    let sb = document.querySelector(
      'meta[name="apple-mobile-web-app-status-bar-style"]',
    ) as HTMLMetaElement | null;
    if (!sb) {
      sb = document.createElement("meta");
      sb.id = "soilmates-apple-status-bar";
      sb.setAttribute("name", "apple-mobile-web-app-status-bar-style");
    } else if (!sb.id) {
      sb.id = "soilmates-apple-status-bar";
    }
    sb.setAttribute("content", "default");
    document.head.appendChild(sb);
  }, []);

  return null;
}
