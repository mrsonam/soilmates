"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
} from "@/hooks/mutations/invitation-mutations";
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
  const [error, setError] = useState<string | null>(null);
  const accept = useAcceptInvitationMutation();
  const decline = useDeclineInvitationMutation();

  const pendingAccept =
    accept.isPending && accept.variables === item.id;
  const pendingDecline =
    decline.isPending && decline.variables === item.id;

  const inviter =
    item.invitedBy.name?.trim()?.split(/\s+/)[0] ??
    item.invitedBy.email.split("@")[0];

  function onAccept() {
    setError(null);
    accept.mutate(item.id, {
      onError: (e) => {
        setError(e instanceof Error ? e.message : "Could not accept.");
      },
    });
  }

  function onDecline() {
    setError(null);
    decline.mutate(item.id, {
      onError: (e) => {
        setError(e instanceof Error ? e.message : "Could not decline.");
      },
    });
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
          disabled={pendingAccept || pendingDecline}
          onClick={onAccept}
          aria-busy={pendingAccept}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-2.5 text-sm font-medium text-on-primary disabled:opacity-50"
        >
          {pendingAccept ? (
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          ) : null}
          {pendingAccept ? "Joining…" : "Accept"}
        </button>
        <button
          type="button"
          disabled={pendingAccept || pendingDecline}
          onClick={onDecline}
          aria-busy={pendingDecline}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-outline-variant/40 px-5 py-2.5 text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-high disabled:opacity-50"
        >
          {pendingDecline ? (
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          ) : null}
          {pendingDecline ? "Declining…" : "Decline"}
        </button>
      </div>
    </li>
  );
}
