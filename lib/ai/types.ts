/**
 * Structured context passed to the model and optionally stored on assistant messages.
 * Keep JSON-serializable for `context_snapshot`.
 */
export type GlobalAssistantContextJson = {
  mode: "global";
  userProfileId: string;
  /** Optional collection the user is focused on (not auto-inferred; explicit only). */
  collectionSlug?: string | null;
  collectionName?: string | null;
  /** From user settings; shapes assistant tone. */
  aiPersonalityLevel?: "factual" | "balanced" | "warm";
  assembledAt: string;
};

export type PlantAssistantContextJson = {
  mode: "plant";
  userProfileId: string;
  /** Core plant record (from app DB). */
  plant: {
    id: string;
    nickname: string;
    slug: string;
    referenceCommonName: string | null;
    plantType: string | null;
    lifeStage: string;
    healthStatus: string;
    acquisitionType: string;
    acquiredAt: string | null;
    notes: string | null;
    isFavorite: boolean;
    growthProgressPercent: number | null;
    area: { name: string; slug: string };
    collection: { name: string; slug: string };
    counts: { careLogs: number; photos: number; reminders: number };
  };
  recentCareLogs: Array<{
    actionType: string;
    actionAt: string;
    notes: string | null;
  }>;
  activeReminders: Array<{
    title: string;
    reminderType: string;
    nextDueAt: string;
    isPaused: boolean;
  }>;
  recentImages: Array<{
    imageType: string;
    capturedAt: string | null;
    createdAt: string;
  }>;
  recentActivity: Array<{
    eventType: string;
    summary: string;
    createdAt: string;
  }>;
  /** Snapshot of selected reference data at assembly time (if any). */
  referenceSnapshot: unknown;
  aiPersonalityLevel?: "factual" | "balanced" | "warm";
  assembledAt: string;
};

export type AssistantContextSnapshot =
  | GlobalAssistantContextJson
  | PlantAssistantContextJson;
