-- CreateEnum
CREATE TYPE "CareLogActionType" AS ENUM ('watered', 'fertilized', 'repotted', 'pruned', 'observation');

-- CreateTable
CREATE TABLE "care_logs" (
    "id" UUID NOT NULL,
    "plant_id" UUID NOT NULL,
    "created_by" UUID NOT NULL,
    "action_type" "CareLogActionType" NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "care_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "care_logs_plant_id_created_at_idx" ON "care_logs"("plant_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "care_logs" ADD CONSTRAINT "care_logs_plant_id_fkey" FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "care_logs" ADD CONSTRAINT "care_logs_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
