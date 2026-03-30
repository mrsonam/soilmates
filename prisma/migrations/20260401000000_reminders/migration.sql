-- Reminder enums and tables
CREATE TYPE "ReminderType" AS ENUM (
  'watering', 'fertilizing', 'misting', 'pruning', 'repotting',
  'soil_change', 'rotation', 'pest_check', 'observation', 'custom'
);

CREATE TYPE "ReminderSource" AS ENUM ('user', 'ai_recommended');

CREATE TYPE "ReminderPreferredWindow" AS ENUM (
  'morning', 'afternoon', 'evening', 'flexible'
);

CREATE TYPE "ReminderEventType" AS ENUM (
  'created', 'completed', 'updated', 'paused', 'resumed', 'archived', 'care_log_matched'
);

CREATE TABLE "reminders" (
  "id" UUID NOT NULL,
  "collection_id" UUID NOT NULL,
  "plant_id" UUID NOT NULL,
  "reminder_type" "ReminderType" NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "source" "ReminderSource" NOT NULL DEFAULT 'user',
  "recurrence_rule" JSONB NOT NULL,
  "preferred_window" "ReminderPreferredWindow",
  "grace_period_hours" INTEGER,
  "overdue_after_hours" INTEGER,
  "last_completed_at" TIMESTAMPTZ(6),
  "next_due_at" TIMESTAMPTZ(6) NOT NULL,
  "is_paused" BOOLEAN NOT NULL DEFAULT false,
  "paused_until" TIMESTAMPTZ(6),
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "created_by" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "archived_at" TIMESTAMPTZ(6),

  CONSTRAINT "reminders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "reminder_events" (
  "id" UUID NOT NULL,
  "reminder_id" UUID NOT NULL,
  "event_type" "ReminderEventType" NOT NULL,
  "care_log_id" UUID,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_by" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "reminder_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reminders_plant_id_archived_at_idx" ON "reminders"("plant_id", "archived_at");
CREATE INDEX "reminders_collection_id_next_due_at_idx" ON "reminders"("collection_id", "next_due_at");
CREATE INDEX "reminders_next_due_at_idx" ON "reminders"("next_due_at");
CREATE INDEX "reminder_events_reminder_id_created_at_idx" ON "reminder_events"("reminder_id", "created_at");
CREATE INDEX "reminder_events_care_log_id_idx" ON "reminder_events"("care_log_id");

ALTER TABLE "reminders" ADD CONSTRAINT "reminders_collection_id_fkey"
  FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_plant_id_fkey"
  FOREIGN KEY ("plant_id") REFERENCES "plants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reminders" ADD CONSTRAINT "reminders_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "reminder_events" ADD CONSTRAINT "reminder_events_reminder_id_fkey"
  FOREIGN KEY ("reminder_id") REFERENCES "reminders"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reminder_events" ADD CONSTRAINT "reminder_events_care_log_id_fkey"
  FOREIGN KEY ("care_log_id") REFERENCES "care_logs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "reminder_events" ADD CONSTRAINT "reminder_events_created_by_fkey"
  FOREIGN KEY ("created_by") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
