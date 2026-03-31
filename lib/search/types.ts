import type { CareLogActionType, PlantHealthStatus, PlantLifeStage } from "@prisma/client";

export type SearchEntityType =
  | "all"
  | "plants"
  | "collections"
  | "areas"
  | "care_logs"
  | "reminders"
  | "photos"
  | "activity";

export type ReminderStatusFilter = "upcoming" | "due" | "overdue" | "paused";

export type GlobalSearchFilters = {
  q: string | null;
  type: SearchEntityType;
  collectionSlug: string | null;
  plantHealthStatus: PlantHealthStatus | null;
  plantLifeStage: PlantLifeStage | null;
  reminderStatus: ReminderStatusFilter | null;
  careActionType: CareLogActionType | null;
};

export type SearchCollectionOption = { id: string; slug: string; name: string };

export type SearchResultPlant = {
  entityType: "plants";
  id: string;
  nickname: string;
  referenceCommonName: string | null;
  slug: string;
  healthStatus: PlantHealthStatus;
  lifeStage: PlantLifeStage;
  collection: { id: string; slug: string; name: string };
  area: { id: string; slug: string; name: string };
  primaryImageUrl: string | null;
};

export type SearchResultCollection = {
  entityType: "collections";
  id: string;
  slug: string;
  name: string;
  description: string | null;
  stats: { plantCount: number; areaCount: number };
};

export type SearchResultArea = {
  entityType: "areas";
  id: string;
  slug: string;
  name: string;
  description: string | null;
  collection: { id: string; slug: string; name: string };
  plantCount: number;
};

export type SearchResultCareLog = {
  entityType: "care_logs";
  id: string;
  actionType: CareLogActionType;
  actionAt: Date;
  notes: string | null;
  plant: { id: string; slug: string; nickname: string };
  collection: { id: string; slug: string; name: string };
};

export type SearchResultReminder = {
  entityType: "reminders";
  id: string;
  title: string;
  reminderType: string;
  nextDueAt: Date;
  isPaused: boolean;
  plant: { id: string; slug: string; nickname: string };
  collection: { id: string; slug: string; name: string };
};

export type SearchResultPhoto = {
  entityType: "photos";
  id: string;
  imageType: string;
  createdAt: Date;
  capturedAt: Date | null;
  plant: { id: string; slug: string; nickname: string };
  collection: { id: string; slug: string; name: string };
};

export type SearchResultActivity = {
  entityType: "activity";
  id: string;
  summary: string;
  eventType: string;
  createdAt: Date;
  plant: { id: string; slug: string; nickname: string } | null;
  collection: { id: string; slug: string; name: string };
};

export type GlobalSearchResults = {
  filters: GlobalSearchFilters;
  groups: {
    plants: SearchResultPlant[];
    collections: SearchResultCollection[];
    areas: SearchResultArea[];
    reminders: SearchResultReminder[];
    careLogs: SearchResultCareLog[];
    photos: SearchResultPhoto[];
    activity: SearchResultActivity[];
  };
  counts: {
    total: number;
    plants: number;
    collections: number;
    areas: number;
    reminders: number;
    careLogs: number;
    photos: number;
    activity: number;
  };
};

