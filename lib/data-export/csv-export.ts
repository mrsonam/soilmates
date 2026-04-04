import { prisma } from "@/lib/prisma";
import { CollectionMemberStatus } from "@prisma/client";

function escapeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function row(cells: (string | number | boolean | null | undefined)[]): string {
  return cells.map(escapeCsvCell).join(",");
}

export async function buildPlantsCsv(userId: string): Promise<string> {
  const memberships = await prisma.collectionMember.findMany({
    where: { userId, status: CollectionMemberStatus.active },
    select: { collectionId: true },
  });
  const ids = [...new Set(memberships.map((m) => m.collectionId))];
  if (ids.length === 0) {
    return row([
      "collection_slug",
      "collection_name",
      "plant_slug",
      "nickname",
      "area",
      "archived",
      "created_at",
    ]);
  }

  const plants = await prisma.plant.findMany({
    where: { collectionId: { in: ids } },
    orderBy: [{ collection: { name: "asc" } }, { nickname: "asc" }],
    select: {
      slug: true,
      nickname: true,
      archivedAt: true,
      createdAt: true,
      area: { select: { name: true } },
      collection: { select: { slug: true, name: true } },
    },
  });

  const lines = [
    row([
      "collection_slug",
      "collection_name",
      "plant_slug",
      "nickname",
      "area",
      "archived",
      "created_at",
    ]),
  ];
  for (const p of plants) {
    lines.push(
      row([
        p.collection.slug,
        p.collection.name,
        p.slug,
        p.nickname,
        p.area.name,
        p.archivedAt ? "yes" : "no",
        p.createdAt.toISOString(),
      ]),
    );
  }
  return lines.join("\n");
}

export async function buildCareLogsCsv(userId: string): Promise<string> {
  const memberships = await prisma.collectionMember.findMany({
    where: { userId, status: CollectionMemberStatus.active },
    select: { collectionId: true },
  });
  const ids = [...new Set(memberships.map((m) => m.collectionId))];
  if (ids.length === 0) {
    return row([
      "collection_slug",
      "plant_slug",
      "plant_nickname",
      "action_type",
      "action_at",
      "notes",
    ]);
  }

  const logs = await prisma.careLog.findMany({
    where: {
      deletedAt: null,
      plant: { collectionId: { in: ids } },
    },
    orderBy: { actionAt: "desc" },
    take: 5000,
    select: {
      actionType: true,
      actionAt: true,
      notes: true,
      plant: {
        select: {
          slug: true,
          nickname: true,
          collection: { select: { slug: true } },
        },
      },
    },
  });

  const lines = [
    row([
      "collection_slug",
      "plant_slug",
      "plant_nickname",
      "action_type",
      "action_at",
      "notes",
    ]),
  ];
  for (const l of logs) {
    lines.push(
      row([
        l.plant.collection.slug,
        l.plant.slug,
        l.plant.nickname,
        l.actionType,
        l.actionAt.toISOString(),
        l.notes,
      ]),
    );
  }
  return lines.join("\n");
}

export async function buildRemindersCsv(userId: string): Promise<string> {
  const memberships = await prisma.collectionMember.findMany({
    where: { userId, status: CollectionMemberStatus.active },
    select: { collectionId: true },
  });
  const ids = [...new Set(memberships.map((m) => m.collectionId))];
  if (ids.length === 0) {
    return row([
      "collection_slug",
      "plant_slug",
      "plant_nickname",
      "title",
      "reminder_type",
      "next_due_at",
      "archived",
    ]);
  }

  const reminders = await prisma.reminder.findMany({
    where: { collectionId: { in: ids } },
    orderBy: { nextDueAt: "asc" },
    take: 3000,
    select: {
      reminderType: true,
      title: true,
      nextDueAt: true,
      archivedAt: true,
      plant: {
        select: {
          slug: true,
          nickname: true,
          collection: { select: { slug: true } },
        },
      },
    },
  });

  const lines = [
    row([
      "collection_slug",
      "plant_slug",
      "plant_nickname",
      "title",
      "reminder_type",
      "next_due_at",
      "archived",
    ]),
  ];
  for (const r of reminders) {
    lines.push(
      row([
        r.plant.collection.slug,
        r.plant.slug,
        r.plant.nickname,
        r.title,
        r.reminderType,
        r.nextDueAt.toISOString(),
        r.archivedAt ? "yes" : "no",
      ]),
    );
  }
  return lines.join("\n");
}
