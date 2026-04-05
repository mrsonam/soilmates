"use client";

import { usePendingInvitationsQuery } from "@/hooks/use-pending-invitations-query";
import type { InvitationCardData } from "@/components/invitations/invitation-card";
import { InvitationCard } from "@/components/invitations/invitation-card";

type Props = {
  initialInvites: InvitationCardData[];
};

export function InvitationsListClient({ initialInvites }: Props) {
  const { data: invites = [] } = usePendingInvitationsQuery(initialInvites);

  if (invites.length === 0) {
    return (
      <div className="mt-12 rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-8 py-14 text-center">
        <p className="font-display text-lg font-medium text-on-surface">
          No pending invites right now
        </p>
        <p className="mt-2 text-sm text-on-surface-variant">
          When someone invites you by email, it will show up here after you
          sign in.
        </p>
      </div>
    );
  }

  return (
    <ul className="mt-10 space-y-6">
      {invites.map((item) => (
        <InvitationCard key={item.id} item={item} />
      ))}
    </ul>
  );
}
