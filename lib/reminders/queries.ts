import { cache } from "react";
import {
  CollectionMemberStatus,
  type Reminder,
  type ReminderPreferredWindow,
  type ReminderType,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeReminderDisplayStatus } from "@/lib/reminders/status";
import type { ReminderDisplayStatus } from "@/lib/reminders/status";
import {
  createSignedUrlsForPaths,
  isSupabaseStorageConfigured,
} from "@/lib/supabase/admin";

export type ReminderListItem = {
  id: string;
  reminderType: ReminderType;
  title: string;
  description: string | null;
  recurrenceRule: { intervalValue: number; intervalUnit: string };
  preferredWindow: ReminderPreferredWindow | null;
  gracePeriodHours: number | null;
  overdueAfterHours: number | null;
  lastCompletedAt: string | null;
  nextDueAt: string;
  status: ReminderDisplayStatus;
  isPaused: boolean;
  pausedUntil: string | null;
};

export type DueCareItem = {
  reminderId: string;
  reminderType: ReminderType;
  title: string;
  nextDueAt: string;
  status: ReminderDisplayStatus;
  plant: {
    id: string;
    nickname: string;
    slug: string;
    imageUrl: string | null;
  };
  collection: { slug: string; name: string };
  area: { name: string };
};

function toReminderListItem(r: Reminder): ReminderListItem {
  const rule = r.recurrenceRule as { intervalValue?: number; intervalUnit?: string };
  return {
    id: r.id,
    reminderType: r.reminderType,
    title: r.title,
    description: r.description,
    recurrenceRule: {
      intervalValue: rule.intervalValue ?? 1,
      intervalUnit: rule.intervalUnit ?? "days",
    },
    preferredWindow: r.preferredWindow,
    gracePeriodHours: r.gracePeriodHours,
    overdueAfterHours: r.overdueAfterHours,
    lastCompletedAt: r.lastCompletedAt?.toISOString() ?? null,
    nextDueAt: r.nextDueAt.toISOString(),
    status: computeReminderDisplayStatus(r),
    isPaused: r.isPaused,
    pausedUntil: r.pausedUntil?.toISOString() ?? null,
  };
}

export const getPlantRemindersForMember = cache(
  async (
    userId: string,
    collectionSlug: string,
    plantSlug: string,
  ): Promise<ReminderListItem[] | null> => {
    const membership = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { slug: collectionSlug, archivedAt: null },
      },
      select: { collectionId: true },
    });
    if (!membership) return null;

    const plant = await prisma.plant.findFirst({
      where: {
        collectionId: membership.collectionId,
        slug: plantSlug,
        archivedAt: null,
      },
      select: { id: true },
    });
    if (!plant) return null;

    const rows = await prisma.reminder.findMany({
      where: {
        plantId: plant.id,
        archivedAt: null,
      },
      orderBy: { nextDueAt: "asc" },
    });

    return rows.map(toReminderListItem);
  },
);

function addDays(d: Date, days: number): Date {
  const x = new Date(d.getTime());
  x.setDate(x.getDate() + days);
  return x;
}

export const getDashboardDueCare = cache(
  async (userId: string): Promise<DueCareItem[]> => {
    const memberships = await prisma.collectionMember.findMany({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { archivedAt: null },
      },
      select: { collectionId: true },
    });
    const collectionIds = memberships.map((m) => m.collectionId);
    if (collectionIds.length === 0) return [];

    const now = new Date();
    const horizon = addDays(now, 14);

    const rows = await prisma.reminder.findMany({
      where: {
        collectionId: { in: collectionIds },
        archivedAt: null,
        isActive: true,
        isPaused: false,
        plant: { archivedAt: null },
        nextDueAt: { lte: horizon },
      },
      include: {
        plant: {
          select: {
            id: true,
            nickname: true,
            slug: true,
            primaryImageUrl: true,
            primaryImage: { select: { storagePath: true } },
            area: { select: { name: true } },
            collection: { select: { slug: true, name: true } },
          },
        },
      },
      orderBy: { nextDueAt: "asc" },
      take: 80,
    });

    const paths = rows
      .map((r) => r.plant.primaryImage?.storagePath)
      .filter((p): p is string => Boolean(p));
    const urlMap =
      paths.length > 0 && isSupabaseStorageConfigured()
        ? await createSignedUrlsForPaths(paths)
        : new Map<string, string>();

    return rows.map((r) => {
      const path = r.plant.primaryImage?.storagePath;
      let imageUrl: string | null =
        path && urlMap.has(path) ? urlMap.get(path)! : null;
      if (!imageUrl && r.plant.primaryImageUrl?.trim()) {
        imageUrl = r.plant.primaryImageUrl.trim();
      }
      const status = computeReminderDisplayStatus(r);
      return {
        reminderId: r.id,
        reminderType: r.reminderType,
        title: r.title,
        nextDueAt: r.nextDueAt.toISOString(),
        status,
        plant: {
          id: r.plant.id,
          nickname: r.plant.nickname,
          slug: r.plant.slug,
          imageUrl,
        },
        collection: {
          slug: r.plant.collection.slug,
          name: r.plant.collection.name,
        },
        area: { name: r.plant.area.name },
      };
    });
  },
);
