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
};

export function NavItem({
  href,
  label,
  icon: Icon,
  active,
  className = "",
  onNavigate,
}: NavItemProps) {
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
      <span>{label}</span>
    </Link>
  );
}
