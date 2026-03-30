import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAreaForActiveMemberBySlugs } from "@/lib/collections/access";
import { getCollectionDetailForActiveMember } from "@/lib/collections/collection-detail";
import { getPlantsForAreaMember } from "@/lib/plants/queries";
import { PageContainer } from "@/components/layout/page-container";
import { AreaDetailView } from "@/components/areas/area-detail-view";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{ collectionSlug: string; areaSlug: string }>;
};

export default async function AreaDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug, areaSlug } = await params;
  const [area, collectionDetail, plants] = await Promise.all([
    getAreaForActiveMemberBySlugs(session.user.id, collectionSlug, areaSlug),
    getCollectionDetailForActiveMember(session.user.id, collectionSlug),
    getPlantsForAreaMember(session.user.id, collectionSlug, areaSlug),
  ]);

  if (!area || !collectionDetail) {
    notFound();
  }

  const plantList = plants ?? [];
  const uploadsEnabled = isSupabaseStorageConfigured();

  return (
    <PageContainer>
      <AreaDetailView
        collectionSlug={collectionSlug}
        collectionName={collectionDetail.name}
        areaName={area.name}
        areaSlug={areaSlug}
        description={area.description}
        plantCount={area._count.plants}
        coverImageSignedUrl={area.coverImageSignedUrl}
        uploadsEnabled={uploadsEnabled}
        areaId={area.id}
        plants={plantList}
      />
    </PageContainer>
  );
}
