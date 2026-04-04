"use client";

import { useState } from "react";
import { formatShortDate } from "@/lib/format";
import type { PendingInviteRow } from "@/lib/collections/invites-queries";
import { RevokeInviteConfirmDialog } from "./revoke-invite-confirm-dialog";

type Props = {
  collectionSlug: string;
  invites: PendingInviteRow[];
};

export function PendingInvitesList({ collectionSlug, invites }: Props) {
  const [revoke, setRevoke] = useState<{ id: string; email: string } | null>(
    null,
  );

  if (invites.length === 0) {
    return (
      <p className="rounded-2xl border border-outline-variant/10 bg-surface-container-low/30 px-5 py-8 text-center text-sm text-on-surface-variant">
        No pending invites for this collection.
      </p>
    );
  }

  return (
    <>
      <ul className="space-y-2">
        {invites.map((i) => (
          <li
            key={i.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container-low/40 px-4 py-3"
          >
            <div className="min-w-0">
              <p className="truncate font-medium text-on-surface">{i.email}</p>
              <p className="text-xs text-on-surface-variant">
                Invited by{" "}
                {i.invitedByName?.trim()?.split(/\s+/)[0] ??
                  i.invitedByEmail.split("@")[0]}{" "}
                · {formatShortDate(i.createdAt)}
              </p>
              <span className="mt-1 inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.65rem] font-medium text-amber-900 dark:text-amber-100">
                Pending
              </span>
            </div>
            <button
              type="button"
              onClick={() => setRevoke({ id: i.id, email: i.email })}
              className="shrink-0 rounded-xl border border-outline-variant/40 px-3 py-1.5 text-xs font-medium text-on-surface-variant transition hover:bg-surface-container-high"
            >
              Revoke
            </button>
          </li>
        ))}
      </ul>
      {revoke ? (
        <RevokeInviteConfirmDialog
          collectionSlug={collectionSlug}
          inviteId={revoke.id}
          email={revoke.email}
          open
          onClose={() => setRevoke(null)}
        />
      ) : null}
    </>
  );
}
