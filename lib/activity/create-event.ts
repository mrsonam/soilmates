import { randomUUID } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notifyCollaboratorsOfChange } from "@/lib/supabase/realtime-notify";
import { revalidateActivityPaths } from "@/lib/activity/revalidate";

export type InsertActivityEventInput = {
  collectionId: string;
  plantId?: string | null;
  actorUserId: string;
  eventType: string;
  summary: string;
  payload?: Prisma.InputJsonValue;
};

/** Insert only (use inside `$transaction`). */
export async function insertActivityEvent(
  db: Prisma.TransactionClient | typeof prisma,
  input: InsertActivityEventInput,
): Promise<void> {
  await db.activityEvent.create({
    data: {
      id: randomUUID(),
      collectionId: input.collectionId,
      plantId: input.plantId ?? null,
      actorUserId: input.actorUserId,
      eventType: input.eventType,
      summary: input.summary,
      payload: input.payload ?? undefined,
    },
  });
}

/** After commit: realtime + Next.js cache. */
export async function publishActivitySideEffects(opts: {
  collectionId: string;
  collectionSlug?: string;
  plantSlug?: string;
}): Promise<void> {
  void notifyCollaboratorsOfChange({
    collectionIds: [opts.collectionId],
  });

  if (opts.collectionSlug) {
    revalidateActivityPaths({
      collectionSlug: opts.collectionSlug,
      plantSlug: opts.plantSlug,
    });
    return;
  }

  const col = await prisma.collection.findUnique({
    where: { id: opts.collectionId },
    select: { slug: true },
  });
  if (col) {
    revalidateActivityPaths({
      collectionSlug: col.slug,
      plantSlug: opts.plantSlug,
    });
  }
}

export type CreateActivityEventInput = InsertActivityEventInput & {
  collectionSlug?: string;
  plantSlug?: string;
};

/**
 * Insert + publish. For use outside transactions.
 * From inside a transaction, use `insertActivityEvent` + `publishActivitySideEffects` after commit.
 */
export async function createActivityEvent(
  input: CreateActivityEventInput,
): Promise<void> {
  await insertActivityEvent(prisma, input);
  await publishActivitySideEffects({
    collectionId: input.collectionId,
    collectionSlug: input.collectionSlug,
    plantSlug: input.plantSlug,
  });
}
