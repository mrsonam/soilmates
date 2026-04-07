/**
 * iOS standalone PWA / Safari `theme-color` — must match `app/globals.css`
 * `:root` and `html.dark` `--surface` so the dynamic island / status area never
 * shows a mismatched strip when the user picks dark mode while OS is light.
 */
export const PWA_THEME_COLOR_LIGHT = "#f8fafc";
export const PWA_THEME_COLOR_DARK = "#050b08";

/** Central paths for PWA + Web Push imagery (keep in sync with `public/icons/`). */
export const PWA_APP_ICON_SVG = "/icons/soilmates-icon.svg";
/** PNG — used for install manifest, OG, push, and clients that ignore SVG icons. */
export const PWA_APP_ICON = "/icons/soilmates-icon-512.png";
export const PWA_APP_ICON_192 = "/icons/soilmates-icon-192.png";
/** iOS / Safari “Add to Home Screen” (non-SVG). */
export const PWA_APPLE_TOUCH_ICON = "/icons/apple-touch-icon.png";
export const PWA_BADGE_ICON = "/icons/soilmates-badge.svg";
