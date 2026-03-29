import { randomBytes } from "crypto";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const MAX_SLUG_LEN = 80;

/** URL-safe slug from display name (lowercase, hyphens, alphanum). */
export function slugifyName(name: string): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG_LEN);
  return base || "collection";
}

function randomSuffix(): string {
  return randomBytes(3).toString("hex");
}

/** Resolves a globally unique collection slug (retries on collision). */
export async function resolveUniqueCollectionSlug(
  name: string,
  tx?: Prisma.TransactionClient,
): Promise<string> {
  const db = tx ?? prisma;
  let base = slugifyName(name);
  let candidate = base;
  for (let i = 0; i < 8; i++) {
    const taken = await db.collection.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!taken) return candidate;
    candidate = `${base}-${randomSuffix()}`.slice(0, MAX_SLUG_LEN);
  }
  return `${base}-${randomBytes(6).toString("hex")}`.slice(0, MAX_SLUG_LEN);
}
