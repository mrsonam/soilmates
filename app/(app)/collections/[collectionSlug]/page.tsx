import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCollectionDetailForActiveMember } from "@/lib/collections/collection-detail";
import { getPlantsForCollectionMember } from "@/lib/plants/queries";
import { PageContainer } from "@/components/layout/page-container";
import { CollectionDetailView } from "@/components/collections/collection-detail-view";
import { formatShortDate } from "@/lib/format";

type Props = {
  params: Promise<{ collectionSlug: string }>;
};

export default async function CollectionHomePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug } = await params;
  const [detail, plantsPayload] = await Promise.all([
    getCollectionDetailForActiveMember(session.user.id, collectionSlug),
    getPlantsForCollectionMember(session.user.id, collectionSlug),
  ]);

  if (!detail) {
    notFound();
  }

  const plants = plantsPayload?.plants ?? [];

  const createdLabel = `Created ${formatShortDate(detail.createdAt.toISOString())}`;

  return (
    <PageContainer>
      <CollectionDetailView
        collectionSlug={detail.slug}
        name={detail.name}
        description={detail.description}
        createdLabel={createdLabel}
        memberCount={detail.memberCount}
        plantCount={detail.plantCount}
        areaCount={detail.areaCount}
        areas={detail.areas}
        plants={plants}
      />
    </PageContainer>
  );
}
