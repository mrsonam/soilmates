import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPlantsForCollectionMember } from "@/lib/plants/queries";
import { PageContainer } from "@/components/layout/page-container";
import { PlantsPageView } from "@/components/plants/plants-page-view";

type Props = {
  params: Promise<{ collectionSlug: string }>;
};

export default async function CollectionPlantsPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug } = await params;
  const data = await getPlantsForCollectionMember(
    session.user.id,
    collectionSlug,
  );

  if (!data) {
    notFound();
  }

  return (
    <PageContainer>
      <PlantsPageView
        variant="collection"
        collectionSlug={data.collection.slug}
        collectionName={data.collection.name}
        plants={data.plants}
      />
    </PageContainer>
  );
}
