import {
  CollectionMemberStatus,
  Prisma,
  type PushDeliveryKind,
  type ReminderPreferredWindow,
} from "@prisma/client";
import webpush from "web-push";
import type { PushSubscription } from "web-push";
import { prisma } from "@/lib/prisma";
import { computeReminderDisplayStatus } from "@/lib/reminders/status";
import { configureWebPush, isWebPushConfigured } from "@/lib/push/configure";
import { PWA_APP_ICON, PWA_BADGE_ICON } from "@/lib/pwa/branding";
import {
  isUtcMinuteInQuietPeriod,
  utcMinutesFromDate,
} from "@/lib/push/quiet-hours";

type ReminderWithPlant = {
  id: string;
  title: string;
  plant: {
    id: string;
    nickname: string;
    slug: string;
    collection: { slug: string };
  };
  isPaused: boolean;
  pausedUntil: Date | null;
  nextDueAt: Date;
  overdueAfterHours: number | null;
  isActive: boolean;
  archivedAt: Date | null;
};

export function getHourBucketKeyUtc(now: Date): string {
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, "0");
  const d = String(now.getUTCDate()).padStart(2, "0");
  const h = String(now.getUTCHours()).padStart(2, "0");
  return `${y}-${m}-${d}-${h}`;
}

function timeOfDayPhrase(now: Date): string {
  const h = now.getUTCHours();
  if (h >= 5 && h < 12) return "this morning";
  if (h >= 12 && h < 17) return "this afternoon";
  if (h >= 17 && h < 22) return "this evening";
  return "today";
}

function shouldSuppressDueForPreferredWindow(
  pref: ReminderPreferredWindow | null,
  now: Date,
): boolean {
  if (!pref || pref === "flexible") return false;
  const h = now.getUTCHours();
  if (pref === "morning") return h < 6 || h >= 12;
  if (pref === "afternoon") return h < 12 || h >= 18;
  if (pref === "evening") return h < 18 || h >= 23;
  return false;
}

function plantDeepLink(r: ReminderWithPlant): string {
  return `/collections/${r.plant.collection.slug}/plants/${r.plant.slug}`;
}

function buildPayload(
  kind: PushDeliveryKind,
  items: ReminderWithPlant[],
  now: Date,
): { title: string; body: string; url: string } {
  const phrase = timeOfDayPhrase(now);
  if (items.length === 0) {
    return { title: "Soil Mates", body: "", url: "/dashboard" };
  }
  if (items.length === 1) {
    const r = items[0];
    const plant = r.plant.nickname;
    if (kind === "due") {
      return {
        title: "Soil Mates",
        body: `${plant} needs care — ${r.title}`,
        url: plantDeepLink(r),
      };
    }
    return {
      title: "Soil Mates",
      body: `${plant}: ${r.title} is overdue`,
      url: plantDeepLink(r),
    };
  }
  if (kind === "due") {
    return {
      title: "Soil Mates",
      body: `${items.length} plants need attention ${phrase}`,
      url: "/dashboard",
    };
  }
  return {
    title: "Soil Mates",
    body: `${items.length} reminders are overdue in Soil Mates`,
    url: "/dashboard",
  };
}

async function loadRemindersForUser(
  userId: string,
  now: Date,
): Promise<{ due: ReminderWithPlant[]; overdue: ReminderWithPlant[] }> {
  const memberships = await prisma.collectionMember.findMany({
    where: {
      userId,
      status: CollectionMemberStatus.active,
      collection: { archivedAt: null },
    },
    select: { collectionId: true },
  });
  const collectionIds = memberships.map((m) => m.collectionId);
  if (collectionIds.length === 0) return { due: [], overdue: [] };

  const rows = await prisma.reminder.findMany({
    where: {
      collectionId: { in: collectionIds },
      archivedAt: null,
      isActive: true,
      isPaused: false,
      plant: { archivedAt: null },
    },
    select: {
      id: true,
      title: true,
      isPaused: true,
      pausedUntil: true,
      nextDueAt: true,
      overdueAfterHours: true,
      isActive: true,
      archivedAt: true,
      plant: {
        select: {
          id: true,
          nickname: true,
          slug: true,
          collection: { select: { slug: true } },
        },
      },
    },
  });

  const due: ReminderWithPlant[] = [];
  const overdue: ReminderWithPlant[] = [];
  for (const r of rows) {
    const status = computeReminderDisplayStatus(r, now);
    if (status === "due") due.push(r as ReminderWithPlant);
    else if (status === "overdue") overdue.push(r as ReminderWithPlant);
  }
  return { due, overdue };
}

