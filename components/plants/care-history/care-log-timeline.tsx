"use client";

import type { CareLogListItem } from "@/lib/plants/care-logs";
import { CareLogItem } from "./care-log-item";

type CareLogTimelineProps = {
  logs: CareLogListItem[];
  currentUserId: string;
  onEdit: (log: CareLogListItem) => void;
  onDelete: (log: CareLogListItem) => void;
};

export function CareLogTimeline({
  logs,
  currentUserId,
  onEdit,
  onDelete,
}: CareLogTimelineProps) {
  return (
    <ul className="space-y-0">
      {logs.map((log, i) => (
        <CareLogItem
          key={log.id}
          log={log}
          isOwner={log.createdById === currentUserId}
          isLast={i === logs.length - 1}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
