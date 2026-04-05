import type { ActivityFeedItem } from "@/lib/activity/queries";

/** Newest first; tie-break on id so list order is stable across refreshes. */
export function sortActivityFeedItemsStable(
  items: ActivityFeedItem[],
): ActivityFeedItem[] {
  return [...items].sort((a, b) => {
    const dt =
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (dt !== 0) return dt;
    return a.id.localeCompare(b.id);
  });
}
