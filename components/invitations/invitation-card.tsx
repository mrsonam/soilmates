"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  acceptCollectionInvite,
  declineCollectionInvite,
} from "@/app/actions/collection-invites";
import { formatMediumDateTime } from "@/lib/format";

export type InvitationCardData = {
  id: string;
  createdAt: string;
  collection: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  invitedBy: {
    name: string | null;
    email: string;
  };
};

export function InvitationCard({ item }: { item: InvitationCardData }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"accept" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const inviter =
    item.invitedBy.name?.trim()?.split(/\s+/)[0] ??
    item.invitedBy.email.split("@")[0];

  async function onAccept() {
    setBusy("accept");
    setError(null);
    const r = await acceptCollectionInvite(item.id);
    setBusy(null);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    router.push(`/collections/${r.collectionSlug}`);
    router.refresh();
  }

  async function onDecline() {
    setBusy("decline");
    setError(null);
    const r = await declineCollectionInvite(item.id);
    setBusy(null);
    if (!r.ok) {
      setError(r.error);
      return;
    }
    router.refresh();
  }

  return (
    <li className="rounded-3xl border border-outline-variant/15 bg-surface-container-low/50 p-6 shadow-sm ring-1 ring-outline-variant/[0.06]">
      <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
        {item.collection.name}
      </p>
      {item.collection.description?.trim() ? (
        <p className="mt-2 line-clamp-2 text-sm text-on-surface-variant">
          {item.collection.description.trim()}
        </p>
      ) : null}
      <p className="mt-4 text-sm text-on-surface">
        <span className="font-medium text-on-surface">{inviter}</span> invited
        you to care for this collection together.
      </p>
      <p className="mt-2 text-xs text-on-surface-variant">
        {formatMediumDateTime(item.createdAt)}
      </p>
      {error ? (
        <p className="mt-3 text-sm text-red-700 dark:text-red-300">{error}</p>
      ) : null}
      <div className="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy !== null}
          onClick={onAccept}
          className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-on-primary disabled:opacity-50"
        >
          {busy === "accept" ? "Joining…" : "Accept"}
        </button>
        <button
          type="button"
          disabled={busy !== null}
          onClick={onDecline}
          className="rounded-2xl border border-outline-variant/40 px-5 py-2.5 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high disabled:opacity-50"
        >
          {busy === "decline" ? "Declining…" : "Decline"}
        </button>
      </div>
    </li>
  );
}
