import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { slugifyName } from "./slug";

const MAX_SLUG_LEN = 80;

/** Slug unique within a collection. */
export async function resolveUniqueAreaSlug(
  collectionId: string,
  name: string,
  tx?: Prisma.TransactionClient,
): Promise<string> {
  const db = tx ?? prisma;
  let base = slugifyName(name);
  if (base === "collection") base = "area";
  let candidate = base;
  for (let i = 0; i < 8; i++) {
    const taken = await db.area.findFirst({
      where: { collectionId, slug: candidate },
      select: { id: true },
    });
    if (!taken) return candidate.slice(0, MAX_SLUG_LEN);
    candidate = `${base}-${randomBytes(3).toString("hex")}`.slice(
      0,
      MAX_SLUG_LEN,
    );
  }
  return `${base}-${randomBytes(6).toString("hex")}`.slice(0, MAX_SLUG_LEN);
}
