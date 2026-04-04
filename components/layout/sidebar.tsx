"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFormStatus } from "react-dom";
import { Leaf, Settings } from "lucide-react";
import { sidebarNav, isNavActive } from "@/lib/layout/nav-config";
import { logoutAction } from "@/app/(app)/logout-action";
import { NavItem } from "./nav-item";
import { CollectionSwitcher, type CollectionOption } from "./collection-switcher";

type SidebarProps = {
  collections: CollectionOption[];
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
  pendingInviteCount?: number;
};

export function Sidebar({
  collections,
  user,
  pendingInviteCount = 0,
}: SidebarProps) {
  const pathname = usePathname();
  const display = user.name?.trim() || user.email.split("@")[0] || "Grower";
  const initial = display.slice(0, 1).toUpperCase();

  return (
    <aside
      className="hidden h-dvh max-h-dvh w-[17rem] shrink-0 flex-col border-r border-outline-variant/[0.08] bg-surface-container-low/90 lg:sticky lg:top-0 lg:z-20 lg:flex lg:self-start"
      aria-label="Main navigation"
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pt-8">
          <Link
            href="/dashboard"
            className="focus-ring-premium mb-8 flex items-center gap-2.5 rounded-2xl px-2 py-1 transition-[opacity,transform] duration-300 hover:opacity-92 active:scale-[0.99]"
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

          <nav className="flex flex-col gap-0.5" aria-label="Primary">
            {sidebarNav.map((item) => (
              <NavItem
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                active={isNavActive(pathname, item.href)}
                badgeCount={
                  item.href === "/invitations" ? pendingInviteCount : undefined
                }
              />
            ))}
          </nav>
        </div>

        <div className="shrink-0 border-t border-outline-variant/10 bg-surface-container-low px-4 pb-6 pt-5">
          <div className="px-2">
            <div className="flex items-center gap-3 rounded-2xl py-2">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={`${display} profile`}
                  width={40}
                  height={40}
                  className="size-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-sm font-semibold text-primary"
                  aria-hidden
                >
                  {initial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-on-surface">
                  {display}
                </p>
                <p className="truncate text-xs text-on-surface-variant">
                  {user.email}
                </p>
              </div>
            </div>
            <Link
              href="/settings"
              className="focus-ring-premium mt-3 flex items-center gap-2 rounded-2xl px-2 py-2 text-sm font-medium text-on-surface-variant transition-[background-color,color] duration-200 hover:bg-surface-container-high hover:text-on-surface"
            >
              <Settings className="size-4 shrink-0" strokeWidth={1.75} />
              Settings
            </Link>
            <form action={logoutAction} className="mt-2">
              <LogoutButton />
            </form>
          </div>
        </div>
      </div>
    </aside>
  );
}

function LogoutButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-2xl bg-surface-container-high px-3 py-2 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Logging out..." : "Log out"}
    </button>
  );
}
