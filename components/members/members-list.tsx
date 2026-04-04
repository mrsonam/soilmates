import type { MemberRow } from "@/lib/collections/invites-queries";
import { MemberListItem } from "./member-list-item";

type Props = {
  collectionSlug: string;
  members: MemberRow[];
  currentUserId: string;
};

export function MembersList({ collectionSlug, members, currentUserId }: Props) {
  const activeMemberCount = members.length;

  if (members.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-outline-variant/30 bg-surface-container-low/40 px-6 py-10 text-center text-sm text-on-surface-variant">
        No members yet.
      </p>
    );
  }

  return (
    <ul className="space-y-2">
      {members.map((m) => (
        <MemberListItem
          key={m.id}
          collectionSlug={collectionSlug}
          member={m}
          currentUserId={currentUserId}
          activeMemberCount={activeMemberCount}
        />
      ))}
    </ul>
  );
}
