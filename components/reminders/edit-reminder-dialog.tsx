"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { updateReminderAction } from "@/app/(app)/collections/[collectionSlug]/plants/reminder-actions";
import type { ReminderListItem } from "@/lib/reminders/queries";
import { INTERVAL_UNITS, PREFERRED_WINDOWS } from "@/lib/reminders/constants";
import type { ReminderType } from "@prisma/client";
import { defaultTitleForReminderType } from "@/lib/reminders/labels";

type EditReminderDialogProps = {
  open: boolean;
  onClose: () => void;
  collectionSlug: string;
  plantSlug: string;
  item: ReminderListItem | null;
};

export function EditReminderDialog({
  open,
  onClose,
  collectionSlug,
  plantSlug,
  item,
}: EditReminderDialogProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && item) {
      setError(null);
      el.showModal();
    } else {
      el.close();
    }
  }, [open, item]);

  const onSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!item) return;
      const fd = new FormData(e.currentTarget);
      startTransition(async () => {
        const res = await updateReminderAction({
          collectionSlug,
          plantSlug,
          reminderId: item.id,
          title: String(fd.get("title") ?? ""),
          description: String(fd.get("description") ?? "") || undefined,
          intervalValue: Number(fd.get("intervalValue")),
          intervalUnit: fd.get("intervalUnit") as "days" | "weeks" | "months",
          preferredWindow:
            (fd.get("preferredWindow") as string) || undefined || null,
          gracePeriodHours: fd.get("gracePeriodHours")
            ? Number(fd.get("gracePeriodHours"))
            : undefined,
          overdueAfterHours: fd.get("overdueAfterHours")
            ? Number(fd.get("overdueAfterHours"))
            : undefined,
        });
        if (res.ok) {
          onClose();
          router.refresh();
        } else {
          setError(res.error);
        }
      });
    },
    [collectionSlug, plantSlug, item, onClose, router],
  );

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-60 w-[min(100vw-1.5rem,28rem)] max-h-[min(90dvh,40rem)] -translate-x-1/2 -translate-y-1/2 modal-scroll rounded-3xl border-0 bg-surface-container-lowest p-0 shadow-[0_28px_56px_-16px_rgba(27,28,26,0.18)] backdrop:bg-on-surface/25 backdrop:backdrop-blur-sm"
      aria-labelledby="edit-reminder-title"
      onClose={onClose}
      onCancel={(ev) => {
        ev.preventDefault();
        onClose();
      }}
    >
      {open && item ? (
        <form onSubmit={onSubmit} className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <h2
              id="edit-reminder-title"
              className="font-display text-xl font-semibold tracking-tight text-on-surface"
            >
              Edit reminder
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
              aria-label="Close"
            >
              <X className="size-5" strokeWidth={1.5} />
            </button>
          </div>
          <p className="mt-2 text-sm text-on-surface-variant">
            {defaultTitleForReminderType(item.reminderType as ReminderType)}
          </p>

          {error ? (
            <p role="alert" className="mt-4 text-sm text-red-800 dark:text-red-200/90">
              {error}
            </p>
          ) : null}

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">
                Title
              </label>
              <input
                name="title"
                defaultValue={item.title}
                required
                maxLength={120}
                disabled={pending}
                className="w-full rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">
                Notes{" "}
                <span className="font-normal text-on-surface-variant">
                  (optional)
                </span>
              </label>
              <textarea
                name="description"
                rows={2}
                defaultValue={item.description ?? ""}
                disabled={pending}
                className="w-full resize-none rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="min-w-0 flex-1">
                <label className="mb-2 block text-sm font-medium text-on-surface">
                  Every
                </label>
                <input
                  name="intervalValue"
                  type="number"
                  min={1}
                  max={365}
                  defaultValue={item.recurrenceRule.intervalValue}
                  required
                  disabled={pending}
                  className="w-full rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <div className="min-w-[140px]">
                <label className="mb-2 block text-sm font-medium text-on-surface">
                  Unit
                </label>
                <select
                  name="intervalUnit"
                  defaultValue={item.recurrenceRule.intervalUnit}
                  disabled={pending}
                  className="w-full rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
                >
                  {INTERVAL_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">
                Preferred window
              </label>
              <select
                name="preferredWindow"
                defaultValue={item.preferredWindow ?? "flexible"}
                disabled={pending}
                className="w-full rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
              >
                {PREFERRED_WINDOWS.map((w) => (
                  <option key={w.value} value={w.value}>
                    {w.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-on-surface">
                  Grace (hours) opt.
                </label>
                <input
                  name="gracePeriodHours"
                  type="number"
                  min={0}
                  max={168}
                  defaultValue={item.gracePeriodHours ?? ""}
                  disabled={pending}
                  className="w-full rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-on-surface">
                  Overdue after (hours) opt.
                </label>
                <input
                  name="overdueAfterHours"
                  type="number"
                  min={0}
                  max={720}
                  defaultValue={item.overdueAfterHours ?? ""}
                  disabled={pending}
                  className="w-full rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={pending}
              className="h-12 w-full rounded-full bg-surface-container-high text-sm font-medium text-on-surface transition hover:bg-surface-container-highest disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-12 w-full rounded-full bg-primary text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-60"
            >
              {pending ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      ) : null}
    </dialog>
  );
}
