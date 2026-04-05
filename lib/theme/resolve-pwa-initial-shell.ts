import {
  PWA_THEME_COLOR_DARK,
  PWA_THEME_COLOR_LIGHT,
} from "@/lib/pwa/branding";
import type { ThemeCookieValue } from "@/lib/theme/theme-cookie";

/**
 * SSR + first paint: match `getThemeInitScript` / ThemeProvider / LoginThemeGate.
 * Login is always light. `system` (or missing cookie) defaults to light on the
 * server; the inline script reconciles `prefers-color-scheme` on the client.
 */
export function resolvePwaInitialShell(
  pathname: string,
  cookieRaw: string | undefined,
): {
  dark: boolean;
  themeColor: string;
  statusBarStyle: "black-translucent" | "default";
} {
  const isLogin = /^\/login(\/|$)/.test(pathname);
  const v = cookieRaw as ThemeCookieValue | undefined;

  if (isLogin) {
    return {
      dark: false,
      themeColor: PWA_THEME_COLOR_LIGHT,
      statusBarStyle: "default",
    };
  }

  if (v === "dark") {
    return {
      dark: true,
      themeColor: PWA_THEME_COLOR_DARK,
      statusBarStyle: "black-translucent",
    };
  }

  if (v === "light") {
    return {
      dark: false,
      themeColor: PWA_THEME_COLOR_LIGHT,
      statusBarStyle: "default",
    };
  }

  // system or unset — SSR cannot read prefers-color-scheme reliably
  return {
    dark: false,
    themeColor: PWA_THEME_COLOR_LIGHT,
    statusBarStyle: "default",
  };
}
