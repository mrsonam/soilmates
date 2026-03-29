import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveMembershipsForUser } from "@/lib/collections/memberships";
import { PageContainer } from "@/components/layout/page-container";

export default async function CollectionsListPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const memberships = await getActiveMembershipsForUser(session.user.id);
  if (memberships.length === 0) {
    redirect("/onboarding/collections");
  }

  return (
    <PageContainer narrow>
      <p className="text-sm text-on-surface-variant">Your shared spaces</p>
      <h2 className="mt-1 font-display text-xl font-semibold text-on-surface">
        Collections
      </h2>
      <ul className="mt-8 space-y-3">
        {memberships.map((m) => (
          <li key={m.collection.id}>
            <Link
              href={`/collections/${m.collection.slug}`}
              className="block rounded-2xl bg-surface-container-low px-5 py-4 text-on-surface transition hover:bg-surface-container-high"
            >
              <span className="font-medium">{m.collection.name}</span>
              <span className="mt-0.5 block font-mono text-xs text-on-surface-variant">
                /{m.collection.slug}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </PageContainer>
  );
}
