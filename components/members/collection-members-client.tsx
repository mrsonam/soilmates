"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import type { MemberRow, PendingInviteRow } from "@/lib/collections/invites-queries";
import { MembersList } from "./members-list";
import { PendingInvitesList } from "./pending-invites-list";
import { InviteMemberDialog } from "./invite-member-dialog";

type Props = {
  collectionSlug: string;
  currentUserId: string;
  members: MemberRow[];
  pendingInvites: PendingInviteRow[];
};

export function CollectionMembersClient({
  collectionSlug,
  currentUserId,
  members,
  pendingInvites,
}: Props) {
  const [inviteOpen, setInviteOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-on-surface-variant">
          <span className="font-medium text-on-surface">{members.length}</span>{" "}
          active {members.length === 1 ? "member" : "members"}
        </p>
        <button
          type="button"
          onClick={() => setInviteOpen(true)}
          className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition hover:bg-primary/90"
        >
          <UserPlus className="size-4" strokeWidth={1.75} aria-hidden />
          Invite member
        </button>
      </div>

      <section className="mt-10">
        <h3 className="font-display text-base font-semibold text-on-surface">
          People in this space
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Everyone has the same access to plants, reminders, and activity.
        </p>
        <div className="mt-4">
          <MembersList
            collectionSlug={collectionSlug}
            members={members}
            currentUserId={currentUserId}
          />
        </div>
      </section>

      <section className="mt-12">
        <h3 className="font-display text-base font-semibold text-on-surface">
          Pending invites
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Invites appear in their Soil Mates inbox when they sign in with that
          email.
        </p>
        <div className="mt-4">
          <PendingInvitesList
            collectionSlug={collectionSlug}
            invites={pendingInvites}
          />
        </div>
      </section>

      <InviteMemberDialog
        collectionSlug={collectionSlug}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </>
  );
}
