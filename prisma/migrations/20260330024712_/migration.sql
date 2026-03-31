DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'care_logs'
  ) THEN
    EXECUTE 'DROP INDEX IF EXISTS "care_logs_plant_id_action_at_idx"';
    EXECUTE 'ALTER TABLE "care_logs" ALTER COLUMN "updated_at" DROP DEFAULT';
    EXECUTE 'CREATE INDEX IF NOT EXISTS "care_logs_plant_id_action_at_idx" ON "care_logs"("plant_id", "action_at")';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'plant_images'
  ) THEN
    EXECUTE 'ALTER TABLE "plant_images" ALTER COLUMN "id" DROP DEFAULT, ALTER COLUMN "updated_at" DROP DEFAULT';
  END IF;
END $$;
