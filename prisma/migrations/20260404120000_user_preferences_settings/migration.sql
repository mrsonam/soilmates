-- CreateEnum
CREATE TYPE "UserTheme" AS ENUM ('light', 'dark', 'system');

-- CreateEnum
CREATE TYPE "WaterUnit" AS ENUM ('ml');

-- CreateEnum
CREATE TYPE "LengthUnit" AS ENUM ('cm', 'in');

-- CreateEnum
CREATE TYPE "AiPersonalityLevel" AS ENUM ('factual', 'balanced', 'warm');

-- CreateEnum
CREATE TYPE "CareSensitivity" AS ENUM ('relaxed', 'standard', 'cautious');

-- AlterTable
ALTER TABLE "profiles"
  ADD COLUMN "theme" "UserTheme" NOT NULL DEFAULT 'system',
  ADD COLUMN "water_unit" "WaterUnit" NOT NULL DEFAULT 'ml',
  ADD COLUMN "length_unit" "LengthUnit" NOT NULL DEFAULT 'cm',
  ADD COLUMN "ai_personality_level" "AiPersonalityLevel" NOT NULL DEFAULT 'balanced',
  ADD COLUMN "care_sensitivity" "CareSensitivity" NOT NULL DEFAULT 'standard',
  ADD COLUMN "default_collection_id" UUID;

-- CreateIndex
CREATE INDEX "profiles_default_collection_id_idx" ON "profiles"("default_collection_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_default_collection_id_fkey" FOREIGN KEY ("default_collection_id") REFERENCES "collections"("id") ON DELETE SET NULL ON UPDATE CASCADE;
