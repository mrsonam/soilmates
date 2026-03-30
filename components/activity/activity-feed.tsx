import type { ActivityFeedItem as ActivityFeedItemType } from "@/lib/activity/queries";
import { ActivityEmptyState } from "./activity-empty-state";
import { ActivityFeedList } from "./activity-feed-list";

export function ActivityFeed({
  items,
  showCollectionChip = true,
}: {
  items: ActivityFeedItemType[];
  showCollectionChip?: boolean;
}) {
  if (items.length === 0) {
    return <ActivityEmptyState />;
  }
  return (
    <ActivityFeedList
      items={items}
      showCollectionChip={showCollectionChip}
    />
  );
}
