import type { ReactNode } from "react";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import {
  collectionHeaderSubtitleLine,
  getCollectionDetailForActiveMember,
} from "@/lib/collections/collection-detail";
import { CollectionHeaderSync } from "@/components/collections/collection-header-sync";

type Props = {
  children: ReactNode;
  params: Promise<{ collectionSlug: string }>;
};

export default async function CollectionSlugLayout({ children, params }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug } = await params;
  const detail = await getCollectionDetailForActiveMember(
    session.user.id,
    collectionSlug,
  );

  if (!detail) {
    notFound();
  }

  const subtitleLine = collectionHeaderSubtitleLine(
    detail.description,
    detail.plantCount,
  );

  return (
    <>
      <CollectionHeaderSync subtitleLine={subtitleLine} />
      {children}
    </>
  );
}
