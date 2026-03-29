import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugifyName } from "@/lib/collections/slug";

const MAX_SLUG_LEN = 100;

/** Unique `slug` per collection for plants. */
export async function resolveUniquePlantSlug(
  collectionId: string,
  nickname: string,
  tx?: Prisma.TransactionClient,
): Promise<string> {
  const db = tx ?? prisma;
  let base = slugifyName(nickname);
  if (!base || base === "collection") base = "plant";
  let candidate = base.slice(0, MAX_SLUG_LEN);
  for (let i = 0; i < 8; i++) {
    const taken = await db.plant.findFirst({
      where: { collectionId, slug: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
    const suffix = randomBytes(3).toString("hex");
    candidate = `${base}-${suffix}`.slice(0, MAX_SLUG_LEN);
  }
  return `${base}-${randomBytes(6).toString("hex")}`.slice(0, MAX_SLUG_LEN);
}
