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
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

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
      className: "bg-terracotta/20 text-terracotta ring-1 ring-terracotta/30",
    };
  }
  if (item.status === "due") {
    return {
      label: "DUE NOW",
      className: "bg-primary-fixed text-primary-container-dark ring-1 ring-primary/20",
    };
  }
  return {
    label: "SCHEDULED",
    className: "bg-surface-container-high text-on-surface-variant ring-1 ring-outline-variant/12",
  };
}

function CompactCard({ item }: { item: DueCareItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const Icon = iconForReminderType(item.reminderType);
  const pill = statusPill(item);
  const href = `/collections/${item.collection.slug}/plants/${item.plant.slug}?tab=reminders`;

  return (
    <Card variant="interactive" className="relative flex flex-col overflow-hidden p-0">
      <div className="relative min-h-[7.5rem] bg-surface-container-high overflow-hidden">
        {/* Alive gradient sunlight sweep */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/30 via-transparent to-surface-container-high/80 opacity-70 transition-opacity duration-1000 group-hover:opacity-100" />
        {item.plant.imageUrl ? (
          <img
            src={item.plant.imageUrl}
            alt=""
            className="absolute inset-0 size-full object-cover opacity-60 mix-blend-overlay transition-transform duration-700 hover:scale-105"
          />
        ) : null}
        <div className="relative flex items-start justify-between p-5">
          <span className="flex size-11 items-center justify-center rounded-[1rem] bg-surface/90 text-primary shadow-sm backdrop-blur-md ring-1 ring-outline-variant/10">
            <Icon className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-wide backdrop-blur-md ${pill.className}`}>
            {pill.label}
          </span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-display text-lg font-bold leading-tight tracking-tight text-on-surface line-clamp-1">
          {item.plant.nickname}
        </p>
        <p className="mt-1 line-clamp-2 text-sm font-medium text-on-surface-variant">
          {item.title}
        </p>
        <p className="mt-3 text-[0.7rem] font-bold uppercase tracking-wider text-on-surface-variant/80">
          <DueDateLabel iso={item.nextDueAt} />
        </p>
        <div className="mt-5 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" asChild className="px-0 -translate-x-2">
            <Link href={href}>View Details</Link>
          </Button>
          <Button
            variant="primary"
            size="icon"
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
            aria-label="Mark done"
          >
            <Check className="size-5" strokeWidth={2.5} aria-hidden />
          </Button>
        </div>
      </div>
    </Card>
  );
}

function WideCard({ item }: { item: DueCareItem }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const href = `/collections/${item.collection.slug}/plants/${item.plant.slug}?tab=reminders`;

  return (
    <Card 
      variant="interactive" 
      className={`group flex items-center p-4 sm:p-5 gap-5 ${pending ? "opacity-50 scale-95" : ""}`}
    >
      <Checkbox 
        disabled={pending}
        checked={pending}
        onChange={() =>
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
        className="h-8 w-8 scale-110 ml-1" 
      />
      
      <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-surface-container-high ring-1 ring-outline-variant/10 sm:size-16">
        {item.plant.imageUrl ? (
          <img
            src={item.plant.imageUrl}
            alt=""
            className="size-full object-cover"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-primary/30">
            <Leaf className="size-6" strokeWidth={1.5} aria-hidden />
          </div>
        )}
      </div>
      
      <div className="min-w-0 flex-1 py-1">
        <p className="font-display text-[1.05rem] font-bold text-on-surface truncate">
          {item.plant.nickname}
        </p>
        <p className="mt-0.5 text-sm font-medium text-on-surface-variant truncate">
          {item.title} <span className="opacity-50 mx-1">·</span> {item.collection.name}
        </p>
      </div>
      
      <Button variant="secondary" size="icon" asChild className="hidden sm:inline-flex rounded-xl mr-1">
        <Link href={href} aria-label="Open plant"><Eye className="h-4 w-4" strokeWidth={2} /></Link>
      </Button>
    </Card>
  );
}

function prioritize(items: DueCareItem[]): DueCareItem[] {
  const score = (i: DueCareItem) =>
    i.status === "overdue" ? 0 : i.status === "due" ? 1 : 2;
  return [...items].sort((a, b) => score(a) - score(b));
}

export function DashboardNeedsAttention({ items }: { items: DueCareItem[] }) {
  const ordered = prioritize(items);

  if (ordered.length === 0) {
    return (
      <Card variant="flat" className="border-dashed border-2 px-6 py-14 text-center bg-transparent mt-6">
        <p className="font-display text-xl font-bold tracking-tight text-on-surface">
          Zero thirsty plants.
        </p>
        <p className="mx-auto mt-2 max-w-sm text-sm font-medium text-on-surface-variant leading-relaxed">
          Go touch grass outside. Your indoor jungle doesn't need you today.
        </p>
      </Card>
    );
  }

  const topPair = ordered.slice(0, 2);
  const rest = ordered.slice(2);

  return (
    <div className="space-y-6 mt-6">
      <div className="grid gap-6 sm:grid-cols-2">
        {topPair.map((item) => (
          <CompactCard key={item.reminderId} item={item} />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {rest.map((item) => (
          <WideCard key={item.reminderId} item={item} />
        ))}
      </div>
    </div>
  );
}
