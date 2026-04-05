"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { AppSelect } from "@/components/ui/app-select";
import { useUpdateReminderMutation } from "@/hooks/mutations/reminder-mutations";
import type { ReminderListItem } from "@/lib/reminders/queries";
import { INTERVAL_UNITS, PREFERRED_WINDOWS } from "@/lib/reminders/constants";
import type { ReminderPreferredWindow, ReminderType } from "@prisma/client";
import { defaultTitleForReminderType } from "@/lib/reminders/labels";
import { PendingButton } from "@/components/loading/pending-button";

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
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const updateMut = useUpdateReminderMutation(collectionSlug, plantSlug);
  const pending = updateMut.isPending;
  const [intervalUnit, setIntervalUnit] = useState("days");
  const [preferredWindow, setPreferredWindow] = useState("flexible");

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && item) {
      setError(null);
      setIntervalUnit(item.recurrenceRule.intervalUnit);
      setPreferredWindow(item.preferredWindow ?? "flexible");
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
      setError(null);
      updateMut.mutate(
        {
          collectionSlug,
          plantSlug,
          reminderId: item.id,
          title: String(fd.get("title") ?? ""),
          description: String(fd.get("description") ?? "") || undefined,
          intervalValue: Number(fd.get("intervalValue")),
          intervalUnit: fd.get("intervalUnit") as "days" | "weeks" | "months",
          preferredWindow: (() => {
            const raw = fd.get("preferredWindow");
            if (raw == null || raw === "") return null;
            return raw as ReminderPreferredWindow;
          })(),
          gracePeriodHours: fd.get("gracePeriodHours")
            ? Number(fd.get("gracePeriodHours"))
            : undefined,
          overdueAfterHours: fd.get("overdueAfterHours")
            ? Number(fd.get("overdueAfterHours"))
            : undefined,
        },
        {
          onSuccess: () => onClose(),
          onError: (err) => {
            setError(err instanceof Error ? err.message : "Could not save.");
          },
        },
      );
    },
    [collectionSlug, plantSlug, item, onClose, updateMut],
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
                <AppSelect
                  name="intervalUnit"
                  options={INTERVAL_UNITS.map((u) => ({
                    value: u.value,
                    label: u.label,
                  }))}
                  value={intervalUnit}
                  onChange={setIntervalUnit}
                  disabled={pending}
                />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-on-surface">
                Preferred window
              </label>
              <AppSelect
                name="preferredWindow"
                options={PREFERRED_WINDOWS.map((w) => ({
                  value: w.value,
                  label: w.label,
                }))}
                value={preferredWindow}
                onChange={setPreferredWindow}
                disabled={pending}
              />
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
            <PendingButton
              type="submit"
              pending={pending}
              pendingLabel="Saving…"
              className="h-12 w-full rounded-full bg-primary text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-60"
            >
              Save changes
            </PendingButton>
          </div>
        </form>
      ) : null}
    </dialog>
  );
}
