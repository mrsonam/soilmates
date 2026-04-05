"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createCollectionInvite } from "@/app/actions/collection-invites";
import { PendingButton } from "@/components/loading/pending-button";

type Props = {
  collectionSlug: string;
  open: boolean;
  onClose: () => void;
};

export function InviteMemberDialog({ collectionSlug, open, onClose }: Props) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const r = await createCollectionInvite(collectionSlug, email);
    setBusy(false);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    setEmail("");
    onClose();
    router.refresh();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-on-surface/40 p-4 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="invite-title"
    >
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl bg-surface p-6 shadow-xl ring-1 ring-outline-variant/20">
        <h2
          id="invite-title"
          className="font-display text-lg font-semibold text-on-surface"
        >
          Invite someone
        </h2>
        <p className="mt-2 text-sm text-on-surface-variant">
          They&apos;ll see this invite when they sign in with that email. No
          link required.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="invite-email"
              className="text-xs font-medium text-on-surface-variant"
            >
              Email
            </label>
            <input
              id="invite-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              disabled={busy}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-primary/30 focus:ring-2 disabled:opacity-60"
              placeholder="friend@email.com"
            />
          </div>
          {error ? (
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          ) : null}
          <div className="flex flex-wrap justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-2xl px-4 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
            >
              Cancel
            </button>
            <PendingButton
              type="submit"
              pending={busy}
              pendingLabel="Sending…"
              className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-on-primary disabled:opacity-50"
            >
              Send invite
            </PendingButton>
          </div>
        </form>
      </div>
    </div>
  );
}
