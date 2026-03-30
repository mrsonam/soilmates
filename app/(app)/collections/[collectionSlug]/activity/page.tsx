import Link from "next/link";
import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getCollectionDetailForActiveMember } from "@/lib/collections/collection-detail";
import { getCollectionActivityForMember } from "@/lib/activity/queries";
import { PageContainer } from "@/components/layout/page-container";
import { ActivityFeed } from "@/components/activity/activity-feed";

type Props = {
  params: Promise<{ collectionSlug: string }>;
};

export default async function CollectionActivityPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug } = await params;

  const [detail, items] = await Promise.all([
    getCollectionDetailForActiveMember(session.user.id, collectionSlug),
    getCollectionActivityForMember(session.user.id, collectionSlug, 80),
  ]);

  if (!detail) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/collections/${collectionSlug}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to collection
        </Link>
        <h1 className="mt-4 font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-[2rem]">
          {detail.name}
        </h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          Activity in this space
        </p>
        <div className="mt-10">
          <ActivityFeed items={items} showCollectionChip={false} />
        </div>
      </div>
    </PageContainer>
  );
}
