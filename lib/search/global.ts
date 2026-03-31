import { prisma } from "@/lib/prisma";
import { CareLogActionType } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import type {
  GlobalSearchFilters,
  GlobalSearchResults,
  ReminderStatusFilter,
  SearchCollectionOption,
  SearchEntityType,
} from "./types";

function normalizeQuery(q: string): string {
  return q.trim().toLowerCase();
}

function scoreTextMatch(q: string, value: string | null | undefined): number {
  if (!value) return 0;
  const v = value.toLowerCase();
  if (v === q) return 120;
  if (v.startsWith(q)) return 90;
  if (v.includes(q)) return 60;
  return 0;
}

function scorePlant(q: string, p: { nickname: string; referenceCommonName: string | null }) {
  return (
    scoreTextMatch(q, p.nickname) +
    scoreTextMatch(q, p.referenceCommonName) * 0.75
  );
}

function scoreCollection(q: string, c: { name: string; description: string | null }) {
  return scoreTextMatch(q, c.name) + scoreTextMatch(q, c.description) * 0.5;
}

function scoreArea(q: string, a: { name: string; description: string | null }) {
  return scoreTextMatch(q, a.name) + scoreTextMatch(q, a.description) * 0.5;
}

function scoreCareLog(q: string, l: { notes: string | null; actionType: string; plantNickname: string }) {
  return (
    scoreTextMatch(q, l.plantNickname) +
    scoreTextMatch(q, l.actionType) * 0.7 +
    scoreTextMatch(q, l.notes) * 0.5
  );
}

function scoreReminder(q: string, r: { title: string; plantNickname: string; reminderType: string }) {
  return (
    scoreTextMatch(q, r.title) +
    scoreTextMatch(q, r.plantNickname) * 0.9 +
    scoreTextMatch(q, r.reminderType) * 0.7
  );
}

function scoreActivity(q: string, a: { summary: string; eventType: string }) {
  return scoreTextMatch(q, a.summary) + scoreTextMatch(q, a.eventType) * 0.7;
}

function scorePhoto(q: string, p: { imageType: string; plantNickname: string }) {
  return scoreTextMatch(q, p.plantNickname) * 0.9 + scoreTextMatch(q, p.imageType) * 0.6;
}

function applyEntityTypeGate(type: SearchEntityType, entity: Exclude<SearchEntityType, "all">) {
  return type === "all" || type === entity;
}

function parseCareLogActionTypeFromQuery(q: string): CareLogActionType | null {
  const normalized = q.trim().toLowerCase();
  const values = Object.values(CareLogActionType) as string[];
  return values.includes(normalized) ? (normalized as CareLogActionType) : null;
}

function reminderStatusWhere(status: ReminderStatusFilter, now: Date): Prisma.ReminderWhereInput {
  if (status === "paused") {
    return { isPaused: true };
  }
  if (status === "overdue") {
    return { isPaused: false, nextDueAt: { lt: now } };
  }
  if (status === "due") {
    return { isPaused: false, nextDueAt: { lte: now } };
  }
  return { isPaused: false, nextDueAt: { gt: now } };
}

