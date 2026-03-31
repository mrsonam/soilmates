import { z } from "zod";
import { mapSearchPlant, normalizeTreflePlant } from "./mappers";
import {
  fetchPlantsSearch,
  fetchPlantById,
  fetchSpeciesBySlug,
} from "./client";
import {
  normalizedPlantReferenceSchema,
  treflePlantSearchItemSchema,
  type NormalizedPlantReference,
  type TreflePlantSearchItem,
} from "./types";

const referenceIdentifierSchema = z
  .string()
  .trim()
  .regex(/^[a-z0-9-]+(:[a-z0-9-]+)?$/i, "Invalid plant reference");

function parseReferenceIdentifier(identifier: string) {
  const parsed = referenceIdentifierSchema.parse(identifier);
  const [type, value] = parsed.includes(":") ? parsed.split(":", 2) : ["id", parsed];
  return { type, value };
}

export async function searchPlants(query: string): Promise<TreflePlantSearchItem[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const response = await fetchPlantsSearch(q);
  return (response.data ?? []).map((item) =>
    treflePlantSearchItemSchema.parse(mapSearchPlant(item)),
  );
}

export async function getPlantReference(
  providerPlantIdOrSlug: string,
): Promise<NormalizedPlantReference> {
  const { type, value } = parseReferenceIdentifier(providerPlantIdOrSlug);

  const response =
    type === "slug" ? await fetchSpeciesBySlug(value) : await fetchPlantById(value);

  if (!response.data) {
    throw new Error("Trefle plant detail payload was empty.");
  }

  return normalizedPlantReferenceSchema.parse(normalizeTreflePlant(response.data));
}
