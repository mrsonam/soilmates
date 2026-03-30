-- CreateEnum
CREATE TYPE "PlantImageType" AS ENUM ('cover', 'progress', 'diagnosis', 'log_attachment');

-- CreateTable
CREATE TABLE "plant_images" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "collection_id" UUID NOT NULL,
    "plant_id" UUID NOT NULL,
    "care_log_id" UUID,
    "diagnosis_id" UUID,
    "image_type" "PlantImageType" NOT NULL,
    "storage_path" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "captured_at" TIMESTAMPTZ(6),
    "uploaded_by" UUID NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "plant_images_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "plants" ADD COLUMN "primary_image_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "plants_primary_image_id_key" ON "plants"("primary_image_id");

-- AddForeignKey
ALTER TABLE "plant_images" ADD CONSTRAINT "plant_images_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "plant_images" ADD CONSTRAINT "plant_images_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "plant_images" ADD CONSTRAINT "plant_images_care_log_id_fkey" FOREIGN KEY ("care_log_id") REFERENCES "care_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "plant_images" ADD CONSTRAINT "plant_images_uploaded_by_fkey" FOREIGN KEY ("uploaded_by") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "plants" ADD CONSTRAINT "plants_primary_image_id_fkey" FOREIGN KEY ("primary_image_id") REFERENCES "plant_images"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "plant_images_plant_id_deleted_at_idx" ON "plant_images"("plant_id", "deleted_at");

CREATE INDEX "plant_images_collection_id_deleted_at_idx" ON "plant_images"("collection_id", "deleted_at");

CREATE INDEX "plant_images_care_log_id_idx" ON "plant_images"("care_log_id");
