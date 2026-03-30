import Link from "next/link";
import type { ActivityFeedItem as ActivityFeedItemType } from "@/lib/activity/queries";
import { ActivityAvatar, ActivityTypeIcon } from "./activity-type-icon";
import { ActivityTimestamp } from "./activity-timestamp";

type ActivityFeedItemProps = {
  item: ActivityFeedItemType;
  /** Hide collection chip when already scoped to one collection */
  showCollectionChip?: boolean;
};

export function ActivityFeedItem({
  item,
  showCollectionChip = true,
}: ActivityFeedItemProps) {
  const actorName = item.actor?.displayName ?? "Someone";
  const avatarUrl = item.actor?.avatarUrl ?? null;

  return (
    <article className="group flex gap-4 rounded-2xl bg-surface-container-lowest/80 p-4 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] transition ring-inset hover:ring-outline-variant/15 sm:gap-5 sm:p-5">
      <div className="relative shrink-0">
        <ActivityAvatar displayName={actorName} avatarUrl={avatarUrl} />
        <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full bg-surface shadow-sm ring-2 ring-surface">
          <ActivityTypeIcon eventType={item.eventType} className="size-3.5 text-primary" />
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-start justify-between gap-2 gap-y-1">
          <p className="text-sm leading-snug text-on-surface">{item.summary}</p>
          <ActivityTimestamp iso={item.createdAt} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {showCollectionChip && (
            <Link
              href={`/collections/${item.collection.slug}`}
              className="inline-flex max-w-full items-center rounded-full bg-surface-container-high/80 px-2.5 py-0.5 text-[0.7rem] font-medium text-on-surface-variant ring-1 ring-outline-variant/12 transition hover:bg-surface-container-high hover:text-on-surface"
            >
              {item.collection.name}
            </Link>
          )}
          {item.plant && (
            <Link
              href={`/collections/${item.collection.slug}/plants/${item.plant.slug}`}
              className="inline-flex max-w-full items-center rounded-full bg-primary/8 px-2.5 py-0.5 text-[0.7rem] font-medium text-primary ring-1 ring-primary/15 transition hover:bg-primary/12"
            >
              {item.plant.nickname}
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
