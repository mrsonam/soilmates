"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserTheme } from "@prisma/client";
import {
  PWA_THEME_COLOR_DARK,
  PWA_THEME_COLOR_LIGHT,
} from "@/lib/pwa/branding";
import { THEME_COOKIE_NAME } from "@/lib/theme/theme-cookie";

type ThemeContextValue = {
  theme: UserTheme;
  setTheme: (t: UserTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useThemePreference(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemePreference must be used within ThemeProvider");
  }
  return ctx;
}

export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: UserTheme;
  children: ReactNode;
}) {
  const [theme, setThemeState] = useState<UserTheme>(initialTheme);

  useEffect(() => {
    setThemeState(initialTheme);
  }, [initialTheme]);

  const setTheme = useCallback((t: UserTheme) => {
    setThemeState(t);
  }, []);

  useLayoutEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function apply() {
      const dark =
        theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";

      const maxAge = 60 * 60 * 24 * 365;
      const secure =
        typeof window !== "undefined" && window.location.protocol === "https:"
          ? "; Secure"
          : "";
      document.cookie = `${THEME_COOKIE_NAME}=${encodeURIComponent(theme)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;

      /**
       * iOS standalone PWA uses the last `theme-color` meta for the top chrome.
       * Media-query-only tags follow `prefers-color-scheme`, which breaks when the
       * user enables app dark mode while the OS stays light — append a non-media
       * meta so Safari matches the actual `html.dark` state.
       */
      const content = dark ? PWA_THEME_COLOR_DARK : PWA_THEME_COLOR_LIGHT;
      let meta = document.getElementById(
        "soilmates-theme-color",
      ) as HTMLMetaElement | null;
      if (!meta) {
        meta = document.createElement("meta");
        meta.id = "soilmates-theme-color";
        meta.name = "theme-color";
      }
      meta.content = content;
      /** Last `theme-color` in `<head>` wins on iOS standalone; keep ours last. */
      document.head.appendChild(meta);

      let statusMeta = document.querySelector(
        'meta[name="apple-mobile-web-app-status-bar-style"]',
      ) as HTMLMetaElement | null;
      if (!statusMeta) {
        statusMeta = document.createElement("meta");
        statusMeta.id = "soilmates-apple-status-bar";
        statusMeta.setAttribute("name", "apple-mobile-web-app-status-bar-style");
      } else if (!statusMeta.id) {
        statusMeta.id = "soilmates-apple-status-bar";
      }
      /** Dark: translucent bar so `html` `--surface` fills the notch; light: separate light bar. */
      statusMeta.setAttribute("content", dark ? "black-translucent" : "default");
      document.head.appendChild(statusMeta);
    }
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
