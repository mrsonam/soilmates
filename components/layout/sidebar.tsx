"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Plus } from "lucide-react";
import { signOut } from "next-auth/react";
import { sidebarNav, isNavActive } from "@/lib/layout/nav-config";
import { NavItem } from "./nav-item";
import { CollectionSwitcher, type CollectionOption } from "./collection-switcher";

type SidebarProps = {
  collections: CollectionOption[];
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
};

function addPlantHrefForPath(
  pathname: string,
  collections: CollectionOption[],
): string {
  const fromPath = pathname.match(/^\/collections\/([^/]+)/)?.[1];
  if (
    fromPath &&
    collections.some((c) => c.slug === fromPath)
  ) {
    return `/collections/${fromPath}/plants/new`;
  }
  if (collections[0]) {
    return `/collections/${collections[0].slug}/plants/new`;
  }
  return "/collections";
}

export function Sidebar({ collections, user }: SidebarProps) {
  const pathname = usePathname();
  const display = user.name?.trim() || user.email.split("@")[0] || "Grower";
  const addPlantHref = addPlantHrefForPath(pathname, collections);

  return (
    <aside
      className="hidden h-dvh w-[17rem] shrink-0 flex-col border-r border-outline-variant/[0.12] bg-surface-container-low lg:flex"
      aria-label="Main navigation"
    >
      <div className="flex flex-1 flex-col px-4 pb-6 pt-8">
        <Link
          href="/dashboard"
          className="mb-8 flex items-center gap-2.5 px-2 transition-opacity hover:opacity-90"
        >
          <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <Leaf className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight text-on-surface">
            Soil Mates
          </span>
        </Link>

        <div className="mb-6">
          <p className="mb-2 px-2 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            Active space
          </p>
          <CollectionSwitcher collections={collections} />
        </div>

        <nav className="flex flex-1 flex-col gap-0.5" aria-label="Primary">
          {sidebarNav.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isNavActive(pathname, item.href)}
            />
          ))}
        </nav>

        <Link
          href={addPlantHref}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-medium text-on-primary shadow-(--shadow-ambient) transition hover:bg-primary/92"
        >
          <Plus className="size-4" strokeWidth={2.25} aria-hidden />
          Add New Plant
        </Link>

        <div className="mt-auto border-t border-outline-variant/10 pt-5">
          <div className="flex items-center gap-3 rounded-2xl px-2 py-2">
            <div
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-sm font-semibold text-primary"
              aria-hidden
            >
              {display.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-on-surface">
                {display}
              </p>
              <p className="truncate text-xs text-on-surface-variant">
                {user.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-2 w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
          >
            Sign out
          </button>
        </div>
      </div>
    </aside>
  );
}
