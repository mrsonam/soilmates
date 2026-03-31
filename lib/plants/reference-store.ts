import { randomUUID } from "crypto";
import { Prisma, type PrismaClient } from "@prisma/client";
import { plantReferenceSnapshotSchema } from "@/lib/integrations/trefle/types";
import type {
  NormalizedPlantReference,
  PlantReferenceSnapshot,
} from "@/lib/integrations/trefle/types";

type PrismaTx = PrismaClient | Prisma.TransactionClient;

export function createPlantReferenceSnapshot(
  reference: NormalizedPlantReference,
): PlantReferenceSnapshot {
  return plantReferenceSnapshotSchema.parse({
    ...reference,
    snapshotVersion: 1,
    capturedAt: new Date().toISOString(),
  });
}

export function parsePlantReferenceSnapshot(
  value: Prisma.JsonValue | null,
): PlantReferenceSnapshot | null {
  const parsed = plantReferenceSnapshotSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

export async function upsertPlantReference(
  db: PrismaTx,
  reference: NormalizedPlantReference,
): Promise<{ id: string }> {
  const payload = {
    provider: reference.provider,
    providerPlantId: reference.providerPlantId,
    providerSlug: reference.providerSlug ?? null,
    commonName: reference.commonName ?? null,
    scientificName: reference.scientificName ?? null,
    family: reference.family ?? null,
    familyCommonName: reference.familyCommonName ?? null,
    genus: reference.genus ?? null,
    status: reference.status ?? null,
    rank: reference.rank ?? null,
    imageUrl: reference.imageUrl ?? null,
    light: reference.light ?? null,
    groundHumidity: reference.groundHumidity ?? null,
    atmosphericHumidity: reference.atmosphericHumidity ?? null,
    minimumTemperatureDegC: reference.minimumTemperatureDegC ?? null,
    maximumTemperatureDegC: reference.maximumTemperatureDegC ?? null,
    soilTexture: reference.soilTexture as Prisma.InputJsonValue,
    soilNutriments: reference.soilNutriments ?? null,
    growthRate: reference.growthRate ?? null,
    duration: reference.duration ?? null,
    observations: reference.observations ?? null,
    edible: reference.edible ?? null,
    ediblePart: reference.ediblePart as Prisma.InputJsonValue,
    vegetable: reference.vegetable ?? null,
    toxicity: reference.toxicity ?? null,
    averageHeightValue: reference.averageHeightValue ?? null,
    averageHeightUnit: reference.averageHeightUnit ?? null,
    maximumHeightValue: reference.maximumHeightValue ?? null,
    maximumHeightUnit: reference.maximumHeightUnit ?? null,
    plantingSpreadValue: reference.plantingSpreadValue ?? null,
    plantingSpreadUnit: reference.plantingSpreadUnit ?? null,
    flowerColor: reference.flowerColor as Prisma.InputJsonValue,
    foliageColor: reference.foliageColor as Prisma.InputJsonValue,
    leafRetention: reference.leafRetention ?? null,
    growthForm: reference.growthForm ?? null,
    growthHabit: reference.growthHabit ?? null,
    ligneousType: reference.ligneousType ?? null,
    lightLabel: reference.lightLabel ?? null,
    soilMoistureLabel: reference.soilMoistureLabel ?? null,
    humidityLabel: reference.humidityLabel ?? null,
    temperatureLabel: reference.temperatureLabel ?? null,
    toxicityLabel: reference.toxicityLabel ?? null,
    lastSyncedAt: new Date(),
  };

  const existing = await db.plantReference.findUnique({
    where: {
      provider_providerPlantId: {
        provider: reference.provider,
        providerPlantId: reference.providerPlantId,
      },
    },
    select: { id: true },
  });

  if (existing) {
    await db.plantReference.update({
      where: { id: existing.id },
      data: payload,
    });
    return existing;
  }

  return db.plantReference.create({
    data: {
      id: randomUUID(),
      ...payload,
    },
    select: { id: true },
  });
}
