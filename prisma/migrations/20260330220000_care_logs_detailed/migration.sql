-- Expand care log action enum (append-only in PostgreSQL)
ALTER TYPE "CareLogActionType" ADD VALUE 'misted';
ALTER TYPE "CareLogActionType" ADD VALUE 'soil_changed';
ALTER TYPE "CareLogActionType" ADD VALUE 'rotated';
ALTER TYPE "CareLogActionType" ADD VALUE 'moved_location';
ALTER TYPE "CareLogActionType" ADD VALUE 'pest_treatment';
ALTER TYPE "CareLogActionType" ADD VALUE 'cleaned_leaves';
ALTER TYPE "CareLogActionType" ADD VALUE 'propagated';
ALTER TYPE "CareLogActionType" ADD VALUE 'seeded';
ALTER TYPE "CareLogActionType" ADD VALUE 'germinated';
ALTER TYPE "CareLogActionType" ADD VALUE 'harvested';
ALTER TYPE "CareLogActionType" ADD VALUE 'plant_died';
ALTER TYPE "CareLogActionType" ADD VALUE 'custom';

-- Event time + rich fields + soft delete
ALTER TABLE "care_logs" ADD COLUMN "action_at" TIMESTAMPTZ(6);
UPDATE "care_logs" SET "action_at" = "created_at" WHERE "action_at" IS NULL;
ALTER TABLE "care_logs" ALTER COLUMN "action_at" SET NOT NULL;

ALTER TABLE "care_logs" ADD COLUMN "notes" TEXT;
ALTER TABLE "care_logs" ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "care_logs" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "care_logs" ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "care_logs" ADD COLUMN "deleted_at" TIMESTAMPTZ(6);

DROP INDEX IF EXISTS "care_logs_plant_id_created_at_idx";
CREATE INDEX "care_logs_plant_id_action_at_idx" ON "care_logs"("plant_id", "action_at" DESC);
CREATE INDEX "care_logs_plant_id_deleted_at_idx" ON "care_logs"("plant_id", "deleted_at");
