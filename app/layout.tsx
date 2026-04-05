import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import { Providers } from "./providers";
import "./globals.css";
import {
  PWA_APP_ICON,
  PWA_APP_ICON_192,
  PWA_APP_ICON_SVG,
  PWA_APPLE_TOUCH_ICON,
} from "@/lib/pwa/branding";
import { resolvePwaInitialShell } from "@/lib/theme/resolve-pwa-initial-shell";
import { THEME_COOKIE_NAME } from "@/lib/theme/theme-cookie";
import { getThemeInitScript } from "@/lib/theme/theme-init-script";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.AUTH_URL ||
  "http://localhost:3000";

const description =
  "Track, care for, and understand your plants with Soil Mates — a calm, private plant workspace with reminders, collections, and mindful care history.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Soil Mates",
  title: {
    default: "Soil Mates — Mindful plant care",
    template: "%s · Soil Mates",
  },
  description,
  keywords: [
    "plants",
    "plant care",
    "reminders",
    "collections",
    "garden",
    "PWA",
  ],
  authors: [{ name: "Soil Mates" }],
  creator: "Soil Mates",
  icons: {
    icon: [
      { url: PWA_APP_ICON_SVG, type: "image/svg+xml", sizes: "any" },
      { url: PWA_APP_ICON_192, sizes: "192x192", type: "image/png" },
      { url: PWA_APP_ICON, sizes: "512x512", type: "image/png" },
    ],
    shortcut: PWA_APP_ICON_SVG,
    apple: [{ url: PWA_APPLE_TOUCH_ICON, sizes: "180x180", type: "image/png" }],
  },
  /**
   * Do not set `statusBarStyle` here: a static value injects
   * `apple-mobile-web-app-status-bar-style` before client JS, and WebKit often
   * honors the first tag — `default` forces a light status strip in standalone
   * mode. Runtime theme (`theme-init-script` + ThemeProvider) sets
   * `black-translucent` in dark mode and `default` in light mode.
   */
  appleWebApp: {
    capable: true,
    title: "Soil Mates",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Soil Mates",
    title: "Soil Mates — Mindful plant care",
    description,
    url: siteUrl,
    images: [
      {
        url: PWA_APP_ICON,
        width: 512,
        height: 512,
        alt: "Soil Mates",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Soil Mates — Mindful plant care",
    description,
  },
  robots: {
    index: true,
    follow: true,
  },
  category: "lifestyle",
};

/**
 * Do not set `themeColor` here — Next injects a second `<meta name="theme-color">`
 * that fights `#soilmates-theme-color`. Shell colors are set in `<head>` + inline script.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jar = await cookies();
  const h = await headers();
  const pathname = h.get("x-pathname") ?? "/";
  const shell = resolvePwaInitialShell(
    pathname,
    jar.get(THEME_COOKIE_NAME)?.value,
  );

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable} h-full min-h-dvh bg-surface antialiased${shell.dark ? " dark" : ""}`}
    >
      <head>
        <meta
          id="soilmates-theme-color"
          name="theme-color"
          content={shell.themeColor}
        />
        <meta
          id="soilmates-apple-status-bar"
          name="apple-mobile-web-app-status-bar-style"
          content={shell.statusBarStyle}
        />
      </head>
      <body className="flex min-h-dvh flex-col bg-surface text-on-surface">
        <Script
          id="soilmates-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: getThemeInitScript() }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
