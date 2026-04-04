import Link from "next/link";
import { Users } from "lucide-react";

type Props = {
  collectionSlug: string;
  memberCount: number;
};

export function CollectionMembersPreview({
  collectionSlug,
  memberCount,
}: Props) {
  return (
    <section className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest/80 p-6 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.06] sm:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Users className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h3 className="font-display text-lg font-semibold text-on-surface">
              Sharing this space
            </h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              {memberCount === 1
                ? "You’re the only one here for now."
                : `${memberCount} people care for plants in this collection together.`}
            </p>
          </div>
        </div>
        <Link
          href={`/collections/${collectionSlug}/members`}
          className="shrink-0 rounded-2xl border border-outline-variant/30 bg-surface px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-low"
        >
          {memberCount === 1 ? "Invite someone" : "Members"}
        </Link>
      </div>
    </section>
  );
}
