import type { TreflePaginationResponse, TrefleSearchPlant, TrefleSpeciesDetail } from "./types";

const TREFLE_BASE_URL = "https://trefle.io";

export class TrefleError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly retryable = false,
  ) {
    super(message);
    this.name = "TrefleError";
  }
}

function getTrefleToken() {
  const token = process.env.TREFLE_API_KEY?.trim();
  if (!token) {
    throw new TrefleError("Trefle is not configured.", 500, false);
  }
  return token;
}

async function trefleFetch<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  revalidate: number,
): Promise<T> {
  const url = new URL(path, TREFLE_BASE_URL);
  url.searchParams.set("token", getTrefleToken());

  for (const [key, value] of Object.entries(params)) {
    if (value == null || value === "") continue;
    url.searchParams.set(key, String(value));
  }

  let response: Response;
  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate },
      signal: AbortSignal.timeout(8000),
    });
  } catch (error) {
    if (
      error instanceof Error &&
      (error.name === "TimeoutError" || error.name === "AbortError")
    ) {
      throw new TrefleError("Trefle request timed out.", 504, true);
    }
    throw new TrefleError("Unable to reach Trefle.", 503, true);
  }

  if (!response.ok) {
    throw new TrefleError(
      `Trefle request failed with status ${response.status}.`,
      response.status,
      response.status >= 500 || response.status === 429,
    );
  }

  return (await response.json()) as T;
}

export function fetchPlantsSearch(query: string) {
  return trefleFetch<TreflePaginationResponse<TrefleSearchPlant>>(
    "/api/v1/plants/search",
    { q: query },
    300,
  );
}

export function fetchSpeciesBySlug(slug: string) {
  return trefleFetch<{ data?: TrefleSpeciesDetail }>(
    `/api/v1/species/${slug}`,
    {},
    60 * 60 * 24,
  );
}

export function fetchPlantById(id: string) {
  return trefleFetch<{ data?: TrefleSpeciesDetail }>(
    `/api/v1/plants/${id}`,
    {},
    60 * 60 * 24,
  );
}
