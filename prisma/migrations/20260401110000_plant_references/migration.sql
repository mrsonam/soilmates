CREATE TABLE IF NOT EXISTS "plant_references" (
  "id" UUID NOT NULL,
  "provider" VARCHAR(40) NOT NULL,
  "provider_plant_id" VARCHAR(100) NOT NULL,
  "provider_slug" TEXT,
  "common_name" TEXT,
  "scientific_name" TEXT,
  "family" TEXT,
  "family_common_name" TEXT,
  "genus" TEXT,
  "status" TEXT,
  "rank" TEXT,
  "image_url" TEXT,
  "light" INTEGER,
  "ground_humidity" INTEGER,
  "atmospheric_humidity" INTEGER,
  "minimum_temperature_deg_c" DOUBLE PRECISION,
  "maximum_temperature_deg_c" DOUBLE PRECISION,
  "soil_texture" JSONB NOT NULL DEFAULT '[]',
  "soil_nutriments" INTEGER,
  "growth_rate" TEXT,
  "duration" TEXT,
  "observations" TEXT,
  "edible" BOOLEAN,
  "edible_part" JSONB NOT NULL DEFAULT '[]',
  "vegetable" BOOLEAN,
  "toxicity" TEXT,
  "average_height_value" DOUBLE PRECISION,
  "average_height_unit" TEXT,
  "maximum_height_value" DOUBLE PRECISION,
  "maximum_height_unit" TEXT,
  "planting_spread_value" DOUBLE PRECISION,
  "planting_spread_unit" TEXT,
  "flower_color" JSONB NOT NULL DEFAULT '[]',
  "foliage_color" JSONB NOT NULL DEFAULT '[]',
  "leaf_retention" BOOLEAN,
  "growth_form" TEXT,
  "growth_habit" TEXT,
  "ligneous_type" TEXT,
  "light_label" TEXT,
  "soil_moisture_label" TEXT,
  "humidity_label" TEXT,
  "temperature_label" TEXT,
  "toxicity_label" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_synced_at" TIMESTAMPTZ(6) NOT NULL,

  CONSTRAINT "plant_references_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "plants"
  ADD COLUMN IF NOT EXISTS "reference_snapshot" JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS "plant_references_provider_provider_plant_id_key"
  ON "plant_references"("provider", "provider_plant_id");

CREATE INDEX IF NOT EXISTS "plant_references_provider_provider_slug_idx"
  ON "plant_references"("provider", "provider_slug");

CREATE INDEX IF NOT EXISTS "plant_references_provider_common_name_idx"
  ON "plant_references"("provider", "common_name");

CREATE INDEX IF NOT EXISTS "plants_reference_catalog_id_idx"
  ON "plants"("reference_catalog_id");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'plants_reference_catalog_id_fkey'
  ) THEN
    ALTER TABLE "plants"
      ADD CONSTRAINT "plants_reference_catalog_id_fkey"
      FOREIGN KEY ("reference_catalog_id") REFERENCES "plant_references"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
