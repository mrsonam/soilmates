import type { ActivityFeedItem as ActivityFeedItemType } from "@/lib/activity/queries";
import { sortActivityFeedItemsStable } from "@/lib/activity/sort-activity-feed";
import { ActivityFeedItem } from "./activity-feed-item";

export function ActivityFeedList({
  items,
  showCollectionChip = true,
}: {
  items: ActivityFeedItemType[];
  showCollectionChip?: boolean;
}) {
  const sorted = sortActivityFeedItemsStable(items);
  return (
    <ul className="space-y-3">
      {sorted.map((item) => (
        <li key={item.id}>
          <ActivityFeedItem
            item={item}
            showCollectionChip={showCollectionChip}
          />
        </li>
      ))}
    </ul>
  );
}
