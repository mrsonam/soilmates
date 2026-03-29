-- CreateEnum
CREATE TYPE "PlantLifeStage" AS ENUM ('sprout', 'juvenile', 'mature');

-- CreateEnum
CREATE TYPE "PlantHealthStatus" AS ENUM ('thriving', 'needs_attention');

-- CreateEnum
CREATE TYPE "PlantAcquisitionType" AS ENUM ('purchased', 'propagated', 'gift', 'seed', 'other');

-- AlterTable: collection scope + slug + rename name -> nickname + user fields
ALTER TABLE "plants" ADD COLUMN "collection_id" UUID;

UPDATE "plants" AS p
SET "collection_id" = a.collection_id
FROM "areas" AS a
WHERE a.id = p.area_id;

ALTER TABLE "plants" ALTER COLUMN "collection_id" SET NOT NULL;

ALTER TABLE "plants" ADD CONSTRAINT "plants_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "plants" ADD COLUMN "slug" VARCHAR(100);

UPDATE "plants"
SET "slug" = 'plant-' || SUBSTRING(REPLACE(id::text, '-', ''), 1, 12)
WHERE "slug" IS NULL;

ALTER TABLE "plants" ALTER COLUMN "slug" SET NOT NULL;

ALTER TABLE "plants" RENAME COLUMN "name" TO "nickname";

ALTER TABLE "plants" ADD COLUMN "reference_common_name" TEXT;
ALTER TABLE "plants" ADD COLUMN "reference_catalog_id" UUID;
ALTER TABLE "plants" ADD COLUMN "plant_type" TEXT;
ALTER TABLE "plants" ADD COLUMN "life_stage" "PlantLifeStage" NOT NULL DEFAULT 'juvenile';
ALTER TABLE "plants" ADD COLUMN "health_status" "PlantHealthStatus" NOT NULL DEFAULT 'thriving';
ALTER TABLE "plants" ADD COLUMN "acquisition_type" "PlantAcquisitionType" NOT NULL DEFAULT 'other';
ALTER TABLE "plants" ADD COLUMN "acquired_at" DATE;
ALTER TABLE "plants" ADD COLUMN "notes" TEXT;
ALTER TABLE "plants" ADD COLUMN "primary_image_url" TEXT;
ALTER TABLE "plants" ADD COLUMN "growth_progress_percent" SMALLINT;
ALTER TABLE "plants" ADD COLUMN "is_favorite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "plants" ADD COLUMN "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "plants_collection_id_slug_key" ON "plants"("collection_id", "slug");

-- CreateIndex
CREATE INDEX "plants_collection_id_archived_at_idx" ON "plants"("collection_id", "archived_at");

-- Align with Prisma: no DB-level defaults on these columns (was merged from mis-ordered migration 20260329102740_)
ALTER TABLE "plants" ALTER COLUMN "life_stage" DROP DEFAULT,
ALTER COLUMN "health_status" DROP DEFAULT,
ALTER COLUMN "acquisition_type" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;
