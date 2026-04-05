"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { CareLogListItem } from "@/lib/plants/care-logs";
import { useDeleteCareLogMutation } from "@/hooks/mutations/plant-care-mutations";
import { PendingButton } from "@/components/loading/pending-button";

type DeleteCareLogDialogProps = {
  open: boolean;
  onClose: () => void;
  collectionSlug: string;
  plantSlug: string;
  log: CareLogListItem | null;
};

export function DeleteCareLogDialog({
  open,
  onClose,
  collectionSlug,
  plantSlug,
  log,
}: DeleteCareLogDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const deleteMut = useDeleteCareLogMutation(collectionSlug, plantSlug);
  const pending = deleteMut.isPending;

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      setError(null);
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  async function confirm() {
    if (!log) return;
    setError(null);
    try {
      await deleteMut.mutateAsync({
        collectionSlug,
        plantSlug,
        careLogId: log.id,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not remove.");
    }
  }

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-[70] w-[min(100vw-1.5rem,22rem)] -translate-x-1/2 -translate-y-1/2 rounded-3xl border-0 bg-surface-container-lowest p-0 shadow-[0_28px_56px_-16px_rgba(27,28,26,0.18)] backdrop:bg-on-surface/30 backdrop:backdrop-blur-sm"
      aria-labelledby="delete-care-log-title"
      onClose={onClose}
      onCancel={(ev) => {
        ev.preventDefault();
        onClose();
      }}
    >
      {open && log ? (
        <div className="p-6 sm:p-7">
          <div className="flex items-start justify-between gap-3">
            <h2
              id="delete-care-log-title"
              className="font-display text-lg font-semibold text-on-surface"
            >
              Remove this log?
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-low"
              aria-label="Close"
            >
              <X className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            This care entry will be hidden from history. You can’t undo this,
            but your plant’s other data stays safe.
          </p>
          {error ? (
            <p className="mt-3 text-sm text-red-700" role="alert">
              {error}
            </p>
          ) : null}
          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="h-11 flex-1 rounded-full bg-surface-container-high text-sm font-medium text-on-surface ring-1 ring-outline-variant/15 transition hover:bg-surface-container-highest disabled:opacity-40"
            >
              Cancel
            </button>
            <PendingButton
              type="button"
              pending={pending}
              pendingLabel="Removing…"
              onClick={confirm}
              className="h-11 flex-1 rounded-full bg-red-700 text-sm font-medium text-white transition hover:bg-red-800 disabled:opacity-60"
            >
              Remove
            </PendingButton>
          </div>
        </div>
      ) : null}
    </dialog>
  );
}
