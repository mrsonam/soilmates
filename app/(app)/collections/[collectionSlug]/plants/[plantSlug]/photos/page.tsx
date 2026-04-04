import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPlantDetailBySlugs } from "@/lib/plants/plant-detail";
import { getPlantImagesForGallery } from "@/lib/plants/plant-images";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";
import { PageContainer } from "@/components/layout/page-container";
import { CollectionSectionTabs } from "@/components/collections/collection-section-tabs";
import { PlantPhotoGallery } from "@/components/plants/photos/plant-photo-gallery";

type Props = {
  params: Promise<{ collectionSlug: string; plantSlug: string }>;
};

export default async function PlantPhotosPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug, plantSlug } = await params;
  const [plant, galleryImages] = await Promise.all([
    getPlantDetailBySlugs(session.user.id, collectionSlug, plantSlug),
    getPlantImagesForGallery(session.user.id, collectionSlug, plantSlug),
  ]);

  if (!plant || galleryImages === null) {
    notFound();
  }

  return (
    <PageContainer>
      <CollectionSectionTabs collectionSlug={collectionSlug} className="mb-6" />

      <p className="mb-4 text-sm text-on-surface-variant">
        <Link
          href={`/collections/${collectionSlug}/plants/${plantSlug}`}
          className="font-medium text-primary hover:underline"
        >
          ← Back to plant
        </Link>
      </p>
      <PlantPhotoGallery
        variant="full"
        collectionSlug={collectionSlug}
        plantSlug={plant.slug}
        plantNickname={plant.nickname}
        images={galleryImages}
        uploadsEnabled={isSupabaseStorageConfigured()}
        diagnosisHref={`/collections/${collectionSlug}/plants/${plant.slug}?tab=assistant#plant-check-in`}
      />
    </PageContainer>
  );
}
