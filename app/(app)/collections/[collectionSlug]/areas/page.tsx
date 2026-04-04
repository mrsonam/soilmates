import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCollectionDetailForActiveMember } from "@/lib/collections/collection-detail";
import { PageContainer } from "@/components/layout/page-container";
import { CollectionAreasView } from "@/components/collections/collection-areas-view";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";

type Props = {
  params: Promise<{ collectionSlug: string }>;
};

export default async function CollectionAreasPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug } = await params;
  const detail = await getCollectionDetailForActiveMember(
    session.user.id,
    collectionSlug,
  );

  if (!detail) {
    notFound();
  }

  const uploadsEnabled = isSupabaseStorageConfigured();

  return (
    <PageContainer>
      <CollectionAreasView
        collectionSlug={detail.slug}
        areas={detail.areas}
        uploadsEnabled={uploadsEnabled}
      />
    </PageContainer>
  );
}
