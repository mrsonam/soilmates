import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveMembershipsForUser } from "@/lib/collections/memberships";
import { getRecentActivityForUser } from "@/lib/activity/queries";
import { PageContainer } from "@/components/layout/page-container";
import { ActivityFeed } from "@/components/activity/activity-feed";
import { ActivityFilterChips } from "@/components/activity/activity-filter-chips";

type Props = {
  searchParams: Promise<{ collection?: string }>;
};

export default async function ActivityPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sp = await searchParams;
  const collectionParam = sp.collection?.trim() ?? null;

  const [memberships, allItems] = await Promise.all([
    getActiveMembershipsForUser(session.user.id),
    getRecentActivityForUser(session.user.id, 80),
  ]);

  const collectionOptions = memberships.map((m) => ({
    slug: m.collection.slug,
    name: m.collection.name,
  }));

  const activeSlug =
    collectionParam &&
    collectionOptions.some((c) => c.slug === collectionParam)
      ? collectionParam
      : null;

  const items = activeSlug
    ? allItems.filter((i) => i.collection.slug === activeSlug)
    : allItems;

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
          Collaboration
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-[2rem]">
          Activity
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-on-surface-variant">
          Recent updates across your plant spaces
        </p>

        {collectionOptions.length > 0 ? (
          <div className="mt-8">
            <ActivityFilterChips
              collections={collectionOptions}
              activeSlug={activeSlug}
            />
          </div>
        ) : null}

        <div className="mt-10">
          <ActivityFeed items={items} showCollectionChip={!activeSlug} />
        </div>

        {items.length > 0 ? (
          <p className="mt-10 text-center text-xs text-on-surface-variant">
            Showing recent updates.{" "}
            <Link
              href="/collections"
              className="font-medium text-primary hover:underline"
            >
              Open a collection
            </Link>{" "}
            to add plants and care.
          </p>
        ) : null}
      </div>
    </PageContainer>
  );
}
