"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { titleForPath } from "@/lib/layout/nav-config";
import type { CollectionOption } from "./collection-switcher";

type AppHeaderProps = {
  collections: CollectionOption[];
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
};

export function AppHeader({ collections, user }: AppHeaderProps) {
  const pathname = usePathname();
  const baseTitle = titleForPath(pathname);

  let subtitle: string | null = null;
  let title = baseTitle;

  if (pathname.startsWith("/collections/")) {
    const slug = pathname.split("/")[2]?.split("/")[0];
    if (slug && slug !== "choose") {
      const col = collections.find((c) => c.slug === slug);
      if (col) {
        title = col.name;
        subtitle = "Collection";
      }
    } else if (pathname === "/collections" || pathname.startsWith("/collections?")) {
      title = "Collections";
      subtitle = "Your shared spaces";
    }
  }

  if (pathname === "/dashboard") {
    subtitle = "Overview";
  }

  const display = user.name?.trim() || user.email.split("@")[0] || "Account";

  return (
    <header className="sticky top-0 z-30 border-b border-outline-variant/[0.10] bg-surface/90 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-4 px-4 sm:h-[3.75rem] sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          {subtitle && (
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
              {subtitle}
            </p>
          )}
          <h1 className="truncate font-display text-lg font-semibold tracking-tight text-on-surface sm:text-xl">
            {title}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
            aria-label="Notifications (coming soon)"
          >
            <Bell className="size-[1.35rem]" strokeWidth={1.5} />
          </button>
          <Link
            href="/settings"
            className="flex size-10 items-center justify-center rounded-full bg-surface-container-low text-sm font-semibold text-primary ring-1 ring-outline-variant/10 transition hover:bg-surface-container-high"
            aria-label="Account settings"
          >
            {display.slice(0, 1).toUpperCase()}
          </Link>
        </div>
      </div>
    </header>
  );
}
