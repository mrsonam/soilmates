import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPlantDetailBySlugs } from "@/lib/plants/plant-detail";
import { getPlantCareLogs } from "@/lib/plants/care-logs";
import { PageContainer } from "@/components/layout/page-container";
import { PlantDetailView } from "@/components/plants/detail/plant-detail-view";

type Props = {
  params: Promise<{ collectionSlug: string; plantSlug: string }>;
};

export default async function PlantDetailPage({ params }: Props) {
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
      <PlantDetailView
        plant={plant}
        collectionSlug={collectionSlug}
        careLogs={careLogs}
        currentUserId={session.user.id}
      />
    </PageContainer>
  );
}
