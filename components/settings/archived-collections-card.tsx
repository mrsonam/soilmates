"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FolderOpen, RotateCcw } from "lucide-react";
import type { ArchivedCollectionListItem } from "@/lib/archive/queries";
import { restoreCollectionAction } from "@/lib/archive/actions";
import { formatShortDate } from "@/lib/format";

type Props = {
  collections: ArchivedCollectionListItem[];
};

export function ArchivedCollectionsCard({ collections }: Props) {
  const router = useRouter();
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (collections.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">
        When you archive an entire collection, it will appear here so you can
        bring it back to your home list.
      </p>
    );
  }

  async function restore(slug: string) {
    setError(null);
    setBusySlug(slug);
    const r = await restoreCollectionAction({ collectionSlug: slug });
    setBusySlug(null);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    router.push(`/collections/${slug}`);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      {error ? (
        <p className="rounded-2xl bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
          {error}
        </p>
      ) : null}
      <ul className="divide-y divide-outline-variant/10 rounded-2xl bg-surface-container-low/50 ring-1 ring-outline-variant/10">
        {collections.map((c) => (
          <li
            key={c.id}
            className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex min-w-0 items-start gap-3">
              <FolderOpen
                className="mt-0.5 size-5 shrink-0 text-on-surface-variant"
                strokeWidth={1.5}
                aria-hidden
              />
              <div>
                <p className="font-medium text-on-surface">{c.name}</p>
                <p className="mt-0.5 text-xs text-on-surface-variant">
                  Archived {formatShortDate(c.archivedAt)}
                  {c.plantCount > 0
                    ? ` · ${c.plantCount} active plant${c.plantCount === 1 ? "" : "s"}`
                    : ""}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={busySlug !== null}
              onClick={() => void restore(c.slug)}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-primary/25 transition hover:bg-primary/10 disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" strokeWidth={1.75} aria-hidden />
              {busySlug === c.slug ? "Restoring…" : "Restore"}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