async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url: string },
): Promise<{ sent: number; failed: number; removed: number }> {
  configureWebPush();
  const subs = await prisma.pushSubscription.findMany({
    where: { userId, revokedAt: null },
  });
  if (subs.length === 0) return { sent: 0, failed: 0, removed: 0 };

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body,
    url: payload.url,
    icon: PWA_APP_ICON,
    badge: PWA_BADGE_ICON,
  });

  let sent = 0;
  let failed = 0;
  let removed = 0;

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dhKey,
            auth: sub.authKey,
          },
        } as PushSubscription,
        body,
      );
      sent++;
    } catch (err: unknown) {
      failed++;
      const statusCode =
        typeof err === "object" && err !== null && "statusCode" in err
          ? (err as { statusCode?: number }).statusCode
          : undefined;
      if (statusCode === 410 || statusCode === 404) {
        await prisma.pushSubscription.update({
          where: { id: sub.id },
          data: { revokedAt: new Date() },
        });
        removed++;
      }
    }
  }

  return { sent, failed, removed };
}

export type DeliverReminderNotificationsResult = {
  bucketKey: string;
  skippedReason?: string;
  due: { attempted: number; sent: number; skipped: number };
  overdue: { attempted: number; sent: number; skipped: number };
};

/**
 * Finds due/overdue reminders, groups per user, respects prefs, sends at most one push per kind per hourly bucket.
 */
export async function deliverReminderNotifications(
  now: Date = new Date(),
): Promise<DeliverReminderNotificationsResult> {
  if (!isWebPushConfigured()) {
    return {
      bucketKey: getHourBucketKeyUtc(now),
      skippedReason: "VAPID keys not configured",
      due: { attempted: 0, sent: 0, skipped: 0 },
      overdue: { attempted: 0, sent: 0, skipped: 0 },
    };
  }

  configureWebPush();
  const bucketKey = getHourBucketKeyUtc(now);
  const utcMin = utcMinutesFromDate(now);

  const users = await prisma.profile.findMany({
    where: {
      pushNotificationsEnabled: true,
      deletedAt: null,
      pushSubscriptions: { some: { revokedAt: null } },
    },
    select: {
      id: true,
      notificationQuietStartMinute: true,
      notificationQuietEndMinute: true,
      preferredNotificationWindow: true,
    },
  });

  let dueAttempted = 0;
  let dueSent = 0;
  let dueSkipped = 0;
  let overdueAttempted = 0;
  let overdueSent = 0;
  let overdueSkipped = 0;

  for (const user of users) {
    const quiet = isUtcMinuteInQuietPeriod(
      utcMin,
      user.notificationQuietStartMinute,
      user.notificationQuietEndMinute,
    );

    const { due, overdue } = await loadRemindersForUser(user.id, now);

    const duePrefBlocked = shouldSuppressDueForPreferredWindow(
      user.preferredNotificationWindow,
      now,
    );

    const processKind = async (
      kind: PushDeliveryKind,
      items: ReminderWithPlant[],
    ) => {
      if (items.length === 0) return;

      if (kind === "due" && (quiet || duePrefBlocked)) {
        dueSkipped++;
        return;
      }
      if (kind === "overdue" && quiet) {
        overdueSkipped++;
        return;
      }

      if (kind === "due") dueAttempted++;
      else overdueAttempted++;

      try {
        await prisma.pushNotificationDelivery.create({
          data: {
            userId: user.id,
            kind,
            bucketKey,
          },
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2002"
        ) {
          if (kind === "due") dueSkipped++;
          else overdueSkipped++;
          return;
        }
        throw e;
      }

      const payload = buildPayload(kind, items, now);
      if (!payload.body) return;

      await sendPushToUser(user.id, payload);
      if (kind === "due") dueSent++;
      else overdueSent++;
    };

    await processKind("due", due);
    await processKind("overdue", overdue);
  }

  return {
    bucketKey,
    due: {
      attempted: dueAttempted,
      sent: dueSent,
      skipped: dueSkipped,
    },
    overdue: {
      attempted: overdueAttempted,
      sent: overdueSent,
      skipped: overdueSkipped,
    },
  };
}
