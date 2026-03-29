import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPlantDetailBySlugs } from "@/lib/plants/plant-detail";
import { getPlantCareLogs } from "@/lib/plants/care-logs";
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
  const [plant, careLogs] = await Promise.all([
    getPlantDetailBySlugs(session.user.id, collectionSlug, plantSlug),
    getPlantCareLogs(session.user.id, collectionSlug, plantSlug),
  ]);

  if (!plant || careLogs === null) {
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
      />
    </PageContainer>
  );
}
