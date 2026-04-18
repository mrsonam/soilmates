/**
 * Apply curated Unsplash URLs to the demo showcase collection, its areas, and plants.
 * Run after migrating when you already seeded and do not want to wipe the DB.
 *
 *   npx tsx prisma/update-showcase-media.ts
 */
import { PrismaClient } from "@prisma/client";

import {
  SHOWCASE_AREA_COVER_URLS,
  SHOWCASE_COLLECTION_COVER_URL,
  SHOWCASE_PLANT_PRIMARY_URLS,
} from "../lib/demo/showcase-media-urls";

const COLLECTION_SLUG = "showcase-demo-jungle";

async function main() {
  const prisma = new PrismaClient();
  try {
    const collection = await prisma.collection.findUnique({
      where: { slug: COLLECTION_SLUG },
      select: { id: true },
    });
    if (!collection) {
      console.error(
        `[update-showcase-media] No collection with slug "${COLLECTION_SLUG}". Seed the demo first.`,
      );
      process.exitCode = 1;
      return;
    }

    const coll = await prisma.collection.update({
      where: { id: collection.id },
      data: { coverImagePublicUrl: SHOWCASE_COLLECTION_COVER_URL },
      select: { id: true },
    });
    console.info(`[update-showcase-media] Collection ${coll.id} cover updated.`);

    for (const [slug, url] of Object.entries(SHOWCASE_AREA_COVER_URLS)) {
      const res = await prisma.area.updateMany({
        where: { collectionId: collection.id, slug },
        data: { coverImagePublicUrl: url },
      });
      console.info(`[update-showcase-media] Area "${slug}": ${res.count} row(s).`);
    }

    for (const [slug, url] of Object.entries(SHOWCASE_PLANT_PRIMARY_URLS)) {
      const res = await prisma.plant.updateMany({
        where: { collectionId: collection.id, slug },
        data: { primaryImageUrl: url },
      });
      if (res.count > 0) {
        console.info(`[update-showcase-media] Plant "${slug}": ${res.count} row(s).`);
      }
    }

    console.info("[update-showcase-media] Done.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
