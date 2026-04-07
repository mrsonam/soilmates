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
        "flex min-h-[3.5rem] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-[2rem] px-1 py-1 transition-all duration-500 ease-premium active:scale-[0.95] sm:min-w-12 sm:px-2",
        active
          ? "bg-surface shadow-sm text-primary ring-1 ring-black/5 dark:ring-white/5"
          : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container-highest/50",
        pending ? "opacity-75" : "",
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
          className={`size-5 shrink-0 transition-transform duration-500 ease-premium ${active ? 'scale-110' : 'scale-100'}`}
          strokeWidth={active ? 2.5 : 2}
          aria-hidden
        />
      )}
      <span
        className={[
          "max-w-full truncate text-[0.6rem] font-bold tracking-tight transition-all duration-500",
          active ? "text-primary opacity-100" : "text-on-surface-variant opacity-80",
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
      className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] left-4 right-4 z-40 lg:hidden pointer-events-none flex justify-center"
      aria-label="Primary"
    >
      <div className="pointer-events-auto w-full max-w-[26rem] rounded-[2.5rem] bg-surface-container-high/60 p-2 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] backdrop-blur-2xl ring-1 ring-white/50 dark:bg-surface-container-highest/40 dark:ring-white/10 dark:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
        <ul className="flex w-full items-stretch justify-between gap-1">
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
      </div>
    </nav>
  );
}
