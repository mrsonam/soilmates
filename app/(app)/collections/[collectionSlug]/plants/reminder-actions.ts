"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { ReminderEventType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getCollectionIdForActiveMember } from "@/lib/collections/access";
import { advanceReminderInTx } from "@/lib/reminders/advance";
import { reminderTypeToCareLogAction } from "@/lib/reminders/care-type-map";
import { parseRecurrenceRule } from "@/lib/reminders/parse-rule";
import {
  computeFirstNextDueAt,
  computeNextDueAfterCompletion,
} from "@/lib/reminders/recurrence";
import {
  createReminderInputSchema,
  updateReminderInputSchema,
} from "@/lib/validations/reminder";
import { createActivityEvent } from "@/lib/activity/create-event";
import { ActivityEventTypes } from "@/lib/activity/event-types";
import { getActorLabel } from "@/lib/activity/actor-label";
import { reminderTypeLabel } from "@/lib/activity/reminder-label";

export type ReminderActionResult =
  | { ok: true }
  | { ok: false; error: string };

function revalidateReminderPaths(collectionSlug: string, plantSlug: string) {
  const base = `/collections/${collectionSlug}/plants/${plantSlug}`;
  revalidatePath(base);
  revalidatePath(`${base}/reminders`);
  revalidatePath(`/collections/${collectionSlug}/plants`);
  revalidatePath("/plants");
  revalidatePath("/dashboard");
}

async function loadReminderForUser(
  userId: string,
  collectionSlug: string,
  plantSlug: string,
  reminderId: string,
) {
  const collectionId = await getCollectionIdForActiveMember(
    userId,
    collectionSlug,
  );
  if (!collectionId) return null;

  return prisma.reminder.findFirst({
    where: {
      id: reminderId,
      collectionId,
      plant: { slug: plantSlug, archivedAt: null },
      archivedAt: null,
    },
  });
}

export async function createReminderAction(
  input: unknown,
): Promise<ReminderActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const parsed = createReminderInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const d = parsed.data;
  const collectionId = await getCollectionIdForActiveMember(
    session.user.id,
    d.collectionSlug,
  );
  if (!collectionId) {
    return { ok: false, error: "You don’t have access to this collection." };
  }

  const plant = await prisma.plant.findFirst({
    where: {
      collectionId,
      slug: d.plantSlug,
      archivedAt: null,
    },
    select: { id: true, nickname: true },
  });
  if (!plant) {
    return { ok: false, error: "Plant not found." };
  }

  const recurrenceRule = {
    intervalValue: d.intervalValue,
    intervalUnit: d.intervalUnit,
  };

  const nextDueAt = computeFirstNextDueAt(
    d.intervalValue,
    d.intervalUnit,
    d.preferredWindow ?? null,
  );

  const id = randomUUID();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.reminder.create({
        data: {
          id,
          collectionId,
          plantId: plant.id,
          reminderType: d.reminderType,
          title: d.title.trim(),
          description: d.description?.trim() || null,
          source: "user",
          recurrenceRule,
          preferredWindow: d.preferredWindow ?? null,
          gracePeriodHours: d.gracePeriodHours ?? null,
          overdueAfterHours: d.overdueAfterHours ?? 48,
          nextDueAt,
          createdById: session.user.id,
        },
      });
      await tx.reminderEvent.create({
        data: {
          id: randomUUID(),
          reminderId: id,
          eventType: ReminderEventType.created,
          careLogId: null,
          metadata: {},
          createdById: session.user.id,
        },
      });
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not create reminder." };
  }

  try {
    const who = await getActorLabel(session.user.id);
    const kind = reminderTypeLabel(d.reminderType);
    await createActivityEvent({
      collectionId,
      plantId: plant.id,
      actorUserId: session.user.id,
      eventType: ActivityEventTypes.reminderCreated,
      summary: `${who} set a ${kind} reminder for ${plant.nickname}`,
      payload: { reminderId: id },
      collectionSlug: d.collectionSlug,
      plantSlug: d.plantSlug,
    });
  } catch (e) {
    console.error("activity event", e);
  }

  revalidateReminderPaths(d.collectionSlug, d.plantSlug);
  return { ok: true };
}

