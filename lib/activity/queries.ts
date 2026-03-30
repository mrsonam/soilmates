import { cache } from "react";
import { CollectionMemberStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  createSignedUrlsForPaths,
  isSupabaseStorageConfigured,
} from "@/lib/supabase/admin";

async function collectionIdsForUser(userId: string): Promise<string[]> {
  const rows = await prisma.collectionMember.findMany({
    where: {
      userId,
      status: CollectionMemberStatus.active,
      collection: { archivedAt: null },
    },
    select: { collectionId: true },
  });
  return rows.map((r) => r.collectionId);
}

export type ActivityFeedItem = {
  id: string;
  eventType: string;
  summary: string;
  createdAt: string;
  payload: unknown;
  collection: { id: string; slug: string; name: string };
  plant: { id: string; slug: string; nickname: string } | null;
  actor: {
    id: string;
    displayName: string;
    avatarUrl: string | null;
  } | null;
};

function mapRows(
  rows: {
    id: string;
    eventType: string;
    summary: string;
    createdAt: Date;
    payload: unknown;
    collection: { id: string; slug: string; name: string };
    plant: { id: string; slug: string; nickname: string } | null;
    actor: {
      id: string;
      fullName: string | null;
      email: string;
      avatarUrl: string | null;
    } | null;
  }[],
  avatarUrlMap: Map<string, string>,
): ActivityFeedItem[] {
  return rows.map((r) => {
    const actor = r.actor
      ? {
          id: r.actor.id,
          displayName:
            r.actor.fullName?.trim() ||
            r.actor.email.split("@")[0] ||
            "Member",
          avatarUrl: (() => {
            const u = r.actor.avatarUrl?.trim();
            if (!u) return null;
            if (u.startsWith("http://") || u.startsWith("https://")) return u;
            if (avatarUrlMap.has(u)) return avatarUrlMap.get(u)!;
            return u;
          })(),
        }
      : null;

    return {
      id: r.id,
      eventType: r.eventType,
      summary: r.summary,
      createdAt: r.createdAt.toISOString(),
      payload: r.payload,
      collection: r.collection,
      plant: r.plant,
      actor,
    };
  });
}

async function signedUrlsForActorAvatars(
  rows: { actor: { avatarUrl: string | null } | null }[],
): Promise<Map<string, string>> {
  const paths: string[] = [];
  for (const r of rows) {
    const u = r.actor?.avatarUrl?.trim();
    if (u && !u.startsWith("http://") && !u.startsWith("https://")) {
      paths.push(u);
    }
  }
  if (paths.length === 0 || !isSupabaseStorageConfigured()) {
    return new Map();
  }
  return createSignedUrlsForPaths(paths);
}

const activitySelect = {
  id: true,
  eventType: true,
  summary: true,
  createdAt: true,
  payload: true,
  collection: {
    select: { id: true, slug: true, name: true },
  },
  plant: {
    select: { id: true, slug: true, nickname: true },
  },
  actor: {
    select: { id: true, fullName: true, email: true, avatarUrl: true },
  },
} as const;

export const getRecentActivityForUser = cache(
  async (userId: string, take = 50): Promise<ActivityFeedItem[]> => {
    const ids = await collectionIdsForUser(userId);
    if (ids.length === 0) return [];

    const rows = await prisma.activityEvent.findMany({
      where: { collectionId: { in: ids } },
      orderBy: { createdAt: "desc" },
      take,
      select: activitySelect,
    });

    const urlMap = await signedUrlsForActorAvatars(rows);
    return mapRows(rows, urlMap);
  },
);

export const getCollectionActivityForMember = cache(
  async (
    userId: string,
    collectionSlug: string,
    take = 30,
  ): Promise<ActivityFeedItem[]> => {
    const row = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { slug: collectionSlug, archivedAt: null },
      },
      select: { collectionId: true },
    });
    if (!row) return [];

    const rows = await prisma.activityEvent.findMany({
      where: { collectionId: row.collectionId },
      orderBy: { createdAt: "desc" },
      take,
      select: activitySelect,
    });

    const urlMap = await signedUrlsForActorAvatars(rows);
    return mapRows(rows, urlMap);
  },
);

export const getPlantActivityForMember = cache(
  async (
    userId: string,
    collectionSlug: string,
    plantSlug: string,
    take = 20,
  ): Promise<ActivityFeedItem[]> => {
    const member = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collection: { slug: collectionSlug, archivedAt: null },
      },
      select: { collectionId: true },
    });
    if (!member) return [];

    const plant = await prisma.plant.findFirst({
      where: {
        collectionId: member.collectionId,
        slug: plantSlug,
        archivedAt: null,
      },
      select: { id: true },
    });
    if (!plant) return [];

    const rows = await prisma.activityEvent.findMany({
      where: {
        collectionId: member.collectionId,
        plantId: plant.id,
      },
      orderBy: { createdAt: "desc" },
      take,
      select: activitySelect,
    });

    const urlMap = await signedUrlsForActorAvatars(rows);
    return mapRows(rows, urlMap);
  },
);
