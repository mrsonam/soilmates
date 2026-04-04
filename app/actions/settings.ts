"use server";

import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { CollectionMemberStatus } from "@prisma/client";
import { userSettingsUpdateSchema } from "@/lib/settings/schemas";
import { THEME_COOKIE_NAME } from "@/lib/theme/theme-cookie";

export type UpdateUserSettingsInput = Record<string, unknown>;

export async function updateUserSettings(
  raw: UpdateUserSettingsInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = userSettingsUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join(" ") || "Invalid input";
    return { ok: false, error: msg };
  }

  const input = parsed.data;
  if (Object.keys(input).length === 0) {
    return { ok: true };
  }

  const userId = session.user.id;

  if (input.defaultCollectionId !== undefined && input.defaultCollectionId !== null) {
    const member = await prisma.collectionMember.findFirst({
      where: {
        userId,
        status: CollectionMemberStatus.active,
        collectionId: input.defaultCollectionId,
        collection: { archivedAt: null },
      },
      select: { id: true },
    });
    if (!member) {
      return { ok: false, error: "That collection is not available." };
    }
  }

  const data: Prisma.ProfileUpdateInput = {};

  if (input.theme !== undefined) data.theme = input.theme;
  if (input.waterUnit !== undefined) data.waterUnit = input.waterUnit;
  if (input.lengthUnit !== undefined) data.lengthUnit = input.lengthUnit;
  if (input.aiPersonalityLevel !== undefined)
    data.aiPersonalityLevel = input.aiPersonalityLevel;
  if (input.careSensitivity !== undefined) data.careSensitivity = input.careSensitivity;
  if (input.defaultCollectionId !== undefined) {
    if (input.defaultCollectionId === null) {
      data.defaultCollection = { disconnect: true };
    } else {
      data.defaultCollection = { connect: { id: input.defaultCollectionId } };
    }
  }
  if (input.pushNotificationsEnabled !== undefined) {
    data.pushNotificationsEnabled = input.pushNotificationsEnabled;
  }
  if (input.inAppNotificationsEnabled !== undefined) {
    data.inAppNotificationsEnabled = input.inAppNotificationsEnabled;
  }
  if (input.notificationQuietStartMinute !== undefined) {
    data.notificationQuietStartMinute = input.notificationQuietStartMinute;
  }
  if (input.notificationQuietEndMinute !== undefined) {
    data.notificationQuietEndMinute = input.notificationQuietEndMinute;
  }
  if (input.preferredNotificationWindow !== undefined) {
    data.preferredNotificationWindow = input.preferredNotificationWindow;
  }

  await prisma.profile.update({
    where: { id: userId },
    data,
  });

  if (input.theme !== undefined) {
    const cookieStore = await cookies();
    cookieStore.set(THEME_COOKIE_NAME, input.theme, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
  }

  if (input.pushNotificationsEnabled === false) {
    await prisma.pushSubscription.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  return { ok: true };
}
