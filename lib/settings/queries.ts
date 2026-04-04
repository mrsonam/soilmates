import { cache } from "react";
import { CollectionMemberStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type DefaultCollectionOption = {
  id: string;
  slug: string;
  name: string;
};

/** Full profile preferences for the settings UI + theme bootstrap. */
export type UserSettingsBundle = {
  theme: import("@prisma/client").UserTheme;
  waterUnit: import("@prisma/client").WaterUnit;
  lengthUnit: import("@prisma/client").LengthUnit;
  aiPersonalityLevel: import("@prisma/client").AiPersonalityLevel;
  careSensitivity: import("@prisma/client").CareSensitivity;
  defaultCollectionId: string | null;
  pushNotificationsEnabled: boolean;
  inAppNotificationsEnabled: boolean;
  notificationQuietStartMinute: number | null;
  notificationQuietEndMinute: number | null;
  preferredNotificationWindow: import("@prisma/client").ReminderPreferredWindow | null;
};

export const getUserSettingsBundle = cache(
  async (userId: string): Promise<UserSettingsBundle | null> => {
    const row = await prisma.profile.findUnique({
      where: { id: userId },
      select: {
        theme: true,
        waterUnit: true,
        lengthUnit: true,
        aiPersonalityLevel: true,
        careSensitivity: true,
        defaultCollectionId: true,
        pushNotificationsEnabled: true,
        inAppNotificationsEnabled: true,
        notificationQuietStartMinute: true,
        notificationQuietEndMinute: true,
        preferredNotificationWindow: true,
      },
    });
    return row;
  },
);

export async function getDefaultCollectionOptions(
  userId: string,
): Promise<DefaultCollectionOption[]> {
  const rows = await prisma.collectionMember.findMany({
    where: {
      userId,
      status: CollectionMemberStatus.active,
      collection: { archivedAt: null },
    },
    orderBy: { joinedAt: "asc" },
    select: {
      collection: { select: { id: true, slug: true, name: true } },
    },
  });
  return rows.map((r) => ({
    id: r.collection.id,
    slug: r.collection.slug,
    name: r.collection.name,
  }));
}
