import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getAreaForActiveMemberBySlugs } from "@/lib/collections/access";
import { PageContainer } from "@/components/layout/page-container";
import { MapPin, Sprout } from "lucide-react";

type Props = {
  params: Promise<{ collectionSlug: string; areaSlug: string }>;
};

export default async function AreaDetailPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug, areaSlug } = await params;
  const area = await getAreaForActiveMemberBySlugs(
    session.user.id,
    collectionSlug,
    areaSlug,
  );

  if (!area) {
    notFound();
  }

  const plantCount = area._count.plants;

  return (
    <PageContainer>
      <nav className="text-sm text-on-surface-variant">
        <Link
          href={`/collections/${collectionSlug}`}
          className="font-medium text-primary hover:underline"
        >
          Collection
        </Link>
        <span className="mx-2 text-on-surface-variant/50">/</span>
        <span className="text-on-surface">Areas</span>
        <span className="mx-2 text-on-surface-variant/50">/</span>
        <span className="text-on-surface">{area.name}</span>
      </nav>

      <div className="mt-8 rounded-3xl bg-surface-container-low p-8 ring-1 ring-outline-variant/[0.08] sm:p-10">
        <div className="flex items-center gap-3 text-primary">
          <MapPin className="size-6" strokeWidth={1.75} aria-hidden />
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            Area
          </p>
        </div>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-on-surface">
          {area.name}
        </h1>
        <p className="mt-1 font-mono text-sm text-on-surface-variant">
          /{collectionSlug}/areas/{area.slug}
        </p>
        {area.description ? (
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            {area.description}
          </p>
        ) : null}

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-primary-fixed/40 px-4 py-2 text-sm font-medium text-primary">
          <Sprout className="size-4" strokeWidth={1.75} aria-hidden />
          {plantCount} {plantCount === 1 ? "plant" : "plants"} in this area
        </div>

        <p className="mt-10 max-w-xl text-sm leading-relaxed text-on-surface-variant">
          Plant list, care schedule, and environment notes for this space will
          live here. Use the collection&apos;s Plants tab when the catalog is
          ready.
        </p>

        <Link
          href={`/collections/${collectionSlug}`}
          className="mt-8 inline-flex text-sm font-medium text-primary hover:underline"
        >
          ← Back to collection
        </Link>
      </div>
    </PageContainer>
  );
}
