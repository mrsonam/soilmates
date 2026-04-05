const PLANTS_KEY = "soilmates.recent.plants.v1";
const COLLECTIONS_KEY = "soilmates.recent.collections.v1";
const MAX_PLANTS = 8;
const MAX_COLLECTIONS = 6;

function safeParse(json: string | null): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json) as unknown;
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

/** Remember last opened plants for UX (longer cache warm hints / future prefetch). */
export function recordRecentPlantVisit(
  collectionSlug: string,
  plantSlug: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const key = `${collectionSlug}\t${plantSlug}`;
    const prev = safeParse(sessionStorage.getItem(PLANTS_KEY));
    const next = [key, ...prev.filter((k) => k !== key)].slice(0, MAX_PLANTS);
    sessionStorage.setItem(PLANTS_KEY, JSON.stringify(next));
  } catch {
    /* quota / private mode */
  }
}

export function recordRecentCollectionVisit(collectionSlug: string): void {
  if (typeof window === "undefined") return;
  try {
    const prev = safeParse(sessionStorage.getItem(COLLECTIONS_KEY));
    const next = [collectionSlug, ...prev.filter((k) => k !== collectionSlug)].slice(
      0,
      MAX_COLLECTIONS,
    );
    sessionStorage.setItem(COLLECTIONS_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function getRecentPlantVisits(): Array<{
  collectionSlug: string;
  plantSlug: string;
}> {
  if (typeof window === "undefined") return [];
  const raw = safeParse(sessionStorage.getItem(PLANTS_KEY));
  return raw
    .map((line) => {
      const [c, p] = line.split("\t");
      if (!c || !p) return null;
      return { collectionSlug: c, plantSlug: p };
    })
    .filter((x): x is { collectionSlug: string; plantSlug: string } => x != null);
}
