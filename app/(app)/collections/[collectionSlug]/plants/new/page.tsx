import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import {
  getGlobalPlantCreateDependencies,
  getPlantCreateDependencies,
} from "@/lib/plants/queries";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";
import { PageContainer } from "@/components/layout/page-container";
import { CollectionSectionTabs } from "@/components/collections/collection-section-tabs";
import { CreatePlantForm } from "@/components/plants/create-plant-form";

type Props = {
  params: Promise<{ collectionSlug: string }>;
};

export default async function NewPlantPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug } = await params;
  const [deps, globalPlacement] = await Promise.all([
    getPlantCreateDependencies(session.user.id, collectionSlug),
    getGlobalPlantCreateDependencies(session.user.id),
  ]);

  if (!deps) {
    notFound();
  }

  if (deps.areas.length === 0) {
    return (
      <PageContainer>
        <CollectionSectionTabs collectionSlug={collectionSlug} className="mb-8" />
        <div className="mx-auto max-w-lg rounded-3xl bg-surface-container-low/70 px-6 py-12 text-center ring-1 ring-outline-variant/10 sm:px-10">
          <h2 className="font-display text-xl font-semibold text-on-surface">
            Add an area first
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            Plants need a placement area in this collection. Create a space
            like Living room or Balcony, then come back to add your plant.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href={`/collections/${collectionSlug}`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary/90"
            >
              Back to collection
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  const placement =
    globalPlacement &&
    globalPlacement.collections.length > 0 &&
    globalPlacement.areasByCollectionSlug
      ? {
          placementCollections: globalPlacement.collections,
          placementAreasByCollectionSlug: globalPlacement.areasByCollectionSlug,
        }
      : null;

  return (
    <PageContainer>
      <CreatePlantForm
        collectionSlug={deps.collection.slug}
        collectionName={deps.collection.name}
        areas={deps.areas}
        uploadsEnabled={isSupabaseStorageConfigured()}
        {...placement}
      />
    </PageContainer>
  );
}
