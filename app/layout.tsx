import type { Metadata, Viewport } from "next";
import { Inter, Manrope } from "next/font/google";
import Script from "next/script";
import { Providers } from "./providers";
import "./globals.css";
import {
  PWA_APP_ICON,
  PWA_APP_ICON_192,
  PWA_APP_ICON_SVG,
  PWA_APPLE_TOUCH_ICON,
  PWA_THEME_COLOR_LIGHT,
} from "@/lib/pwa/branding";
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

export const viewport: Viewport = {
  /**
   * One non-media default for SSR / browser tabs. Do not use an array with
   * `prefers-color-scheme` — that follows the OS and fights in-app dark mode.
   * `theme-init-script` + ThemeProvider append/update `#soilmates-theme-color`
   * last so iOS standalone picks the real shell color.
   */
  themeColor: PWA_THEME_COLOR_LIGHT,
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable} h-full min-h-dvh bg-surface antialiased`}
    >
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
