import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getGlobalPlantCreateDependencies } from "@/lib/plants/queries";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";
import { PageContainer } from "@/components/layout/page-container";
import { CreatePlantForm } from "@/components/plants/create-plant-form";

export default async function GlobalNewPlantPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const deps = await getGlobalPlantCreateDependencies(session.user.id);

  if (!deps) {
    return (
      <PageContainer>
        <div className="mx-auto max-w-lg rounded-3xl bg-surface-container-low/70 px-6 py-12 text-center ring-1 ring-outline-variant/10 sm:px-10">
          <h2 className="font-display text-xl font-semibold text-on-surface">
            Add an area first
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
            Plants need a placement area in a collection. Open a collection and
            create a space (e.g. Living room), then come back here to add your
            plant.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/collections"
              className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary/90"
            >
              Go to collections
            </Link>
            <Link
              href="/plants"
              className="inline-flex h-11 items-center justify-center rounded-full bg-surface-container-high px-6 text-sm font-medium text-on-surface ring-1 ring-outline-variant/15 transition hover:bg-surface-container-high/80"
            >
              Back to plants
            </Link>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <CreatePlantForm
        mode="global"
        collections={deps.collections}
        areasByCollectionSlug={deps.areasByCollectionSlug}
        uploadsEnabled={isSupabaseStorageConfigured()}
      />
    </PageContainer>
  );
}
