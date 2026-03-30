import { prisma } from "@/lib/prisma";

/** Short display name for summaries, e.g. "Sonam" or email local part. */
export async function getActorLabel(userId: string): Promise<string> {
  const p = await prisma.profile.findUnique({
    where: { id: userId },
    select: { fullName: true, email: true },
  });
  if (!p) return "Someone";
  const name = p.fullName?.trim();
  if (name) {
    const first = name.split(/\s+/)[0];
    return first ?? name;
  }
  return p.email.split("@")[0] || "Someone";
}
