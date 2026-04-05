"use client";

import {
  Check,
  Loader2,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Trash2,
} from "lucide-react";
import type { ReminderListItem } from "@/lib/reminders/queries";
import { useReminderMutations } from "@/hooks/mutations/reminder-mutations";
import { isOptimisticReminderId } from "@/lib/optimistic/reminder-optimistic";
import { DueDateLabel } from "@/components/reminders/due-date-label";
import { ReminderRecurrenceSummary } from "@/components/reminders/reminder-recurrence-summary";
import { ReminderStatusBadge } from "@/components/reminders/reminder-status-badge";
import { useState, useRef, useEffect, memo } from "react";

type ReminderCardProps = {
  item: ReminderListItem;
  onEdit: (item: ReminderListItem) => void;
  mutations: ReturnType<typeof useReminderMutations>;
};

function ReminderCardInner({
  item,
  onEdit,
  mutations,
}: ReminderCardProps) {
  const { complete, pause, resume, archive } = mutations;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const pending =
    (complete.isPending && complete.variables === item.id) ||
    (pause.isPending && pause.variables === item.id) ||
    (resume.isPending && resume.variables === item.id) ||
    (archive.isPending && archive.variables === item.id);

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

  const showMarkDone = !item.isPaused;

  return (
    <div className="relative rounded-2xl bg-surface-container-lowest/90 p-4 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-base font-semibold text-on-surface">
              {item.title}
            </h3>
            {isOptimisticReminderId(item.id) ? (
              <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[0.65rem] font-medium text-primary ring-1 ring-primary/20">
                Saving…
              </span>
            ) : null}
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
              aria-busy={pending}
              onClick={() => complete.mutate(item.id)}
              className={[
                "inline-flex h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition disabled:opacity-50",
                item.status === "overdue" || item.status === "due"
                  ? "bg-primary text-on-primary hover:bg-primary/90"
                  : "bg-surface-container-high text-on-surface ring-1 ring-outline-variant/15 hover:bg-surface-container-highest",
              ].join(" ")}
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Check className="size-4" strokeWidth={2.25} aria-hidden />
              )}
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
                      resume.mutate(item.id);
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
                      pause.mutate(item.id);
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
                    archive.mutate(item.id);
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

export const ReminderCard = memo(ReminderCardInner);
