"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, MoreHorizontal, Pause, Pencil, Play, Trash2 } from "lucide-react";
import type { ReminderListItem } from "@/lib/reminders/queries";
import {
  archiveReminderAction,
  completeReminderAction,
  pauseReminderAction,
  resumeReminderAction,
} from "@/app/(app)/collections/[collectionSlug]/plants/reminder-actions";
import { SyncEntityType, SyncOperationType } from "@/lib/sync/operation-types";
import { runOrEnqueueMutation } from "@/lib/sync/run-or-enqueue";
import { DueDateLabel } from "@/components/reminders/due-date-label";
import { ReminderRecurrenceSummary } from "@/components/reminders/reminder-recurrence-summary";
import { ReminderStatusBadge } from "@/components/reminders/reminder-status-badge";
import { useState, useRef, useEffect } from "react";

type ReminderCardProps = {
  item: ReminderListItem;
  collectionSlug: string;
  plantSlug: string;
  onEdit: (item: ReminderListItem) => void;
};

export function ReminderCard({
  item,
  collectionSlug,
  plantSlug,
  onEdit,
}: ReminderCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    function close(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [menuOpen]);

  function run(
    operationType: string,
    payload: Record<string, unknown>,
    fn: () => Promise<{ ok: boolean; error?: string }>,
  ) {
    startTransition(async () => {
      const r = await runOrEnqueueMutation({
        operationType,
        entityType: SyncEntityType.REMINDER,
        entityId: item.id,
        payload,
        execute: fn,
      });
      if (r.ok) {
        try {
          router.refresh();
        } catch {
          /* ignore */
        }
      }
    });
  }

  const showMarkDone = !item.isPaused;

  return (
    <div className="relative rounded-2xl bg-surface-container-lowest/90 p-4 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold text-on-surface">
              {item.title}
            </h3>
            <ReminderStatusBadge status={item.status} />
          </div>
          <p className="mt-1">
            <ReminderRecurrenceSummary item={item} />
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            Next:{" "}
            <span className="font-medium text-on-surface">
              <DueDateLabel iso={item.nextDueAt} />
            </span>
          </p>
          {item.description ? (
            <p className="mt-2 line-clamp-2 text-xs text-on-surface-variant/90">
              {item.description}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {showMarkDone ? (
            <button
              type="button"
              disabled={pending}
              onClick={() =>
                run(
                  SyncOperationType.REMINDER_COMPLETE,
                  {
                    collectionSlug,
                    plantSlug,
                    reminderId: item.id,
                  },
                  () =>
                    completeReminderAction({
                      collectionSlug,
                      plantSlug,
                      reminderId: item.id,
                    }),
                )
              }
              className={[
                "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition disabled:opacity-50",
                item.status === "overdue" || item.status === "due"
                  ? "bg-primary text-on-primary hover:bg-primary/90"
                  : "bg-surface-container-high text-on-surface ring-1 ring-outline-variant/15 hover:bg-surface-container-highest",
              ].join(" ")}
            >
              <Check className="size-4" strokeWidth={2.25} aria-hidden />
              Mark done
            </button>
          ) : null}

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              disabled={pending}
              onClick={() => setMenuOpen((o) => !o)}
              className="flex size-10 items-center justify-center rounded-full text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
              aria-label="Reminder actions"
            >
              <MoreHorizontal className="size-5" strokeWidth={1.75} />
            </button>
            {menuOpen ? (
              <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-2xl border border-outline-variant/15 bg-surface-container-lowest py-1 shadow-lg ring-1 ring-black/5">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-low"
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(item);
                  }}
                >
                  <Pencil className="size-4 text-on-surface-variant" />
                  Edit
                </button>
                {item.isPaused ? (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-low"
                    onClick={() => {
                      setMenuOpen(false);
                      run(
                        SyncOperationType.REMINDER_RESUME,
                        {
                          collectionSlug,
                          plantSlug,
                          reminderId: item.id,
                        },
                        () =>
                          resumeReminderAction({
                            collectionSlug,
                            plantSlug,
                            reminderId: item.id,
                          }),
                      );
                    }}
                  >
                    <Play className="size-4 text-on-surface-variant" />
                    Resume
                  </button>
                ) : (
                  <button
                    type="button"
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-low"
                    onClick={() => {
                      setMenuOpen(false);
                      run(
                        SyncOperationType.REMINDER_PAUSE,
                        {
                          collectionSlug,
                          plantSlug,
                          reminderId: item.id,
                        },
                        () =>
                          pauseReminderAction({
                            collectionSlug,
                            plantSlug,
                            reminderId: item.id,
                          }),
                      );
                    }}
                  >
                    <Pause className="size-4 text-on-surface-variant" />
                    Pause
                  </button>
                )}
                <button
                  type="button"
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-on-surface hover:bg-surface-container-low"
                  onClick={() => {
                    setMenuOpen(false);
                    run(
                      SyncOperationType.REMINDER_ARCHIVE,
                      {
                        collectionSlug,
                        plantSlug,
                        reminderId: item.id,
                      },
                      () =>
                        archiveReminderAction({
                          collectionSlug,
                          plantSlug,
                          reminderId: item.id,
                        }),
                    );
                  }}
                >
                  <Trash2 className="size-4 text-on-surface-variant/80" />
                  Archive
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
