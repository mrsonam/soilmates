-- Push subscriptions, delivery dedupe, and notification preferences on profiles

CREATE TYPE "PushDeliveryKind" AS ENUM ('due', 'overdue');

ALTER TABLE "profiles" ADD COLUMN "push_notifications_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "profiles" ADD COLUMN "in_app_notifications_enabled" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "profiles" ADD COLUMN "notification_quiet_start_minute" INTEGER;
ALTER TABLE "profiles" ADD COLUMN "notification_quiet_end_minute" INTEGER;
ALTER TABLE "profiles" ADD COLUMN "preferred_notification_window" "ReminderPreferredWindow";

CREATE TABLE "push_subscriptions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh_key" TEXT NOT NULL,
    "auth_key" TEXT NOT NULL,
    "user_agent" TEXT,
    "device_label" VARCHAR(120),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMPTZ(6),

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

ALTER TABLE "push_subscriptions" ADD CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "push_notification_deliveries" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "kind" "PushDeliveryKind" NOT NULL,
    "bucket_key" VARCHAR(40) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "push_notification_deliveries_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "push_notification_deliveries_user_id_created_at_idx" ON "push_notification_deliveries"("user_id", "created_at" DESC);
CREATE UNIQUE INDEX "push_notification_deliveries_user_id_kind_bucket_key_key" ON "push_notification_deliveries"("user_id", "kind", "bucket_key");

ALTER TABLE "push_notification_deliveries" ADD CONSTRAINT "push_notification_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
