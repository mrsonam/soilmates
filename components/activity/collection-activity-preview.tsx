import Link from "next/link";
import type { ActivityFeedItem } from "@/lib/activity/queries";
import { sortActivityFeedItemsStable } from "@/lib/activity/sort-activity-feed";
import { ActivityAvatar, ActivityTypeIcon } from "./activity-type-icon";
import { ActivityTimestamp } from "./activity-timestamp";

export function CollectionActivityPreview({
  collectionSlug,
  items,
}: {
  collectionSlug: string;
  items: ActivityFeedItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-outline-variant/20 bg-surface-container-low/30 px-5 py-8 text-center text-sm text-on-surface-variant">
        No recent activity in this space yet. Care for a plant or add a photo to
        see updates here.
      </div>
    );
  }

  const previewItems = sortActivityFeedItemsStable(items).slice(0, 5);

  return (
    <ul className="divide-y divide-outline-variant/10">
      {previewItems.map((item) => {
        const actorName = item.actor?.displayName ?? "Someone";
        const avatarUrl = item.actor?.avatarUrl ?? null;
        return (
          <li
            key={item.id}
            className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="relative shrink-0">
              <ActivityAvatar
                displayName={actorName}
                avatarUrl={avatarUrl}
                className="size-12"
              />
              <span className="absolute -bottom-0.5 -right-0.5 flex size-6 items-center justify-center rounded-full bg-surface shadow-sm ring-2 ring-surface">
                <ActivityTypeIcon
                  eventType={item.eventType}
                  className="size-3.5 text-primary"
                />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-on-surface">{item.summary}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-on-surface-variant">
                <ActivityTimestamp iso={item.createdAt} />
              </p>
            </div>
          </li>
        );
      })}
      <li className="pt-4">
        <Link
          href={`/collections/${collectionSlug}/activity`}
          className="text-sm font-medium text-primary transition hover:underline"
        >
          View full activity
        </Link>
      </li>
    </ul>
  );
}
