import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPlantDetailBySlugs } from "@/lib/plants/plant-detail";
import { getPlantCareLogs } from "@/lib/plants/care-logs";
import { getPlantImagesForGallery } from "@/lib/plants/plant-images";
import { getPlantRemindersForMember } from "@/lib/reminders/queries";
import { getPlantActivityForMember } from "@/lib/activity/queries";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";
import { PageContainer } from "@/components/layout/page-container";
import { PlantDetailView } from "@/components/plants/detail/plant-detail-view";

type Props = {
  params: Promise<{ collectionSlug: string; plantSlug: string }>;
};

/**
 * Same plant detail experience with Care history tab selected (shareable URL).
 */
export default async function PlantCareHistoryPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug, plantSlug } = await params;
  const [plant, careLogs, galleryImages, remindersPayload, plantActivity] =
    await Promise.all([
    getPlantDetailBySlugs(session.user.id, collectionSlug, plantSlug),
    getPlantCareLogs(session.user.id, collectionSlug, plantSlug),
    getPlantImagesForGallery(session.user.id, collectionSlug, plantSlug),
    getPlantRemindersForMember(session.user.id, collectionSlug, plantSlug),
    getPlantActivityForMember(session.user.id, collectionSlug, plantSlug, 12),
  ]);
  const reminders = remindersPayload ?? [];

  if (!plant || careLogs === null || galleryImages === null) {
    notFound();
  }

  return (
    <PageContainer>
      <p className="mb-4 text-sm text-on-surface-variant">
        <Link
          href={`/collections/${collectionSlug}/plants/${plantSlug}`}
          className="font-medium text-primary hover:underline"
        >
          ← Back to plant
        </Link>
      </p>
      <PlantDetailView
        plant={plant}
        collectionSlug={collectionSlug}
        careLogs={careLogs}
        currentUserId={session.user.id}
        initialTab="care_history"
        galleryImages={galleryImages}
        uploadsEnabled={isSupabaseStorageConfigured()}
        reminders={reminders}
        plantActivity={plantActivity}
        assistantThreadId={null}
        assistantMessages={[]}
      />
    </PageContainer>
  );
}
