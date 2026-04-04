"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { configureWebPush, isWebPushConfigured } from "@/lib/push/configure";
import type { ReminderPreferredWindow } from "@prisma/client";
import webpush from "web-push";
import type { PushSubscription } from "web-push";
import { z } from "zod";
import { updateUserSettings } from "@/app/actions/settings";
import { PWA_APP_ICON, PWA_BADGE_ICON } from "@/lib/pwa/branding";
import { serverLogger } from "@/lib/logging/server";

const subscriptionSchema = z.object({
  endpoint: z.string().min(1),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
});

export type UpdateNotificationPreferencesInput = {
  pushNotificationsEnabled?: boolean;
  inAppNotificationsEnabled?: boolean;
  notificationQuietStartMinute?: number | null;
  notificationQuietEndMinute?: number | null;
  preferredNotificationWindow?: ReminderPreferredWindow | null;
};

export async function updateNotificationPreferences(
  input: UpdateNotificationPreferencesInput,
): Promise<{ ok: true } | { ok: false; error: string }> {
  return updateUserSettings(input as Record<string, unknown>);
}

export async function registerPushSubscription(
  raw: unknown,
  deviceLabel?: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const parsed = subscriptionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: "Invalid subscription payload" };
  }
  const subscription = parsed.data;

  try {
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      userId: session.user.id,
      endpoint: subscription.endpoint,
      p256dhKey: subscription.keys.p256dh,
      authKey: subscription.keys.auth,
      deviceLabel: deviceLabel?.trim() || null,
    },
    update: {
      userId: session.user.id,
      p256dhKey: subscription.keys.p256dh,
      authKey: subscription.keys.auth,
      deviceLabel: deviceLabel?.trim() || null,
      revokedAt: null,
    },
  });
  } catch (e) {
    serverLogger.integration("push", "register_subscription_failed", "error", {}, e);
    return { ok: false, error: "Could not save this device for notifications." };
  }

  return { ok: true };
}

export async function revokePushSubscription(
  endpoint: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  const sub = await prisma.pushSubscription.findFirst({
    where: { endpoint, userId: session.user.id },
    select: { id: true },
  });
  if (!sub) {
    return { ok: false, error: "Not found" };
  }

  await prisma.pushSubscription.update({
    where: { id: sub.id },
    data: { revokedAt: new Date() },
  });

  return { ok: true };
}

export async function sendTestPushNotification(): Promise<
  { ok: true; sent: number } | { ok: false; error: string }
> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "Unauthorized" };
  }

  if (!isWebPushConfigured()) {
    return { ok: false, error: "Push is not configured on the server" };
  }

  const profile = await prisma.profile.findUnique({
    where: { id: session.user.id },
    select: {
      pushNotificationsEnabled: true,
      pushSubscriptions: {
        where: { revokedAt: null },
        select: { id: true, endpoint: true, p256dhKey: true, authKey: true },
      },
    },
  });

  if (!profile?.pushNotificationsEnabled) {
    return { ok: false, error: "Enable push notifications in settings first" };
  }

  if (profile.pushSubscriptions.length === 0) {
    return { ok: false, error: "No active subscription on this device" };
  }

  configureWebPush();

  const payload = JSON.stringify({
    title: "Soil Mates",
    body: "You will see care reminders here when plants need attention.",
    url: "/dashboard",
    icon: PWA_APP_ICON,
    badge: PWA_BADGE_ICON,
  });

  let sent = 0;
  for (const sub of profile.pushSubscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dhKey, auth: sub.authKey },
        } as PushSubscription,
        payload,
      );
      sent++;
    } catch (err: unknown) {
      const statusCode =
        typeof err === "object" && err !== null && "statusCode" in err
          ? (err as { statusCode?: number }).statusCode
          : undefined;
      if (statusCode === 410 || statusCode === 404) {
        await prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { revokedAt: new Date() },
        });
      }
    }
  }

  if (sent === 0) {
    return { ok: false, error: "Could not reach your device. Try again." };
  }

  return { ok: true, sent };
}
