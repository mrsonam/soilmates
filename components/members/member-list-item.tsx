"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { ActivityAvatar } from "@/components/activity/activity-type-icon";
import { formatShortDate } from "@/lib/format";
import type { MemberRow } from "@/lib/collections/invites-queries";
import { RemoveMemberConfirmDialog } from "./remove-member-confirm-dialog";

type Props = {
  collectionSlug: string;
  member: MemberRow;
  currentUserId: string;
  activeMemberCount: number;
};

export function MemberListItem({
  collectionSlug,
  member,
  currentUserId,
  activeMemberCount,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  const isSelf = member.userId === currentUserId;
  const canRemove = activeMemberCount > 1;

  const display =
    member.fullName?.trim() ||
    member.email.split("@")[0] ||
    "Member";

  return (
    <li className="list-none">
      <div className="flex items-center gap-3 rounded-2xl border border-outline-variant/15 bg-surface-container-low/50 px-4 py-3">
        <ActivityAvatar
          displayName={display}
          avatarUrl={member.avatarUrl}
          className="size-11"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-on-surface">{display}</p>
          <p className="truncate text-xs text-on-surface-variant">{member.email}</p>
          <p className="mt-0.5 text-[0.65rem] text-on-surface-variant/80">
            Joined {formatShortDate(member.joinedAt)}
          </p>
        </div>
        {canRemove ? (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex size-9 items-center justify-center rounded-xl text-on-surface-variant hover:bg-surface-container-high"
              aria-expanded={menuOpen}
              aria-haspopup="true"
              aria-label="Member actions"
            >
              <MoreHorizontal className="size-5" strokeWidth={1.75} />
            </button>
            {menuOpen ? (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 cursor-default"
                  aria-label="Close menu"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-full z-20 mt-1 min-w-[10rem] rounded-xl border border-outline-variant/20 bg-surface py-1 shadow-lg">
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-low"
                    onClick={() => {
                      setMenuOpen(false);
                      setConfirmRemove(true);
                    }}
                  >
                    {isSelf ? "Leave collection" : "Remove from collection"}
                  </button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      <RemoveMemberConfirmDialog
        collectionSlug={collectionSlug}
        memberId={member.id}
        displayName={display}
        open={confirmRemove}
        onClose={() => setConfirmRemove(false)}
      />
    </li>
  );
}
