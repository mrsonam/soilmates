import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getFirstCollectionSlugForUser } from "@/lib/collections/memberships";
import {
  getAllPlantsForActiveMember,
  getGlobalPlantCreateDependencies,
} from "@/lib/plants/queries";
import { PageContainer } from "@/components/layout/page-container";
import { PlantsPageView } from "@/components/plants/plants-page-view";

export default async function PlantsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const [plants, globalCreateDeps, firstSlug] = await Promise.all([
    getAllPlantsForActiveMember(userId),
    getGlobalPlantCreateDependencies(userId),
    getFirstCollectionSlugForUser(userId),
  ]);

  const hasCollections = firstSlug !== null;
  const addPlantHref = globalCreateDeps
    ? "/plants/new"
    : firstSlug
      ? `/collections/${firstSlug}/plants/new`
      : "/collections";

  return (
    <PageContainer>
      <PlantsPageView
        variant="all"
        plants={plants}
        addPlantHref={addPlantHref}
        hasCollections={hasCollections}
      />
    </PageContainer>
  );
}
