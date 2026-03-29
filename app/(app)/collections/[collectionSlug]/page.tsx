import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { assertUserCanAccessCollection } from "@/lib/collections/memberships";
import { PageContainer } from "@/components/layout/page-container";

type Props = {
  params: Promise<{ collectionSlug: string }>;
};

export default async function CollectionHomePage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug } = await params;
  const collection = await assertUserCanAccessCollection(
    session.user.id,
    collectionSlug,
  );

  if (!collection) {
    notFound();
  }

  return (
    <PageContainer>
      <p className="text-sm leading-relaxed text-on-surface-variant">
        Plants, areas, and care will live here. You&apos;re in{" "}
        <span className="font-medium text-on-surface">{collection.name}</span>.
      </p>
      <section className="mt-10 rounded-3xl bg-surface-container-low p-8 text-center">
        <p className="text-sm text-on-surface-variant">
          Collection home ·{" "}
          <span className="font-mono text-on-surface">/{collection.slug}</span>
        </p>
        <Link
          href="/collections"
          className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
        >
          All collections
        </Link>
      </section>
    </PageContainer>
  );
}
