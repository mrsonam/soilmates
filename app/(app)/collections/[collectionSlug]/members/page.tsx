import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { CollectionSectionTabs } from "@/components/collections/collection-section-tabs";
import { PlantsScreenHeader } from "@/components/plants/plants-screen-header";
import { getCollectionMembersAndInvites } from "@/lib/collections/invites-queries";
import { CollectionMembersClient } from "@/components/members/collection-members-client";

type Props = {
  params: Promise<{ collectionSlug: string }>;
};

export default async function CollectionMembersPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug } = await params;
  const data = await getCollectionMembersAndInvites(
    session.user.id,
    collectionSlug,
  );

  if (!data) {
    notFound();
  }

  return (
    <PageContainer>
      <CollectionSectionTabs
        collectionSlug={data.slug}
        className="mb-8"
      />
      <PlantsScreenHeader
        eyebrow={data.name}
        title="Members"
        description="People who share this plant space"
      />

      <div className="mt-10">
        <CollectionMembersClient
          collectionSlug={data.slug}
          currentUserId={session.user.id}
          members={data.members}
          pendingInvites={data.pendingInvites}
        />
      </div>
    </PageContainer>
  );
}
