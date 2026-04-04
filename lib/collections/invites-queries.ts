import { cache } from "react";
import {
  CollectionInviteStatus,
  CollectionMemberStatus,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeInviteEmail } from "@/lib/collections/invite-email";

export type MemberRow = {
  id: string;
  userId: string;
  joinedAt: string;
  fullName: string | null;
  email: string;
  avatarUrl: string | null;
};

export type PendingInviteRow = {
  id: string;
  email: string;
  createdAt: string;
  invitedByName: string | null;
  invitedByEmail: string;
};

export const getPendingInviteCountForUser = cache(
  async (userEmail: string | null | undefined): Promise<number> => {
    if (!userEmail?.trim()) return 0;
    const normalized = normalizeInviteEmail(userEmail);
    const now = new Date();
    return prisma.collectionInvite.count({
      where: {
        email: normalized,
        status: CollectionInviteStatus.pending,
        expiresAt: { gt: now },
      },
    });
  },
);

export const getMyPendingInvites = cache(
  async (userEmail: string | null | undefined) => {
    if (!userEmail?.trim()) return [];
    const normalized = normalizeInviteEmail(userEmail);
    const now = new Date();
    const rows = await prisma.collectionInvite.findMany({
      where: {
        email: normalized,
        status: CollectionInviteStatus.pending,
        expiresAt: { gt: now },
        collection: { archivedAt: null },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        collection: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
          },
        },
        invitedBy: {
          select: { fullName: true, email: true },
        },
      },
    });
    return rows.map((r) => ({
      id: r.id,
      createdAt: r.createdAt.toISOString(),
      collection: {
        id: r.collection.id,
        name: r.collection.name,
        slug: r.collection.slug,
        description: r.collection.description,
      },
      invitedBy: {
        name: r.invitedBy.fullName,
        email: r.invitedBy.email,
      },
    }));
  },
);

export async function getCollectionMembersAndInvites(
  userId: string,
  collectionSlug: string,
): Promise<{
  collectionId: string;
  name: string;
  slug: string;
  members: MemberRow[];
  pendingInvites: PendingInviteRow[];
} | null> {
  const membership = await prisma.collectionMember.findFirst({
    where: {
      userId,
      status: CollectionMemberStatus.active,
      collection: { slug: collectionSlug, archivedAt: null },
    },
    select: {
      collection: {
        select: { id: true, name: true, slug: true },
      },
    },
  });
  if (!membership) return null;

  const collectionId = membership.collection.id;
  const now = new Date();

  const [memberRows, inviteRows] = await Promise.all([
    prisma.collectionMember.findMany({
      where: {
        collectionId,
        status: CollectionMemberStatus.active,
      },
      orderBy: { joinedAt: "asc" },
      select: {
        id: true,
        userId: true,
        joinedAt: true,
        user: {
          select: { fullName: true, email: true, avatarUrl: true },
        },
      },
    }),
    prisma.collectionInvite.findMany({
      where: {
        collectionId,
        status: CollectionInviteStatus.pending,
        expiresAt: { gt: now },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        createdAt: true,
        invitedBy: {
          select: { fullName: true, email: true },
        },
      },
    }),
  ]);

  return {
    collectionId,
    name: membership.collection.name,
    slug: membership.collection.slug,
    members: memberRows.map((m) => ({
      id: m.id,
      userId: m.userId,
      joinedAt: m.joinedAt.toISOString(),
      fullName: m.user.fullName,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
    })),
    pendingInvites: inviteRows.map((i) => ({
      id: i.id,
      email: i.email ?? "",
      createdAt: i.createdAt.toISOString(),
      invitedByName: i.invitedBy.fullName,
      invitedByEmail: i.invitedBy.email,
    })),
  };
}
