import type { MetadataRoute } from "next";
import {
  PWA_APP_ICON,
  PWA_APP_ICON_192,
  PWA_THEME_COLOR_DARK,
  PWA_THEME_COLOR_LIGHT,
} from "@/lib/pwa/branding";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Soil Mates",
    short_name: "Soil Mates",
    description:
      "Mindful plant care — track collections, reminders, and growth in a calm, private workspace.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    orientation: "any",
    /** Install splash; runtime theme-color is set by layout + ThemeProvider. */
    background_color: PWA_THEME_COLOR_LIGHT,
    /** Dark-compatible top chrome; light surfaces still work via runtime meta. */
    theme_color: PWA_THEME_COLOR_DARK,
    categories: ["lifestyle", "productivity"],
    icons: [
      {
        src: PWA_APP_ICON_192,
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_APP_ICON,
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: PWA_APP_ICON,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Home",
        description: "Open your care overview",
        url: "/dashboard",
        icons: [{ src: PWA_APP_ICON_192, sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Plants",
        short_name: "Plants",
        description: "Browse all plants",
        url: "/plants",
        icons: [{ src: PWA_APP_ICON_192, sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Collections",
        short_name: "Spaces",
        description: "Your plant collections",
        url: "/collections",
        icons: [{ src: PWA_APP_ICON_192, sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
