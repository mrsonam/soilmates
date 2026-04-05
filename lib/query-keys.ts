/**
 * Hierarchical, versioned TanStack Query keys for Soil Mates.
 * Prefix everything with `queryRoot` so defaults and invalidation stay predictable.
 */
export const queryRoot = ["soilmates", "v1"] as const;

export const queryKeys = {
  root: queryRoot,

  collections: {
    /** All collections list (future client cache / prefetch) */
    list: () => [...queryRoot, "collections", "list"] as const,
    detail: (collectionSlug: string) =>
      [...queryRoot, "collection", collectionSlug] as const,
    plants: (collectionSlug: string) =>
      [...queryRoot, "collection", collectionSlug, "plants"] as const,
  },

  plant: {
    /** Logical scope for invalidation / warming related plant data */
    scope: (collectionSlug: string, plantSlug: string) =>
      [...queryRoot, "plant", collectionSlug, plantSlug] as const,
    careLogs: (collectionSlug: string, plantSlug: string) =>
      [...queryRoot, "plant", collectionSlug, plantSlug, "careLogs"] as const,
    reminders: (collectionSlug: string, plantSlug: string) =>
      [...queryRoot, "plant", collectionSlug, plantSlug, "reminders"] as const,
  },

  invitations: {
    pending: () => [...queryRoot, "invitations", "pending"] as const,
    /** Sidebar badge / lightweight count (optional client mirror) */
    count: () => [...queryRoot, "invitations", "count"] as const,
  },

  settings: {
    user: () => [...queryRoot, "settings", "user"] as const,
  },

  activity: {
    plantPreview: (collectionSlug: string, plantSlug: string) =>
      [...queryRoot, "activity", "plant", collectionSlug, plantSlug] as const,
    collectionPreview: (collectionSlug: string) =>
      [...queryRoot, "activity", "collection", collectionSlug] as const,
  },

  archive: {
    plants: (collectionSlug: string) =>
      [...queryRoot, "archive", collectionSlug, "plants"] as const,
    areas: (collectionSlug: string) =>
      [...queryRoot, "archive", collectionSlug, "areas"] as const,
  },

  collection: {
    pendingInvitesOut: (collectionSlug: string) =>
      [...queryRoot, "collection", collectionSlug, "invites", "outgoing"] as const,
  },
} as const;
