import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCollectionsWithStatsForUser } from "@/lib/collections/memberships";
import { PageContainer } from "@/components/layout/page-container";
import { CollectionsPageView } from "@/components/collections/collections-page-view";
import type { CollectionCardModel } from "@/components/collections/collection-card";

export default async function CollectionsListPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const rows = await getCollectionsWithStatsForUser(session.user.id);
  const collections: CollectionCardModel[] = rows.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description,
    createdAt: c.createdAt.toISOString(),
    memberCount: c.memberCount,
    plantCount: c.plantCount,
    areaCount: c.areaCount,
  }));

  return (
    <PageContainer>
      <CollectionsPageView collections={collections} />
    </PageContainer>
  );
}
