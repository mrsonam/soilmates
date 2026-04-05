"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Archive } from "lucide-react";
import { archivePlantAction } from "@/lib/archive/actions";
import { ArchiveConfirmDialog } from "@/components/archive/archive-confirm-dialog";

type PlantArchiveSectionProps = {
  collectionSlug: string;
  plantSlug: string;
  nickname: string;
};

export function PlantArchiveSection({
  collectionSlug,
  plantSlug,
  nickname,
}: PlantArchiveSectionProps) {
  const router = useRouter();
  const [, startNav] = useTransition();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setBusy(true);
    setError(null);
    const r = await archivePlantAction({ collectionSlug, plantSlug });
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setOpen(false);
    startNav(() => {
      router.push(`/collections/${collectionSlug}/archive`);
      router.refresh();
    });
  }

  return (
    <>
      <section className="rounded-3xl border border-outline-variant/15 bg-surface-container-low/30 p-5">
        <div className="flex flex-wrap items-start gap-3">
          <Archive
            className="mt-0.5 size-5 shrink-0 text-on-surface-variant"
            strokeWidth={1.5}
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold text-on-surface">
              Archive this plant
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Removes {nickname} from active lists and reminders. Care history,
              photos, and diagnoses stay in your archive — you can restore
              anytime.
            </p>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setOpen(true);
              }}
              className="mt-4 rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface ring-1 ring-outline-variant/20 hover:bg-surface-container-highest"
            >
              Archive plant…
            </button>
          </div>
        </div>
      </section>

      <ArchiveConfirmDialog
        open={open}
        onClose={() => !busy && setOpen(false)}
        title={`Archive ${nickname}?`}
        description="This plant will rest out of sight in your collection archive. Nothing is deleted — logs and photos remain yours."
        confirmLabel="Archive plant"
        busy={busy}
        error={error}
        onConfirm={confirm}
      />
    </>
  );
}
