import type { ActivityFeedItem as ActivityFeedItemType } from "@/lib/activity/queries";
import { ActivityFeedItem } from "./activity-feed-item";

export function ActivityFeedList({
  items,
  showCollectionChip = true,
}: {
  items: ActivityFeedItemType[];
  showCollectionChip?: boolean;
}) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
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