export async function searchGlobalForUser(
  userId: string,
  collections: SearchCollectionOption[],
  filters: GlobalSearchFilters,
  limitPerGroup = 8,
): Promise<GlobalSearchResults> {
  const allowedCollections = collections;
  const allowedBySlug = new Map(allowedCollections.map((c) => [c.slug, c] as const));

  const scopedCollection =
    filters.collectionSlug && allowedBySlug.has(filters.collectionSlug)
      ? allowedBySlug.get(filters.collectionSlug)!
      : null;

  const scopedCollectionIds = scopedCollection
    ? [scopedCollection.id]
    : [...new Set(allowedCollections.map((c) => c.id))];

  const q = filters.q?.trim() ? normalizeQuery(filters.q) : null;
  if (!q) {
    return {
      filters: { ...filters, q: null },
      groups: {
        plants: [],
        collections: [],
        areas: [],
        reminders: [],
        careLogs: [],
        photos: [],
        activity: [],
      },
      counts: {
        total: 0,
        plants: 0,
        collections: 0,
        areas: 0,
        reminders: 0,
        careLogs: 0,
        photos: 0,
        activity: 0,
      },
    };
  }

  // Security note:
  // - Every query is scoped to collection IDs derived from active memberships.
  // - The caller passes userId only for audit/logging parity; access is enforced by collection scoping.
  void userId;

  const now = new Date();
  const containsInsensitive = (value: string): Prisma.StringFilter => ({
    contains: value,
    mode: "insensitive",
  });

  const careActionFromQuery = parseCareLogActionTypeFromQuery(filters.q!);

  const plantWhere: Prisma.PlantWhereInput = {
    archivedAt: null,
    collectionId: { in: scopedCollectionIds },
    ...(filters.plantHealthStatus ? { healthStatus: filters.plantHealthStatus } : {}),
    ...(filters.plantLifeStage ? { lifeStage: filters.plantLifeStage } : {}),
    OR: [
      { nickname: containsInsensitive(filters.q!) },
      { referenceCommonName: containsInsensitive(filters.q!) },
      { notes: containsInsensitive(filters.q!) },
      { area: { name: containsInsensitive(filters.q!) } },
    ],
  };

  const collectionWhere: Prisma.CollectionWhereInput = {
    id: { in: scopedCollectionIds },
    archivedAt: null,
    OR: [
      { name: containsInsensitive(filters.q!) },
      { description: containsInsensitive(filters.q!) },
    ],
  };

  const areaWhere: Prisma.AreaWhereInput = {
    collectionId: { in: scopedCollectionIds },
    archivedAt: null,
    OR: [
      { name: containsInsensitive(filters.q!) },
      { description: containsInsensitive(filters.q!) },
      { collection: { name: containsInsensitive(filters.q!) } },
    ],
  };

  const careLogWhere: Prisma.CareLogWhereInput = {
    deletedAt: null,
    plant: { archivedAt: null, collectionId: { in: scopedCollectionIds } },
    ...(filters.careActionType ? { actionType: filters.careActionType } : {}),
    OR: [
      { notes: containsInsensitive(filters.q!) },
      ...(careActionFromQuery ? [{ actionType: careActionFromQuery }] : []),
      { plant: { nickname: containsInsensitive(filters.q!) } },
      { plant: { referenceCommonName: containsInsensitive(filters.q!) } },
    ],
  };

  const reminderWhere: Prisma.ReminderWhereInput = {
    archivedAt: null,
    collectionId: { in: scopedCollectionIds },
    ...(filters.reminderStatus ? reminderStatusWhere(filters.reminderStatus, now) : {}),
    OR: [
      { title: containsInsensitive(filters.q!) },
      { description: containsInsensitive(filters.q!) },
      { plant: { nickname: containsInsensitive(filters.q!) } },
      { plant: { referenceCommonName: containsInsensitive(filters.q!) } },
    ],
  };

  const photoWhere: Prisma.PlantImageWhereInput = {
    deletedAt: null,
    collectionId: { in: scopedCollectionIds },
    plant: { archivedAt: null },
    OR: [
      { plant: { nickname: containsInsensitive(filters.q!) } },
      { plant: { referenceCommonName: containsInsensitive(filters.q!) } },
    ],
  };

  const activityWhere: Prisma.ActivityEventWhereInput = {
    collectionId: { in: scopedCollectionIds },
    OR: [
      { summary: containsInsensitive(filters.q!) },
      { eventType: containsInsensitive(filters.q!) },
      { plant: { nickname: containsInsensitive(filters.q!) } },
      { plant: { referenceCommonName: containsInsensitive(filters.q!) } },
    ],
  };

  const plantsPromise = applyEntityTypeGate(filters.type, "plants")
    ? prisma.plant.findMany({
        where: plantWhere,
        take: Math.max(limitPerGroup * 3, 18),
        orderBy: [{ isFavorite: "desc" }, { updatedAt: "desc" }],
        select: {
          id: true,
          slug: true,
          nickname: true,
          referenceCommonName: true,
          healthStatus: true,
          lifeStage: true,
          primaryImageUrl: true,
          collection: { select: { id: true, slug: true, name: true } },
          area: { select: { id: true, slug: true, name: true } },
        },
      })
    : Promise.resolve([]);

  const collectionsPromise = applyEntityTypeGate(filters.type, "collections")
    ? prisma.collection.findMany({
        where: collectionWhere,
        take: Math.max(limitPerGroup * 3, 18),
        orderBy: { updatedAt: "desc" },
        select: { id: true, slug: true, name: true, description: true },
      })
    : Promise.resolve([]);

  const areasPromise = applyEntityTypeGate(filters.type, "areas")
    ? prisma.area.findMany({
        where: areaWhere,
        take: Math.max(limitPerGroup * 3, 18),
        orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
        select: {
          id: true,
          slug: true,
          name: true,
          description: true,
          collection: { select: { id: true, slug: true, name: true } },
          _count: { select: { plants: { where: { archivedAt: null } } } },
        },
      })
    : Promise.resolve([]);

  const remindersPromise = applyEntityTypeGate(filters.type, "reminders")
    ? prisma.reminder.findMany({
        where: reminderWhere,
        take: Math.max(limitPerGroup * 3, 18),
        orderBy: [{ nextDueAt: "asc" }],
        select: {
          id: true,
          title: true,
          reminderType: true,
          nextDueAt: true,
          isPaused: true,
          plant: { select: { id: true, slug: true, nickname: true } },
          collection: { select: { id: true, slug: true, name: true } },
        },
      })
    : Promise.resolve([]);

  const careLogsPromise = applyEntityTypeGate(filters.type, "care_logs")
    ? prisma.careLog.findMany({
        where: careLogWhere,
        take: Math.max(limitPerGroup * 3, 18),
        orderBy: [{ actionAt: "desc" }],
        select: {
          id: true,
          actionType: true,
          actionAt: true,
          notes: true,
          plant: {
            select: {
              id: true,
              slug: true,
              nickname: true,
              collection: { select: { id: true, slug: true, name: true } },
            },
          },
        },
      })
    : Promise.resolve([]);

  const photosPromise = applyEntityTypeGate(filters.type, "photos")
    ? prisma.plantImage.findMany({
        where: photoWhere,
        take: Math.max(limitPerGroup * 3, 18),
        orderBy: [{ capturedAt: "desc" }, { createdAt: "desc" }],
        select: {
          id: true,
          imageType: true,
          createdAt: true,
          capturedAt: true,
          plant: {
            select: {
              id: true,
              slug: true,
              nickname: true,
              collection: { select: { id: true, slug: true, name: true } },
            },
          },
        },
      })
    : Promise.resolve([]);

  const activityPromise = applyEntityTypeGate(filters.type, "activity")
    ? prisma.activityEvent.findMany({
        where: activityWhere,
        take: Math.max(limitPerGroup * 3, 18),
        orderBy: [{ createdAt: "desc" }],
        select: {
          id: true,
          summary: true,
          eventType: true,
          createdAt: true,
          plant: { select: { id: true, slug: true, nickname: true } },
          collection: { select: { id: true, slug: true, name: true } },
        },
      })
    : Promise.resolve([]);

  const [
    plantsRaw,
    collectionsRaw,
    areasRaw,
    remindersRaw,
    careLogsRaw,
    photosRaw,
    activityRaw,
  ] = await Promise.all([
    plantsPromise,
    collectionsPromise,
    areasPromise,
    remindersPromise,
    careLogsPromise,
    photosPromise,
    activityPromise,
  ]);

  const plants = plantsRaw
    .map((p) => ({
      entityType: "plants" as const,
      id: p.id,
      nickname: p.nickname,
      referenceCommonName: p.referenceCommonName,
      slug: p.slug,
      healthStatus: p.healthStatus,
      lifeStage: p.lifeStage,
      primaryImageUrl: p.primaryImageUrl,
      collection: p.collection,
      area: p.area,
      _score: scorePlant(q, p),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limitPerGroup)
    .map((item) => {
      const { _score, ...rest } = item;
      void _score;
      return rest;
    });

  const collectionsFound = collectionsRaw
    .map((c) => ({
      entityType: "collections" as const,
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      _score: scoreCollection(q, c),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limitPerGroup);

  const collectionStats =
    collectionsFound.length > 0
      ? await Promise.all(
          collectionsFound.map(async (c) => {
            const [plantCount, areaCount] = await Promise.all([
              prisma.plant.count({ where: { collectionId: c.id, archivedAt: null } }),
              prisma.area.count({ where: { collectionId: c.id, archivedAt: null } }),
            ]);
            return { id: c.id, plantCount, areaCount };
          }),
        )
      : [];
  const statsByCollectionId = new Map(
    collectionStats.map((s) => [s.id, { plantCount: s.plantCount, areaCount: s.areaCount }] as const),
  );

  const collectionResults = collectionsFound
    .map((item) => {
      const { _score, ...c } = item;
      void _score;
      return {
        ...c,
      stats: statsByCollectionId.get(c.id) ?? { plantCount: 0, areaCount: 0 },
      };
    })
    .slice(0, limitPerGroup);

  const areas = areasRaw
    .map((a) => ({
      entityType: "areas" as const,
      id: a.id,
      slug: a.slug,
      name: a.name,
      description: a.description,
      collection: a.collection,
      plantCount: a._count?.plants ?? 0,
      _score: scoreArea(q, a),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limitPerGroup)
    .map((item) => {
      const { _score, ...rest } = item;
      void _score;
      return rest;
    });

  const careLogs = careLogsRaw
    .map((l) => ({
      entityType: "care_logs" as const,
      id: l.id,
      actionType: l.actionType,
      actionAt: l.actionAt,
      notes: l.notes,
      plant: { id: l.plant.id, slug: l.plant.slug, nickname: l.plant.nickname },
      collection: l.plant.collection,
      _score: scoreCareLog(q, {
        notes: l.notes,
        actionType: String(l.actionType),
        plantNickname: l.plant.nickname,
      }),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limitPerGroup)
    .map((item) => {
      const { _score, ...rest } = item;
      void _score;
      return rest;
    });

  const reminders = remindersRaw
    .map((r) => ({
      entityType: "reminders" as const,
      id: r.id,
      title: r.title,
      reminderType: String(r.reminderType),
      nextDueAt: r.nextDueAt,
      isPaused: r.isPaused,
      plant: r.plant,
      collection: r.collection,
      _score: scoreReminder(q, {
        title: r.title,
        plantNickname: r.plant.nickname,
        reminderType: String(r.reminderType),
      }),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limitPerGroup)
    .map((item) => {
      const { _score, ...rest } = item;
      void _score;
      return rest;
    });

  const photos = photosRaw
    .map((p) => ({
      entityType: "photos" as const,
      id: p.id,
      imageType: String(p.imageType),
      createdAt: p.createdAt,
      capturedAt: p.capturedAt,
      plant: { id: p.plant.id, slug: p.plant.slug, nickname: p.plant.nickname },
      collection: p.plant.collection,
      _score: scorePhoto(q, { imageType: String(p.imageType), plantNickname: p.plant.nickname }),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limitPerGroup)
    .map((item) => {
      const { _score, ...rest } = item;
      void _score;
      return rest;
    });

  const activity = activityRaw
    .map((a) => ({
      entityType: "activity" as const,
      id: a.id,
      summary: a.summary,
      eventType: a.eventType,
      createdAt: a.createdAt,
      plant: a.plant ? { id: a.plant.id, slug: a.plant.slug, nickname: a.plant.nickname } : null,
      collection: a.collection,
      _score: scoreActivity(q, a),
    }))
    .sort((a, b) => b._score - a._score)
    .slice(0, limitPerGroup)
    .map((item) => {
      const { _score, ...rest } = item;
      void _score;
      return rest;
    });

  const counts = {
    plants: plants.length,
    collections: collectionResults.length,
    areas: areas.length,
    reminders: reminders.length,
    careLogs: careLogs.length,
    photos: photos.length,
    activity: activity.length,
  };

  return {
    filters: {
      ...filters,
      collectionSlug: scopedCollection ? scopedCollection.slug : null,
      q: filters.q,
    },
    groups: { plants, collections: collectionResults, areas, reminders, careLogs, photos, activity },
    counts: { total: Object.values(counts).reduce((a, b) => a + b, 0), ...counts },
  };
}

