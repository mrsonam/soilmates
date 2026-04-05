"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import { bottomNav, isBottomNavActive } from "@/lib/layout/nav-config";

type BottomNavItemProps = {
  href: string;
  label: string;
  icon: (typeof bottomNav)[number]["icon"];
  active: boolean;
};

function BottomNavItemInner({
  label,
  icon: Icon,
  active,
}: Omit<BottomNavItemProps, "href">) {
  const { pending } = useLinkStatus();
  return (
    <span
      className={[
        "flex min-h-[3.1rem] min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 transition-[color,background-color,transform,opacity] duration-300 ease-out active:scale-[0.97] sm:min-w-12 sm:px-2",
        active
          ? "bg-primary/9 text-primary"
          : "text-on-surface-variant hover:bg-surface-container-high/80 hover:text-on-surface",
        pending ? "opacity-75" : "",
      ].join(" ")}
      aria-busy={pending}
    >
      {pending ? (
        <Loader2
          className="size-[1.15rem] shrink-0 animate-spin text-primary sm:size-5"
          strokeWidth={2}
          aria-hidden
        />
      ) : (
        <Icon
          className="size-[1.15rem] shrink-0 sm:size-5"
          strokeWidth={active ? 2 : 1.75}
          aria-hidden
        />
      )}
      <span
        className={[
          "max-w-full truncate text-[0.6rem] font-medium leading-tight sm:text-[0.65rem]",
          active ? "text-primary" : "text-on-surface-variant",
        ].join(" ")}
      >
        {label}
      </span>
    </span>
  );
}

function BottomNavItem({ href, label, icon, active }: BottomNavItemProps) {
  const Icon = icon;
  return (
    <Link
      href={href}
      className="focus-ring-premium flex min-w-0 flex-1 flex-col items-stretch justify-center"
      aria-current={active ? "page" : undefined}
    >
      <BottomNavItemInner label={label} icon={Icon} active={active} />
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/12 bg-surface/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto flex w-full max-w-2xl items-stretch justify-between gap-0.5 px-1 sm:justify-around sm:gap-1">
        {bottomNav.map((item) => {
          const active = isBottomNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <BottomNavItem
                href={item.href}
                label={item.label}
                icon={Icon}
                active={active}
              />
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
