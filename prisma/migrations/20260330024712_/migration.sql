-- DropIndex
DROP INDEX "care_logs_plant_id_action_at_idx";

-- AlterTable
ALTER TABLE "care_logs" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "plant_images" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateIndex
CREATE INDEX "care_logs_plant_id_action_at_idx" ON "care_logs"("plant_id", "action_at");
