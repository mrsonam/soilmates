"use client";

import { PendingButton } from "@/components/loading/pending-button";

type ArchiveConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  /** Shown on the confirm control while `busy` (default: Archiving…). */
  pendingLabel?: string;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
  error?: string | null;
};

export function ArchiveConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  pendingLabel = "Archiving…",
  onConfirm,
  busy = false,
  error,
}: ArchiveConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/40 p-4 sm:items-center"
      role="alertdialog"
      aria-modal
      aria-labelledby="archive-confirm-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-surface p-6 shadow-xl ring-1 ring-outline-variant/20">
        <h2
          id="archive-confirm-title"
          className="font-display text-lg font-semibold text-on-surface"
        >
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          {description}
        </p>
        {error ? (
          <p className="mt-3 rounded-2xl bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
            {error}
          </p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={onClose}
            className="rounded-2xl px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
          >
            Cancel
          </button>
          <PendingButton
            type="button"
            pending={busy}
            pendingLabel={pendingLabel}
            onClick={() => void onConfirm()}
            className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-on-primary hover:bg-primary/90 disabled:opacity-50"
          >
            {confirmLabel}
          </PendingButton>
        </div>
      </div>
    </div>
  );
}
