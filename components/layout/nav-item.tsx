"use client";

import Link, { useLinkStatus } from "next/link";
import { Loader2, type LucideIcon } from "lucide-react";

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

function NavItemInner({
  label,
  icon: Icon,
  active,
  className = "",
  badgeCount = 0,
}: Omit<NavItemProps, "href" | "onNavigate">) {
  const { pending } = useLinkStatus();
  const showBadge = badgeCount > 0;
  return (
    <span
      className={[
        "group flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-[color,background-color,box-shadow,transform,opacity] duration-300 ease-out",
        active
          ? "bg-surface-container-lowest text-primary shadow-(--shadow-ambient) ring-1 ring-primary/[0.08]"
          : "text-on-surface-variant hover:bg-surface-container-high/80 hover:text-on-surface active:scale-[0.99]",
        pending ? "opacity-[0.88] ring-1 ring-primary/15" : "",
        className,
      ].join(" ")}
      aria-busy={pending}
    >
      {pending ? (
        <Loader2
          className="size-5 shrink-0 animate-spin text-primary"
          strokeWidth={2}
          aria-hidden
        />
      ) : (
        <Icon
          className={[
            "size-5 shrink-0 transition-colors",
            active ? "text-primary" : "text-on-surface-variant group-hover:text-on-surface",
          ].join(" ")}
          strokeWidth={1.75}
          aria-hidden
        />
      )}
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
    </span>
  );
}

export function NavItem({
  href,
  label,
  icon,
  active,
  className = "",
  onNavigate,
  badgeCount = 0,
}: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="focus-ring-premium block rounded-2xl outline-none"
      aria-current={active ? "page" : undefined}
    >
      <NavItemInner
        label={label}
        icon={icon}
        active={active}
        className={className}
        badgeCount={badgeCount}
      />
    </Link>
  );
}
