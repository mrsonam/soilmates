import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCollectionDetailForActiveMember } from "@/lib/collections/collection-detail";
import { getCollectionActivityForMember } from "@/lib/activity/queries";
import { PageContainer } from "@/components/layout/page-container";
import { CollectionDetailView } from "@/components/collections/collection-detail-view";
import { formatShortDate } from "@/lib/format";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{ collectionSlug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function CollectionHomePage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug } = await params;
  const q = await searchParams;
  if (q.tab === "areas") {
    redirect(`/collections/${collectionSlug}/areas`);
  }
  const [detail, activityPreview] = await Promise.all([
    getCollectionDetailForActiveMember(session.user.id, collectionSlug),
    getCollectionActivityForMember(session.user.id, collectionSlug, 8),
  ]);

  if (!detail) {
    notFound();
  }

  const createdLabel = `Created ${formatShortDate(detail.createdAt.toISOString())}`;
  const uploadsEnabled = isSupabaseStorageConfigured();

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
        collectionCoverUrl={detail.coverImageSignedUrl}
        uploadsEnabled={uploadsEnabled}
        activityPreview={activityPreview}
      />
    </PageContainer>
  );
}
