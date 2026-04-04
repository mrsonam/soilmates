"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { revokeCollectionInvite } from "@/app/actions/collection-invites";

type Props = {
  collectionSlug: string;
  inviteId: string;
  email: string;
  open: boolean;
  onClose: () => void;
};

export function RevokeInviteConfirmDialog({
  collectionSlug,
  inviteId,
  email,
  open,
  onClose,
}: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function confirm() {
    setBusy(true);
    setError(null);
    const r = await revokeCollectionInvite(collectionSlug, inviteId);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/40 p-4 sm:items-center"
      role="alertdialog"
      aria-modal
      aria-labelledby="revoke-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-surface p-6 shadow-xl ring-1 ring-outline-variant/20">
        <h2
          id="revoke-title"
          className="font-display text-lg font-semibold text-on-surface"
        >
          Revoke invite?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          The pending invite to{" "}
          <span className="font-medium text-on-surface">{email}</span> will be
          cancelled.
        </p>
        {error ? (
          <p className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={confirm}
            className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-on-primary disabled:opacity-50"
          >
            {busy ? "Revoking…" : "Revoke invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
