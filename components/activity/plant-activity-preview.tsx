import Link from "next/link";
import type { ActivityFeedItem } from "@/lib/activity/queries";
import { ActivityFeedList } from "./activity-feed-list";

export function PlantActivityPreview({
  collectionSlug,
  items,
}: {
  collectionSlug: string;
  items: ActivityFeedItem[];
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant">
        Plant-related updates from your household will show here — care actions,
        photos, and reminders.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <ActivityFeedList
        items={items.slice(0, 4)}
        showCollectionChip={false}
      />
      <Link
        href={`/activity?collection=${encodeURIComponent(collectionSlug)}`}
        className="inline-block text-sm font-medium text-primary transition hover:underline"
      >
        View all activity in this collection
      </Link>
    </div>
  );
}
