"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Check,
  Droplets,
  Leaf,
  PackageOpen,
  Scissors,
  Bug,
  Eye,
  Sparkles,
  Layers,
  RotateCw,
  type LucideIcon,
} from "lucide-react";
import type { DueCareItem } from "@/lib/reminders/queries";
import type { ReminderType } from "@prisma/client";
import { completeReminderAction } from "@/app/(app)/collections/[collectionSlug]/plants/reminder-actions";
import { SyncEntityType, SyncOperationType } from "@/lib/sync/operation-types";
import { runOrEnqueueMutation } from "@/lib/sync/run-or-enqueue";
import { DueDateLabel } from "@/components/reminders/due-date-label";

function iconForReminderType(t: ReminderType): LucideIcon {
  const m: Record<ReminderType, LucideIcon> = {
    watering: Droplets,
    fertilizing: Leaf,
    misting: Droplets,
    pruning: Scissors,
    repotting: PackageOpen,
    soil_change: Layers,
    rotation: RotateCw,
    pest_check: Bug,
    observation: Eye,
    custom: Sparkles,
  };
  return m[t] ?? Sparkles;
}

function statusPill(item: DueCareItem): { label: string; className: string } {
  if (item.status === "overdue") {
    return {
      label: "OVERDUE",
      className: "bg-[#f0e4e0] text-[#6b4a42] ring-1 ring-[#e5d5cf]",
    };
  }
  if (item.status === "due") {
    return {
      label: "DUE NOW",
      className: "bg-primary-fixed/50 text-primary ring-1 ring-primary/20",
    };
  }
  return {
    label: "SCHEDULED",
    className: "bg-surface-container-high text-on-surface-variant ring-1 ring-outline-variant/15",
  };
}

function CompactCard({ item }: { item: DueCareItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const Icon = iconForReminderType(item.reminderType);
  const pill = statusPill(item);
  const href = `/collections/${item.collection.slug}/plants/${item.plant.slug}?tab=reminders`;

  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_8px_30px_-12px_rgba(40,45,38,0.12)] ring-1 ring-outline-variant/[0.08]">
      <div className="relative min-h-[7.5rem] bg-gradient-to-br from-primary-fixed/25 via-surface-container-low to-surface-container-high/80">
        {item.plant.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.plant.imageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-40"
          />
        ) : null}
        <div className="relative flex items-start justify-between p-4">
          <span
            className={[
              "flex size-11 items-center justify-center rounded-2xl bg-surface-container-lowest/95 text-primary shadow-sm ring-1 ring-outline-variant/10",
            ].join(" ")}
          >
            <Icon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <span
            className={[
              "rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide",
              pill.className,
            ].join(" ")}
          >
            {pill.label}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-4 pt-3">
        <p className="font-display text-base font-semibold leading-tight text-on-surface">
          {item.plant.nickname}
        </p>
        <p className="mt-1 line-clamp-2 text-sm text-on-surface-variant">
          {item.title}
        </p>
        <p className="mt-3 text-xs text-on-surface-variant/90">
          <DueDateLabel iso={item.nextDueAt} />
        </p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Link
            href={href}
            className="text-xs font-medium text-primary hover:underline"
          >
            Open
          </Link>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const r = await runOrEnqueueMutation({
                  operationType: SyncOperationType.REMINDER_COMPLETE,
                  entityType: SyncEntityType.REMINDER,
                  entityId: item.reminderId,
                  payload: {
                    collectionSlug: item.collection.slug,
                    plantSlug: item.plant.slug,
                    reminderId: item.reminderId,
                  },
                  execute: () =>
                    completeReminderAction({
                      collectionSlug: item.collection.slug,
                      plantSlug: item.plant.slug,
                      reminderId: item.reminderId,
                    }),
                });
                if (r.ok) router.refresh();
              })
            }
            className="flex size-11 items-center justify-center rounded-full bg-[#4a5d45] text-white shadow-md transition hover:bg-[#3d4d39] disabled:opacity-50"
            aria-label="Mark done"
          >
            <Check className="size-5" strokeWidth={2.5} aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
}

function WideCard({ item }: { item: DueCareItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = `/collections/${item.collection.slug}/plants/${item.plant.slug}?tab=reminders`;

  return (
    <div className="flex flex-col gap-4 rounded-3xl bg-surface-container-lowest p-4 shadow-[0_8px_30px_-12px_rgba(40,45,38,0.1)] ring-1 ring-outline-variant/[0.08] sm:flex-row sm:items-center sm:gap-6 sm:p-5">
      <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl bg-surface-container-high ring-1 ring-outline-variant/10 sm:size-28">
        {item.plant.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.plant.imageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-primary/30">
            <Leaf className="size-10" strokeWidth={1.25} aria-hidden />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-display text-lg font-semibold text-on-surface">
            {item.plant.nickname}
          </p>
          <span className="rounded-full bg-[#f4e3d4] px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-[#7a5a45]">
            Care
          </span>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">{item.title}</p>
        <p className="mt-2 text-xs text-on-surface-variant">
          {item.collection.name} · {item.area.name}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-2 sm:items-end">
        <Link
          href={href}
          className="inline-flex h-10 items-center justify-center rounded-full px-4 text-sm font-medium text-primary ring-1 ring-outline-variant/15 transition hover:bg-surface-container-high"
        >
          View plant
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const r = await runOrEnqueueMutation({
                operationType: SyncOperationType.REMINDER_COMPLETE,
                entityType: SyncEntityType.REMINDER,
                entityId: item.reminderId,
                payload: {
                  collectionSlug: item.collection.slug,
                  plantSlug: item.plant.slug,
                  reminderId: item.reminderId,
                },
                execute: () =>
                  completeReminderAction({
                    collectionSlug: item.collection.slug,
                    plantSlug: item.plant.slug,
                    reminderId: item.reminderId,
                  }),
              });
              if (r.ok) router.refresh();
            })
          }
          className="inline-flex h-11 min-w-[7rem] items-center justify-center rounded-2xl bg-[#4a5d45] px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d4d39] disabled:opacity-50"
        >
          Done
        </button>
      </div>
    </div>
  );
}

function prioritize(items: DueCareItem[]): DueCareItem[] {
  const score = (i: DueCareItem) =>
    i.status === "overdue" ? 0 : i.status === "due" ? 1 : 2;
  return [...items].sort((a, b) => score(a) - score(b));
}

type DashboardNeedsAttentionProps = {
  items: DueCareItem[];
};

export function DashboardNeedsAttention({ items }: DashboardNeedsAttentionProps) {
  const ordered = prioritize(items);

  if (ordered.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-6 py-14 text-center">
        <p className="font-display text-xl font-semibold text-on-surface">
          Everything looks taken care of
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
          No reminders need attention right now. Add gentle rhythms on any plant
          page whenever you&apos;re ready.
        </p>
      </div>
    );
  }

  const topPair = ordered.slice(0, 2);
  const rest = ordered.slice(2);

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {topPair.map((item) => (
          <CompactCard key={item.reminderId} item={item} />
        ))}
      </div>
      {rest.map((item) => (
        <WideCard key={item.reminderId} item={item} />
      ))}
    </div>
  );
}
