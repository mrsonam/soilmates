"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { bottomNav, isNavActive } from "@/lib/layout/nav-config";

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-outline-variant/[0.12] bg-surface/95 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-1">
        {bottomNav.map((item) => {
          const active = isNavActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <li key={item.href} className="min-w-0 flex-1">
              <Link
                href={item.href}
                className={[
                  "flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-colors duration-200",
                  active ? "text-primary" : "text-on-surface-variant",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <Icon
                  className="size-5 shrink-0"
                  strokeWidth={active ? 2 : 1.75}
                  aria-hidden
                />
                <span
                  className={[
                    "max-w-full truncate text-[0.65rem] font-medium leading-tight",
                    active ? "text-primary" : "text-on-surface-variant",
                  ].join(" ")}
                >
                  {item.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
