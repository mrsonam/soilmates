"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, FolderKanban } from "lucide-react";

export type CollectionOption = {
  id: string;
  name: string;
  slug: string;
};

type CollectionSwitcherProps = {
  collections: CollectionOption[];
};

export function CollectionSwitcher({ collections }: CollectionSwitcherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const activeSlug = pathname.startsWith("/collections/")
    ? pathname.split("/")[2]?.split("/")[0]
    : null;
  const current =
    collections.find((c) => c.slug === activeSlug) ?? collections[0];

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  if (collections.length === 0) {
    return (
      <div className="rounded-2xl bg-surface-container-high/60 px-3 py-2.5 text-xs text-on-surface-variant">
        No collections
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-2xl bg-surface-container-high/70 px-3 py-2.5 text-left text-sm text-on-surface transition hover:bg-surface-container-high"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="flex min-w-0 items-center gap-2">
          <FolderKanban
            className="size-4 shrink-0 text-primary"
            strokeWidth={1.75}
            aria-hidden
          />
          <span className="truncate font-medium">
            {current?.name ?? "Collection"}
          </span>
        </span>
        <ChevronDown
          className={[
            "size-4 shrink-0 text-on-surface-variant transition-transform",
            open ? "rotate-180" : "",
          ].join(" ")}
          aria-hidden
        />
      </button>
      {open && (
        <ul
          className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-auto rounded-2xl bg-surface-container-lowest py-1 shadow-(--shadow-ambient) ring-1 ring-black/[0.04]"
          role="listbox"
        >
          {collections.map((c) => (
            <li key={c.id} role="option">
              <Link
                href={`/collections/${c.slug}`}
                onClick={() => setOpen(false)}
                className={[
                  "block truncate px-3 py-2.5 text-sm transition",
                  c.slug === current?.slug
                    ? "bg-surface-container-low font-medium text-primary"
                    : "text-on-surface hover:bg-surface-container-low/80",
                ].join(" ")}
              >
                {c.name}
              </Link>
            </li>
          ))}
          <li className="border-t border-outline-variant/10">
            <Link
              href="/collections"
              onClick={() => setOpen(false)}
              className="block px-3 py-2.5 text-xs font-medium text-on-surface-variant hover:text-on-surface"
            >
              View all collections
            </Link>
          </li>
        </ul>
      )}
    </div>
  );
}
