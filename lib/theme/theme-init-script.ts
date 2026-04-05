import { PWA_THEME_COLOR_DARK, PWA_THEME_COLOR_LIGHT } from "@/lib/pwa/branding";
import { THEME_COOKIE_NAME } from "./theme-cookie";

/**
 * Runs before first paint (root layout `beforeInteractive`) so iOS standalone PWA
 * does not flash OS-based `theme-color` before React hydrates. Must stay in sync
 * with `ThemeProvider` apply logic.
 */
export function getThemeInitScript(): string {
  const name = THEME_COOKIE_NAME;
  const light = PWA_THEME_COLOR_LIGHT;
  const dark = PWA_THEME_COLOR_DARK;
  return [
    "!function(){",
    `var N=${JSON.stringify(name)},L=${JSON.stringify(light)},D=${JSON.stringify(dark)};`,
    'function stripThemeColors(){document.querySelectorAll(\'meta[name="theme-color"]\').forEach(function(m){if(m.id!=="soilmates-theme-color")m.remove()})}',
    'function gc(n){var p=document.cookie.split(";"),i,x;for(i=0;i<p.length;i++){x=p[i].trim();if(x.indexOf(n+"=")===0)return decodeURIComponent(x.slice(n.length+1))}return null}',
    'var path=typeof location!=="undefined"?location.pathname:"";',
    'var loginPath=/^\\/login(\\/|$)/.test(path);',
    'var v=gc(N),q=window.matchMedia("(prefers-color-scheme: dark)"),dm;',
    'if(loginPath)dm=!1;else if(v==="light")dm=!1;else if(v==="dark")dm=!0;else dm=q.matches;',
    'var r=document.documentElement;r.classList.toggle("dark",dm);r.style.colorScheme=dm?"dark":"light";',
    'stripThemeColors();',
    'var tc=document.getElementById("soilmates-theme-color");',
    'if(!tc){tc=document.createElement("meta");tc.id="soilmates-theme-color";tc.name="theme-color";document.head.appendChild(tc)}',
    'tc.setAttribute("content",dm?D:L);',
    'document.head.appendChild(tc);',
    'var sb=document.querySelector(\'meta[name="apple-mobile-web-app-status-bar-style"]\');',
    'if(!sb){sb=document.createElement("meta");sb.id="soilmates-apple-status-bar";sb.setAttribute("name","apple-mobile-web-app-status-bar-style");document.head.appendChild(sb)}else if(!sb.id)sb.id="soilmates-apple-status-bar";',
    'sb.setAttribute("content",dm?"black-translucent":"default");',
    'document.head.appendChild(sb);',
    "}();",
  ].join("");
}
