"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { UserTheme } from "@prisma/client";

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

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    function apply() {
      const dark =
        theme === "dark" || (theme === "system" && mq.matches);
      document.documentElement.classList.toggle("dark", dark);
      document.documentElement.style.colorScheme = dark ? "dark" : "light";
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
