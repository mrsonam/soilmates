import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getActiveMembershipsForUser,
  getFirstCollectionSlugForUser,
} from "@/lib/collections/memberships";
import { PageContainer } from "@/components/layout/page-container";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const memberships = await getActiveMembershipsForUser(session.user.id);
  const primarySlug = await getFirstCollectionSlugForUser(session.user.id);
  const greeting =
    session.user.name?.trim()?.split(" ")[0] ??
    session.user.email?.split("@")[0] ??
    "there";

  return (
    <PageContainer>
      <p className="text-sm text-on-surface-variant">
        Welcome back,{" "}
        <span className="font-medium text-on-surface">{greeting}</span>
      </p>
      <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-on-surface">
        Your plant spaces
      </h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-on-surface-variant">
        Pick up where you left off, or open a collection to manage plants and
        care.
      </p>

      {primarySlug ? (
        <Link
          href={`/collections/${primarySlug}`}
          className="mt-8 inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-on-primary transition hover:bg-primary/90"
        >
          Open primary collection
        </Link>
      ) : (
        <Link
          href="/collections"
          className="mt-8 inline-flex items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-medium text-on-primary transition hover:bg-primary/90"
        >
          Create your first collection
        </Link>
      )}

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl bg-surface-container-low p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Due care
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-on-surface">
            —
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Tasks and reminders will appear here.
          </p>
        </div>
        <div className="rounded-3xl bg-surface-container-low p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Collections
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-on-surface">
            {memberships.length}
          </p>
          <Link
            href="/collections"
            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="rounded-3xl bg-surface-container-low p-6 sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
            Plants
          </p>
          <p className="mt-2 font-display text-2xl font-semibold text-on-surface">
            —
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Count will sync when plants ship.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}
