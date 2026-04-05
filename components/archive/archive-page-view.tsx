"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive, Leaf, MapPin } from "lucide-react";
import type {
  ArchivedAreaListItem,
  ArchivedPlantListItem,
} from "@/lib/archive/queries";
import {
  archiveCollectionAction,
  restoreAreaAction,
  restorePlantAction,
} from "@/lib/archive/actions";
import { ArchiveEmptyState } from "@/components/archive/archive-empty-state";
import { RestoreButton } from "@/components/archive/restore-button";
import { ArchiveConfirmDialog } from "@/components/archive/archive-confirm-dialog";
import { formatShortDate } from "@/lib/format";

type ArchivePageViewProps = {
  collectionSlug: string;
  collectionName: string;
  plants: ArchivedPlantListItem[];
  areas: ArchivedAreaListItem[];
  canArchiveCollection: boolean;
};

export function ArchivePageView({
  collectionSlug,
  collectionName,
  plants,
  areas,
  canArchiveCollection,
}: ArchivePageViewProps) {
  const router = useRouter();
  const [, startNav] = useTransition();
  const [confirmCollection, setConfirmCollection] = useState(false);
  const [busy, setBusy] = useState(false);
  const [collError, setCollError] = useState<string | null>(null);

  const empty = plants.length === 0 && areas.length === 0;

  async function archiveCollection() {
    setCollError(null);
    setBusy(true);
    const r = await archiveCollectionAction({ collectionSlug });
    setBusy(false);
    if (!r.ok) {
      setCollError(r.error);
      return;
    }
    setConfirmCollection(false);
    startNav(() => {
      router.push("/collections");
      router.refresh();
    });
  }

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/90">
          {collectionName}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-on-surface">
          Archive
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-on-surface-variant">
          Archived plants and areas stay in your history. Restore them when
          you&apos;re ready — nothing is lost in the background.
        </p>
      </header>

      {empty ? (
        <ArchiveEmptyState />
      ) : (
        <div className="space-y-10">
          {plants.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Leaf
                  className="size-5 text-primary"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <h2 className="font-display text-lg font-semibold text-on-surface">
                  Plants
                </h2>
              </div>
              <ul className="divide-y divide-outline-variant/10 rounded-3xl bg-surface-container-lowest/60 ring-1 ring-outline-variant/[0.08]">
                {plants.map((p) => (
                  <li
                    key={p.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div className="min-w-0">
                      <Link
                        href={`/collections/${collectionSlug}/plants/${p.slug}`}
                        className="font-medium text-on-surface hover:text-primary"
                      >
                        {p.nickname}
                      </Link>
                      {p.referenceCommonName ? (
                        <p className="text-sm italic text-on-surface-variant">
                          {p.referenceCommonName}
                        </p>
                      ) : null}
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {p.areaName} · archived{" "}
                        {formatShortDate(p.archivedAt)}
                      </p>
                    </div>
                    <RestoreButton
                      onRestore={() =>
                        restorePlantAction({
                          collectionSlug,
                          plantSlug: p.slug,
                        })
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {areas.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <MapPin
                  className="size-5 text-primary"
                  strokeWidth={1.75}
                  aria-hidden
                />
                <h2 className="font-display text-lg font-semibold text-on-surface">
                  Areas
                </h2>
              </div>
              <ul className="divide-y divide-outline-variant/10 rounded-3xl bg-surface-container-lowest/60 ring-1 ring-outline-variant/[0.08]">
                {areas.map((a) => (
                  <li
                    key={a.id}
                    className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                  >
                    <div>
                      <p className="font-medium text-on-surface">{a.name}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        Archived {formatShortDate(a.archivedAt)}
                      </p>
                    </div>
                    <RestoreButton
                      onRestore={() =>
                        restoreAreaAction({
                          collectionSlug,
                          areaId: a.id,
                        })
                      }
                    />
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </div>
      )}

      {canArchiveCollection ? (
        <section className="rounded-3xl border border-outline-variant/15 bg-surface-container-low/40 p-6">
          <div className="flex flex-wrap items-start gap-3">
            <Archive
              className="mt-0.5 size-5 shrink-0 text-on-surface-variant"
              strokeWidth={1.5}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-base font-semibold text-on-surface">
                Archive this collection
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                When there are no active plants left, you can archive the whole
                space. It will disappear from your home list until you restore
                it from account settings.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCollError(null);
                  setConfirmCollection(true);
                }}
                className="mt-4 rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface ring-1 ring-outline-variant/20 hover:bg-surface-container-highest"
              >
                Archive collection…
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <ArchiveConfirmDialog
        open={confirmCollection}
        onClose={() => !busy && setConfirmCollection(false)}
        title={`Archive ${collectionName}?`}
        description="The collection will leave your main list. You can restore it later from Settings → Data & privacy. Shared members keep their membership."
        confirmLabel="Archive collection"
        busy={busy}
        error={collError}
        onConfirm={archiveCollection}
      />
    </div>
  );
}
