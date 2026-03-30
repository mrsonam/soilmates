import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";
import {
  createSignedUrlsForPaths,
  isSupabaseStorageConfigured,
} from "@/lib/supabase/admin";

export type AreaForCollectionDetail = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  sortOrder: number;
  plantCount: number;
  createdAt: string;
  /** Signed URL for area cover when storage is configured. */
  coverImageSignedUrl: string | null;
};

export type CollectionDetailForMember = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: Date;
  memberCount: number;
  plantCount: number;
  areaCount: number;
  coverImageSignedUrl: string | null;
  areas: AreaForCollectionDetail[];
};

/** One request-scoped fetch for collection layout + page (deduped via React cache). */
export const getCollectionDetailForActiveMember = cache(
  async (
    userId: string,
    collectionSlug: string,
  ): Promise<CollectionDetailForMember | null> => {
    const row = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: "active",
        collection: { slug: collectionSlug, archivedAt: null },
      },
      select: {
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            createdAt: true,
            coverImageStoragePath: true,
          },
        },
      },
    });
    if (!row) return null;

    const collectionId = row.collection.id;

    const [memberCount, areasRaw, plantCount] = await Promise.all([
      prisma.collectionMember.count({
        where: {
          collectionId,
          status: CollectionMemberStatus.active,
        },
      }),
      prisma.area.findMany({
        where: { collectionId, archivedAt: null },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          sortOrder: true,
          createdAt: true,
          coverImageStoragePath: true,
          _count: {
            select: {
              plants: { where: { archivedAt: null } },
            },
          },
        },
      }),
      prisma.plant.count({
        where: {
          collectionId,
          archivedAt: null,
        },
      }),
    ]);

    const pathsToSign: string[] = [];
    if (row.collection.coverImageStoragePath) {
      pathsToSign.push(row.collection.coverImageStoragePath);
    }
    for (const a of areasRaw) {
      if (a.coverImageStoragePath) {
        pathsToSign.push(a.coverImageStoragePath);
      }
    }

    const signed =
      isSupabaseStorageConfigured() && pathsToSign.length > 0
        ? await createSignedUrlsForPaths(pathsToSign)
        : new Map<string, string>();

    const collectionCoverUrl = row.collection.coverImageStoragePath
      ? (signed.get(row.collection.coverImageStoragePath) ?? null)
      : null;

    const areas: AreaForCollectionDetail[] = areasRaw.map((a) => ({
      id: a.id,
      slug: a.slug,
      name: a.name,
      description: a.description,
      sortOrder: a.sortOrder,
      plantCount: a._count.plants,
      createdAt: a.createdAt.toISOString(),
      coverImageSignedUrl: a.coverImageStoragePath
        ? (signed.get(a.coverImageStoragePath) ?? null)
        : null,
    }));

    return {
      id: row.collection.id,
      name: row.collection.name,
      slug: row.collection.slug,
      description: row.collection.description,
      createdAt: row.collection.createdAt,
      memberCount,
      plantCount,
      areaCount: areas.length,
      coverImageSignedUrl: collectionCoverUrl,
      areas,
    };
  },
);

/** Line under the collection name in the shell header. */
export function collectionHeaderSubtitleLine(
  description: string | null,
  plantCount: number,
): string {
  const raw = description?.trim() ?? "";
  const first = raw.split(/[.!?\n]/)[0]?.trim() ?? "";
  const tag =
    first.length > 0
      ? first.length > 48
        ? `${first.slice(0, 45)}…`
        : first
      : "Shared plant space";
  const plants =
    plantCount === 1 ? "1 plant" : `${plantCount} plants`;
  return `${tag} · ${plants}`;
}
