import type {
  NormalizedPlantReference,
  TreflePlantSearchItem,
  TrefleSearchPlant,
  TrefleSpeciesDetail,
} from "./types";

function cleanString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => cleanString(item))
    .filter((item): item is string => Boolean(item));
}

function numberOrNull(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function deriveLightLabel(light: number | null): string | null {
  if (light == null) return null;
  if (light <= 2) return "Lower light";
  if (light <= 5) return "Bright indirect light";
  if (light <= 7) return "Bright light";
  return "Full sun";
}

function deriveSoilMoistureLabel(groundHumidity: number | null): string | null {
  if (groundHumidity == null) return null;
  if (groundHumidity <= 2) return "Let soil dry between waterings";
  if (groundHumidity <= 5) return "Keep soil lightly moist";
  if (groundHumidity <= 7) return "Prefers evenly moist soil";
  return "Likes high soil moisture";
}

function deriveHumidityLabel(atmosphericHumidity: number | null): string | null {
  if (atmosphericHumidity == null) return null;
  if (atmosphericHumidity <= 2) return "Handles drier household air";
  if (atmosphericHumidity <= 5) return "Average indoor humidity is fine";
  if (atmosphericHumidity <= 7) return "Appreciates moderate humidity";
  return "Prefers high humidity";
}

function deriveTemperatureLabel(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  if (min != null && max != null) return `${min}°C to ${max}°C`;
  if (min != null) return `Keep above ${min}°C`;
  return `Up to ${max}°C`;
}

function deriveToxicityLabel(toxicity: string | null): string | null {
  if (!toxicity) return null;
  const normalized = toxicity.toLowerCase();
  if (normalized.includes("none") || normalized.includes("not toxic")) {
    return "Not considered toxic";
  }
  if (normalized.includes("mild")) return "Mild toxicity";
  if (normalized.includes("high") || normalized.includes("severe")) {
    return "Higher toxicity";
  }
  return toxicity;
}

export function mapSearchPlant(item: TrefleSearchPlant): TreflePlantSearchItem {
  return {
    provider: "trefle",
    providerPlantId: String(item.id),
    providerSlug: cleanString(item.slug),
    commonName: cleanString(item.common_name),
    scientificName: cleanString(item.scientific_name),
    family: cleanString(item.family),
    familyCommonName: cleanString(item.family_common_name),
    genus: cleanString(item.genus),
    status: cleanString(item.status),
    rank: cleanString(item.rank),
    imageUrl: cleanString(item.image_url),
  };
}

export function normalizeTreflePlant(
  item: TrefleSpeciesDetail,
): NormalizedPlantReference {
  const light = numberOrNull(item.growth?.light);
  const groundHumidity = numberOrNull(item.growth?.ground_humidity);
  const atmosphericHumidity = numberOrNull(item.growth?.atmospheric_humidity);
  const minimumTemperatureDegC = numberOrNull(
    item.growth?.minimum_temperature?.deg_c,
  );
  const maximumTemperatureDegC = numberOrNull(
    item.growth?.maximum_temperature?.deg_c,
  );

  return {
    provider: "trefle",
    providerPlantId: String(item.id),
    providerSlug: cleanString(item.slug),
    commonName: cleanString(item.common_name),
    scientificName: cleanString(item.scientific_name),
    family: cleanString(item.family),
    familyCommonName: cleanString(item.family_common_name),
    genus: cleanString(item.genus),
    status: cleanString(item.status),
    rank: cleanString(item.rank),
    imageUrl: cleanString(item.image_url),
    light,
    groundHumidity,
    atmosphericHumidity,
    minimumTemperatureDegC,
    maximumTemperatureDegC,
    soilTexture: Array.isArray(item.growth?.soil_texture)
      ? item.growth?.soil_texture.filter(
          (value): value is number =>
            typeof value === "number" && Number.isFinite(value),
        )
      : [],
    soilNutriments: numberOrNull(item.growth?.soil_nutriments),
    growthRate: cleanString(item.growth?.growth_rate),
    duration: cleanString(item.duration),
    observations: cleanString(item.observations),
    edible: typeof item.edible === "boolean" ? item.edible : null,
    ediblePart: cleanStringArray(item.edible_part),
    vegetable: typeof item.vegetable === "boolean" ? item.vegetable : null,
    toxicity: cleanString(item.specifications?.toxicity),
    averageHeightValue: numberOrNull(item.specifications?.average_height?.cm),
    averageHeightUnit: item.specifications?.average_height?.cm != null ? "cm" : null,
    maximumHeightValue: numberOrNull(item.specifications?.maximum_height?.cm),
    maximumHeightUnit: item.specifications?.maximum_height?.cm != null ? "cm" : null,
    plantingSpreadValue: numberOrNull(item.growth?.spread?.cm),
    plantingSpreadUnit: item.growth?.spread?.cm != null ? "cm" : null,
    flowerColor: cleanStringArray(item.flower?.color),
    foliageColor: cleanStringArray(item.foliage?.color),
    leafRetention:
      typeof item.foliage?.leaf_retention === "boolean"
        ? item.foliage.leaf_retention
        : null,
    growthForm: cleanString(item.specifications?.growth_form),
    growthHabit: cleanString(item.specifications?.growth_habit),
    ligneousType: cleanString(item.specifications?.ligneous_type),
    lightLabel: deriveLightLabel(light),
    soilMoistureLabel: deriveSoilMoistureLabel(groundHumidity),
    humidityLabel: deriveHumidityLabel(atmosphericHumidity),
    temperatureLabel: deriveTemperatureLabel(
      minimumTemperatureDegC,
      maximumTemperatureDegC,
    ),
    toxicityLabel: deriveToxicityLabel(cleanString(item.specifications?.toxicity)),
  };
}