export async function updateReminderAction(
  input: unknown,
): Promise<ReminderActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const parsed = updateReminderInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid input",
    };
  }

  const d = parsed.data;
  const existing = await loadReminderForUser(
    session.user.id,
    d.collectionSlug,
    d.plantSlug,
    d.reminderId,
  );
  if (!existing) {
    return { ok: false, error: "Reminder not found." };
  }

  const recurrenceRule = {
    intervalValue: d.intervalValue,
    intervalUnit: d.intervalUnit,
  };

  const nextDueAt = existing.lastCompletedAt
    ? computeNextDueAfterCompletion(
        existing.lastCompletedAt,
        d.intervalValue,
        d.intervalUnit,
        d.preferredWindow ?? null,
      )
    : computeFirstNextDueAt(
        d.intervalValue,
        d.intervalUnit,
        d.preferredWindow ?? null,
      );

  try {
    await prisma.$transaction(async (tx) => {
      await tx.reminder.update({
        where: { id: existing.id },
        data: {
          title: d.title.trim(),
          description: d.description?.trim() || null,
          recurrenceRule,
          preferredWindow: d.preferredWindow ?? null,
          gracePeriodHours: d.gracePeriodHours ?? null,
          overdueAfterHours: d.overdueAfterHours ?? 48,
          nextDueAt,
        },
      });
      await tx.reminderEvent.create({
        data: {
          id: randomUUID(),
          reminderId: existing.id,
          eventType: ReminderEventType.updated,
          careLogId: null,
          metadata: { source: "edit" } as Prisma.InputJsonValue,
          createdById: session.user.id,
        },
      });
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not update reminder." };
  }

  revalidateReminderPaths(d.collectionSlug, d.plantSlug);
  return { ok: true };
}

export async function completeReminderAction(input: {
  collectionSlug: string;
  plantSlug: string;
  reminderId: string;
}): Promise<ReminderActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const collectionSlug = input.collectionSlug.trim();
  const plantSlug = input.plantSlug.trim();
  const reminderId = input.reminderId.trim();
  if (!collectionSlug || !plantSlug || !reminderId) {
    return { ok: false, error: "Missing fields." };
  }

  const existing = await loadReminderForUser(
    session.user.id,
    collectionSlug,
    plantSlug,
    reminderId,
  );
  if (!existing || !existing.isActive) {
    return { ok: false, error: "Reminder not found." };
  }
  if (existing.isPaused) {
    return { ok: false, error: "Resume this reminder before completing." };
  }

  const completedAt = new Date();
  const careAction = reminderTypeToCareLogAction(existing.reminderType);

  try {
    await prisma.$transaction(async (tx) => {
      let careLogId: string | null = null;
      if (careAction) {
        const logId = randomUUID();
        await tx.careLog.create({
          data: {
            id: logId,
            plantId: existing.plantId,
            createdById: session.user.id,
            actionType: careAction,
            actionAt: completedAt,
            notes: `From reminder: ${existing.title}`,
            metadata: { reminderId: existing.id } as Prisma.InputJsonValue,
            tags: ["reminder"],
          },
        });
        careLogId = logId;
      }

      await advanceReminderInTx(
        tx,
        existing,
        completedAt,
        careLogId,
        session.user.id,
        ReminderEventType.completed,
      );
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not complete reminder." };
  }

  try {
    const plantRow = await prisma.plant.findUnique({
      where: { id: existing.plantId },
      select: {
        nickname: true,
        slug: true,
        collection: { select: { slug: true } },
      },
    });
    if (plantRow) {
      const who = await getActorLabel(session.user.id);
      await createActivityEvent({
        collectionId: existing.collectionId,
        plantId: existing.plantId,
        actorUserId: session.user.id,
        eventType: ActivityEventTypes.reminderCompleted,
        summary: `${who} completed “${existing.title.trim()}” for ${plantRow.nickname}`,
        payload: { reminderId: existing.id },
        collectionSlug: plantRow.collection.slug,
        plantSlug: plantRow.slug,
      });
    }
  } catch (e) {
    console.error("activity event", e);
  }

  revalidateReminderPaths(collectionSlug, plantSlug);
  return { ok: true };
}

export async function pauseReminderAction(input: {
  collectionSlug: string;
  plantSlug: string;
  reminderId: string;
}): Promise<ReminderActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const existing = await loadReminderForUser(
    session.user.id,
    input.collectionSlug,
    input.plantSlug,
    input.reminderId,
  );
  if (!existing) return { ok: false, error: "Reminder not found." };

  try {
    await prisma.$transaction(async (tx) => {
      await tx.reminder.update({
        where: { id: existing.id },
        data: { isPaused: true, pausedUntil: null },
      });
      await tx.reminderEvent.create({
        data: {
          id: randomUUID(),
          reminderId: existing.id,
          eventType: ReminderEventType.paused,
          careLogId: null,
          metadata: {},
          createdById: session.user.id,
        },
      });
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not pause reminder." };
  }

  revalidateReminderPaths(input.collectionSlug, input.plantSlug);
  return { ok: true };
}

export async function resumeReminderAction(input: {
  collectionSlug: string;
  plantSlug: string;
  reminderId: string;
}): Promise<ReminderActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const existing = await loadReminderForUser(
    session.user.id,
    input.collectionSlug,
    input.plantSlug,
    input.reminderId,
  );
  if (!existing) return { ok: false, error: "Reminder not found." };

  const rule = parseRecurrenceRule(existing.recurrenceRule);
  const nextDueAt =
    existing.nextDueAt.getTime() < Date.now()
      ? computeFirstNextDueAt(
          rule.intervalValue,
          rule.intervalUnit,
          existing.preferredWindow,
        )
      : existing.nextDueAt;

  try {
    await prisma.$transaction(async (tx) => {
      await tx.reminder.update({
        where: { id: existing.id },
        data: {
          isPaused: false,
          pausedUntil: null,
          nextDueAt,
        },
      });
      await tx.reminderEvent.create({
        data: {
          id: randomUUID(),
          reminderId: existing.id,
          eventType: ReminderEventType.resumed,
          careLogId: null,
          metadata: {},
          createdById: session.user.id,
        },
      });
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not resume reminder." };
  }

  revalidateReminderPaths(input.collectionSlug, input.plantSlug);
  return { ok: true };
}

export async function archiveReminderAction(input: {
  collectionSlug: string;
  plantSlug: string;
  reminderId: string;
}): Promise<ReminderActionResult> {
  const session = await auth();
  if (!session?.user?.id) {
    return { ok: false, error: "You need to sign in again." };
  }

  const existing = await loadReminderForUser(
    session.user.id,
    input.collectionSlug,
    input.plantSlug,
    input.reminderId,
  );
  if (!existing) return { ok: false, error: "Reminder not found." };

  const now = new Date();
  try {
    await prisma.$transaction(async (tx) => {
      await tx.reminder.update({
        where: { id: existing.id },
        data: {
          archivedAt: now,
          isActive: false,
        },
      });
      await tx.reminderEvent.create({
        data: {
          id: randomUUID(),
          reminderId: existing.id,
          eventType: ReminderEventType.archived,
          careLogId: null,
          metadata: {},
          createdById: session.user.id,
        },
      });
    });
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Could not archive reminder." };
  }

  revalidateReminderPaths(input.collectionSlug, input.plantSlug);
  return { ok: true };
}
