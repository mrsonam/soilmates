-- Collection invite: declined status, timestamps, email NOT NULL, partial unique pending invites

ALTER TYPE "CollectionInviteStatus" ADD VALUE 'declined';

ALTER TABLE "collection_invites" ADD COLUMN "declined_at" TIMESTAMPTZ(6);
ALTER TABLE "collection_invites" ADD COLUMN "revoked_at" TIMESTAMPTZ(6);

UPDATE "collection_invites" SET "email" = 'legacy@invite.local' WHERE "email" IS NULL;
ALTER TABLE "collection_invites" ALTER COLUMN "email" SET NOT NULL;

CREATE UNIQUE INDEX "collection_invites_collection_pending_email_lower_idx"
ON "collection_invites" ("collection_id", lower("email"))
WHERE "status" = 'pending';

CREATE INDEX "collection_invites_collection_id_status_idx"
ON "collection_invites" ("collection_id", "status");
