"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { ReminderListItem } from "@/lib/reminders/queries";
import { usePlantRemindersQuery } from "@/hooks/use-plant-reminders-query";
import { useReminderMutations } from "@/hooks/mutations/reminder-mutations";
import { ReminderCard } from "@/components/reminders/reminder-card";
import { ReminderEmptyState } from "@/components/reminders/reminder-empty-state";
import { CreateReminderDialog } from "@/components/reminders/create-reminder-dialog";
import { EditReminderDialog } from "@/components/reminders/edit-reminder-dialog";

type PlantRemindersSectionProps = {
  collectionSlug: string;
  plantSlug: string;
  serverReminders: ReminderListItem[];
};

export function PlantRemindersSection({
  collectionSlug,
  plantSlug,
  serverReminders,
}: PlantRemindersSectionProps) {
  const [createOpen, setCreateOpen] = useState(false);
  const [editItem, setEditItem] = useState<ReminderListItem | null>(null);

  const { data: reminders = [] } = usePlantRemindersQuery(
    collectionSlug,
    plantSlug,
    serverReminders,
  );
  const mutations = useReminderMutations(collectionSlug, plantSlug);

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            Care rhythm
          </p>
          <h2 className="mt-1 font-display text-xl font-semibold text-on-surface">
            Reminders
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-on-surface-variant">
            Recurring tasks keep care predictable. Mark complete anytime — we
            reschedule the next due date for you.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary px-5 text-sm font-medium text-on-primary transition hover:bg-primary/90 sm:self-auto"
        >
          <Plus className="size-4" strokeWidth={2.25} aria-hidden />
          Add reminder
        </button>
      </div>

      {reminders.length === 0 ? (
        <ReminderEmptyState onAdd={() => setCreateOpen(true)} />
      ) : (
        <ul className="space-y-4">
          {reminders.map((r) => (
            <li key={r.id}>
              <ReminderCard
                item={r}
                onEdit={(item) => setEditItem(item)}
                mutations={mutations}
              />
            </li>
          ))}
        </ul>
      )}

      <CreateReminderDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        collectionSlug={collectionSlug}
        plantSlug={plantSlug}
      />
      <EditReminderDialog
        open={editItem !== null}
        onClose={() => setEditItem(null)}
        collectionSlug={collectionSlug}
        plantSlug={plantSlug}
        item={editItem}
      />
    </section>
  );
}
