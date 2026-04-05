"use client";

import Link, { useLinkStatus } from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Loader2,
  MapPin,
  Sprout,
  Users,
} from "lucide-react";

export type CollectionSectionTabId =
  | "overview"
  | "areas"
  | "plants"
  | "members";

const TABS: {
  id: CollectionSectionTabId;
  label: string;
  Icon: typeof LayoutDashboard;
  href: (slug: string) => string;
}[] = [
  {
    id: "overview",
    label: "Overview",
    Icon: LayoutDashboard,
    href: (slug) => `/collections/${slug}`,
  },
  {
    id: "areas",
    label: "Areas",
    Icon: MapPin,
    href: (slug) => `/collections/${slug}/areas`,
  },
  {
    id: "plants",
    label: "Plants",
    Icon: Sprout,
    href: (slug) => `/collections/${slug}/plants`,
  },
  {
    id: "members",
    label: "Members",
    Icon: Users,
    href: (slug) => `/collections/${slug}/members`,
  },
];

export function activeCollectionSectionTab(
  collectionSlug: string,
  pathname: string,
): CollectionSectionTabId {
  const base = `/collections/${collectionSlug}`;

  if (pathname.startsWith(`${base}/plants`)) {
    return "plants";
  }
  if (pathname.startsWith(`${base}/areas`)) {
    return "areas";
  }
  if (pathname.startsWith(`${base}/members`)) {
    return "members";
  }
  if (pathname === base) {
    return "overview";
  }
  return "overview";
}

type CollectionTabLinkProps = {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  selected: boolean;
};

function CollectionTabLinkInner({
  label,
  Icon,
  selected,
}: Omit<CollectionTabLinkProps, "href">) {
  const { pending } = useLinkStatus();
  return (
    <span
      className={[
        "relative flex min-w-0 shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-[color,border-color,opacity] duration-200 ease-out",
        selected
          ? "-mb-px border-primary font-semibold text-primary"
          : "border-transparent text-on-surface-variant hover:text-on-surface",
        pending ? "opacity-70" : "",
      ].join(" ")}
      aria-busy={pending}
    >
      {pending ? (
        <Loader2
          className="size-4 shrink-0 animate-spin text-primary"
          strokeWidth={2}
          aria-hidden
        />
      ) : (
        <Icon className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
      )}
      {label}
    </span>
  );
}

function CollectionTabLink({ href, label, Icon, selected }: CollectionTabLinkProps) {
  return (
    <Link
      href={href}
      role="tab"
      aria-selected={selected}
      className="focus-ring-premium shrink-0"
    >
      <CollectionTabLinkInner label={label} Icon={Icon} selected={selected} />
    </Link>
  );
}

type CollectionSectionTabsProps = {
  collectionSlug: string;
  className?: string;
};

export function CollectionSectionTabs({
  collectionSlug,
  className = "",
}: CollectionSectionTabsProps) {
  const pathname = usePathname();
  const active = activeCollectionSectionTab(collectionSlug, pathname);

  return (
    <div
      className={[
        "flex gap-1 overflow-x-auto border-b border-outline-variant/10 pb-px",
        className,
      ].join(" ")}
      role="tablist"
      aria-label="Collection sections"
    >
      {TABS.map((t) => {
        const Icon = t.Icon;
        const selected = active === t.id;
        return (
          <CollectionTabLink
            key={t.id}
            href={t.href(collectionSlug)}
            label={t.label}
            Icon={Icon}
            selected={selected}
          />
        );
      })}
    </div>
  );
}
