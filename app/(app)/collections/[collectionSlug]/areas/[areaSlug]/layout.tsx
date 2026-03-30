import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getCollectionDetailForActiveMember } from "@/lib/collections/collection-detail";
import { getAreaForActiveMemberBySlugs } from "@/lib/collections/access";
import { AreaHeaderSync } from "@/components/areas/area-header-sync";

type Props = {
  children: ReactNode;
  params: Promise<{ collectionSlug: string; areaSlug: string }>;
};

export default async function AreaDetailLayout({ children, params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug, areaSlug } = await params;
  const [area, collectionDetail] = await Promise.all([
    getAreaForActiveMemberBySlugs(session.user.id, collectionSlug, areaSlug),
    getCollectionDetailForActiveMember(session.user.id, collectionSlug),
  ]);

  if (!area || !collectionDetail) {
    notFound();
  }

  const plantCount = area._count.plants;
  const tagline =
    area.description?.trim() ||
    `${plantCount} ${plantCount === 1 ? "plant" : "plants"} in this area`;

  return (
    <>
      <AreaHeaderSync
        collectionName={collectionDetail.name}
        areaName={area.name}
        tagline={tagline}
      />
      {children}
    </>
  );
}
