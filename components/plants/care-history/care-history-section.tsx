"use client";

import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import type { CareLogListItem } from "@/lib/plants/care-logs";
import {
  CareHistoryFilters,
  matchesCareHistoryFilter,
  type CareHistoryFilterId,
} from "./care-history-filters";
import { CareHistoryEmptyState } from "./care-history-empty-state";
import { CareLogTimeline } from "./care-log-timeline";
import { CareLogFormDialog } from "./care-log-form-dialog";
import { DeleteCareLogDialog } from "./delete-care-log-dialog";

type CareHistorySectionProps = {
  collectionSlug: string;
  plantSlug: string;
  plantNickname: string;
  logs: CareLogListItem[];
  currentUserId: string;
};

export function CareHistorySection({
  collectionSlug,
  plantSlug,
  plantNickname,
  logs,
  currentUserId,
}: CareHistorySectionProps) {
  const [filter, setFilter] = useState<CareHistoryFilterId>("all");
  const [addOpen, setAddOpen] = useState(false);
  const [editLog, setEditLog] = useState<CareLogListItem | null>(null);
  const [deleteLog, setDeleteLog] = useState<CareLogListItem | null>(null);

  const filtered = useMemo(
    () => logs.filter((l) => matchesCareHistoryFilter(l.actionType, filter)),
    [logs, filter],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-display text-xl font-semibold text-on-surface sm:text-2xl">
            Care history
          </h3>
          <p className="mt-1 text-sm text-on-surface-variant">
            Everything {plantNickname} has been through in your care.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOpen(true)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-medium text-on-primary transition hover:bg-primary/90 sm:self-auto"
        >
          <Plus className="size-4" strokeWidth={2.25} aria-hidden />
          Add log
        </button>
      </div>

      {logs.length > 0 ? (
        <CareHistoryFilters active={filter} onChange={setFilter} />
      ) : null}

      {logs.length === 0 ? (
        <CareHistoryEmptyState onAddLog={() => setAddOpen(true)} />
      ) : filtered.length === 0 ? (
        <p className="rounded-3xl bg-surface-container-low/50 px-6 py-10 text-center text-sm text-on-surface-variant ring-1 ring-outline-variant/10">
          No logs in this filter yet. Try another category or add a new entry.
        </p>
      ) : (
        <CareLogTimeline
          logs={filtered}
          currentUserId={currentUserId}
          onEdit={setEditLog}
          onDelete={setDeleteLog}
        />
      )}

      <CareLogFormDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        collectionSlug={collectionSlug}
        plantSlug={plantSlug}
        mode="add"
      />
      <CareLogFormDialog
        open={editLog !== null}
        onClose={() => setEditLog(null)}
        collectionSlug={collectionSlug}
        plantSlug={plantSlug}
        mode="edit"
        initialLog={editLog ?? undefined}
      />
      <DeleteCareLogDialog
        open={deleteLog !== null}
        onClose={() => setDeleteLog(null)}
        collectionSlug={collectionSlug}
        plantSlug={plantSlug}
        log={deleteLog}
      />
    </div>
  );
}
