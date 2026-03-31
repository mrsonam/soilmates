import { z } from "zod";

export type TreflePaginationResponse<T> = {
  data?: T[];
  links?: Record<string, string | null> | null;
  meta?: { total?: number | null } | null;
};

export type TrefleSearchPlant = {
  id: number;
  common_name?: string | null;
  scientific_name?: string | null;
  family?: string | null;
  family_common_name?: string | null;
  genus?: string | null;
  slug?: string | null;
  status?: string | null;
  rank?: string | null;
  image_url?: string | null;
};

export type TrefleSpeciesDetail = {
  id: number;
  common_name?: string | null;
  scientific_name?: string | null;
  slug?: string | null;
  family?: string | null;
  family_common_name?: string | null;
  genus?: string | null;
  status?: string | null;
  rank?: string | null;
  image_url?: string | null;
  observations?: string | null;
  edible?: boolean | null;
  edible_part?: string[] | null;
  vegetable?: boolean | null;
  specifications?: {
    toxicity?: string | null;
    growth_form?: string | null;
    growth_habit?: string | null;
    ligneous_type?: string | null;
    average_height?: {
      cm?: number | null;
    } | null;
    maximum_height?: {
      cm?: number | null;
    } | null;
  } | null;
  growth?: {
    light?: number | null;
    atmospheric_humidity?: number | null;
    ground_humidity?: number | null;
    soil_texture?: number[] | null;
    soil_nutriments?: number | null;
    growth_rate?: string | null;
    sowing?: string | null;
    spread?: {
      cm?: number | null;
    } | null;
    days_to_harvest?: number | null;
    row_spacing?: {
      cm?: number | null;
    } | null;
    ph_maximum?: number | null;
    ph_minimum?: number | null;
    minimum_temperature?: {
      deg_c?: number | null;
      deg_f?: number | null;
    } | null;
    maximum_temperature?: {
      deg_c?: number | null;
      deg_f?: number | null;
    } | null;
  } | null;
  flower?: {
    color?: string[] | null;
  } | null;
  foliage?: {
    color?: string[] | null;
    leaf_retention?: boolean | null;
  } | null;
  duration?: string | null;
};

export const treflePlantSearchItemSchema = z.object({
  provider: z.literal("trefle"),
  providerPlantId: z.string(),
  providerSlug: z.string().nullable(),
  commonName: z.string().nullable(),
  scientificName: z.string().nullable(),
  family: z.string().nullable(),
  familyCommonName: z.string().nullable(),
  genus: z.string().nullable(),
  status: z.string().nullable(),
  rank: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
});

export const normalizedPlantReferenceSchema = z.object({
  provider: z.literal("trefle"),
  providerPlantId: z.string(),
  providerSlug: z.string().nullable(),
  commonName: z.string().nullable(),
  scientificName: z.string().nullable(),
  family: z.string().nullable(),
  familyCommonName: z.string().nullable(),
  genus: z.string().nullable(),
  status: z.string().nullable(),
  rank: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
  light: z.number().int().nullable(),
  groundHumidity: z.number().int().nullable(),
  atmosphericHumidity: z.number().int().nullable(),
  minimumTemperatureDegC: z.number().nullable(),
  maximumTemperatureDegC: z.number().nullable(),
  soilTexture: z.array(z.number().int()).default([]),
  soilNutriments: z.number().int().nullable(),
  growthRate: z.string().nullable(),
  duration: z.string().nullable(),
  observations: z.string().nullable(),
  edible: z.boolean().nullable(),
  ediblePart: z.array(z.string()).default([]),
  vegetable: z.boolean().nullable(),
  toxicity: z.string().nullable(),
  averageHeightValue: z.number().nullable(),
  averageHeightUnit: z.string().nullable(),
  maximumHeightValue: z.number().nullable(),
  maximumHeightUnit: z.string().nullable(),
  plantingSpreadValue: z.number().nullable(),
  plantingSpreadUnit: z.string().nullable(),
  flowerColor: z.array(z.string()).default([]),
  foliageColor: z.array(z.string()).default([]),
  leafRetention: z.boolean().nullable(),
  growthForm: z.string().nullable(),
  growthHabit: z.string().nullable(),
  ligneousType: z.string().nullable(),
  lightLabel: z.string().nullable(),
  soilMoistureLabel: z.string().nullable(),
  humidityLabel: z.string().nullable(),
  temperatureLabel: z.string().nullable(),
  toxicityLabel: z.string().nullable(),
});

export const plantReferenceSnapshotSchema = normalizedPlantReferenceSchema.extend({
  snapshotVersion: z.literal(1),
  capturedAt: z.string(),
});

export type TreflePlantSearchItem = z.infer<typeof treflePlantSearchItemSchema>;
export type NormalizedPlantReference = z.infer<typeof normalizedPlantReferenceSchema>;
export type PlantReferenceSnapshot = z.infer<typeof plantReferenceSnapshotSchema>;

export function createReferenceIdentifier(item: {
  providerPlantId: string;
  providerSlug?: string | null;
}) {
  if (item.providerSlug) return `slug:${item.providerSlug}`;
  return `id:${item.providerPlantId}`;
}
