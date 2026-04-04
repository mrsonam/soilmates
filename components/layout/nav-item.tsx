"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type NavItemProps = {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  className?: string;
  onNavigate?: () => void;
  /** Small count badge (e.g. pending invites). */
  badgeCount?: number;
};

export function NavItem({
  href,
  label,
  icon: Icon,
  active,
  className = "",
  onNavigate,
  badgeCount = 0,
}: NavItemProps) {
  const showBadge = badgeCount > 0;
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={[
        "group flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
        active
          ? "bg-surface-container-lowest text-primary shadow-(--shadow-ambient)"
          : "text-on-surface-variant hover:bg-surface-container-high/80 hover:text-on-surface",
        className,
      ].join(" ")}
      aria-current={active ? "page" : undefined}
    >
      <Icon
        className={[
          "size-5 shrink-0 transition-colors",
          active ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface",
        ].join(" ")}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
        <span className="truncate">{label}</span>
        {showBadge ? (
          <span
            className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary/15 px-1.5 text-[0.65rem] font-semibold tabular-nums text-primary"
            aria-label={`${badgeCount} pending`}
          >
            {badgeCount > 9 ? "9+" : badgeCount}
          </span>
        ) : null}
      </span>
    </Link>
  );
}
