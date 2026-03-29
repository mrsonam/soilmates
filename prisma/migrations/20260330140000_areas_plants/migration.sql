-- CreateTable
CREATE TABLE "areas" (
    "id" UUID NOT NULL,
    "collection_id" UUID NOT NULL,
    "slug" VARCHAR(80) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "archived_at" TIMESTAMPTZ(6),

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "plants" (
    "id" UUID NOT NULL,
    "area_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "archived_at" TIMESTAMPTZ(6),

    CONSTRAINT "plants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "areas_collection_id_archived_at_idx" ON "areas"("collection_id", "archived_at");

-- CreateIndex
CREATE INDEX "plants_area_id_archived_at_idx" ON "plants"("area_id", "archived_at");

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "collections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "plants" ADD CONSTRAINT "plants_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "areas_collection_id_slug_key" ON "areas"("collection_id", "slug");
