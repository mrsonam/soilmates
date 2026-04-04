import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { CollectionSectionTabs } from "@/components/collections/collection-section-tabs";
import {
  getArchivedEntitiesForCollection,
  countActivePlantsInCollection,
} from "@/lib/archive/queries";
import { ArchivePageView } from "@/components/archive/archive-page-view";

type Props = {
  params: Promise<{ collectionSlug: string }>;
};

export default async function CollectionArchivePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug } = await params;
  const data = await getArchivedEntitiesForCollection(
    session.user.id,
    collectionSlug,
  );

  if (!data) {
    notFound();
  }

  const activePlants = await countActivePlantsInCollection(data.collectionId);
  const canArchiveCollection = activePlants === 0;

  return (
    <PageContainer>
      <div className="space-y-6">
        <CollectionSectionTabs collectionSlug={collectionSlug} />
        <ArchivePageView
          collectionSlug={collectionSlug}
          collectionName={data.collectionName}
          plants={data.plants}
          areas={data.areas}
          canArchiveCollection={canArchiveCollection}
        />
      </div>
    </PageContainer>
  );
}
