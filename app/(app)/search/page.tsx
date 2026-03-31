import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveMembershipsForUser } from "@/lib/collections/memberships";
import { parseSearchFilters } from "@/lib/search/params";
import { searchGlobalForUser } from "@/lib/search/global";
import { PageContainer } from "@/components/layout/page-container";
import { SearchInput } from "@/components/search/search-input";
import { SearchFilters } from "@/components/search/search-filters";
import { SearchResults } from "@/components/search/search-results";
import { SearchEmptyState } from "@/components/search/search-empty-state";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sp = await searchParams;
  const filters = parseSearchFilters({
    q: typeof sp.q === "string" ? sp.q : undefined,
    type: typeof sp.type === "string" ? sp.type : undefined,
    collection: typeof sp.collection === "string" ? sp.collection : undefined,
    plantHealth: typeof sp.plantHealth === "string" ? sp.plantHealth : undefined,
    plantStage: typeof sp.plantStage === "string" ? sp.plantStage : undefined,
    reminderStatus:
      typeof sp.reminderStatus === "string" ? sp.reminderStatus : undefined,
    careAction: typeof sp.careAction === "string" ? sp.careAction : undefined,
  });

  const memberships = await getActiveMembershipsForUser(session.user.id);
  const collectionOptions = memberships.map((m) => ({
    id: m.collection.id,
    slug: m.collection.slug,
    name: m.collection.name,
  }));

  const results = await searchGlobalForUser(
    session.user.id,
    collectionOptions,
    filters,
    8,
  );

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
          Navigate
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-[2rem]">
          Search
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-on-surface-variant">
          Find plants, spaces, care history, reminders, photos, and activity.
        </p>

        <div className="mt-6">
          <SearchInput initialQuery={filters.q ?? ""} />
        </div>

        <div className="mt-4">
          <SearchFilters
            collections={collectionOptions}
            activeFilters={results.filters}
            counts={results.counts}
          />
        </div>

        <div className="mt-8">
          {filters.q ? (
            results.counts.total > 0 ? (
              <SearchResults results={results} />
            ) : (
              <SearchEmptyState
                variant="no_results"
                query={filters.q}
              />
            )
          ) : (
            <SearchEmptyState variant="no_query" />
          )}
        </div>
      </div>
    </PageContainer>
  );
}

