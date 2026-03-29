"use client";

import { useCallback } from "react";
import type { CollectionCardModel } from "./collection-card";
import { CollectionsGrid } from "./collections-grid";
import { CollectionsEmptyState } from "./collections-empty-state";
import { useCollectionsCreate } from "@/components/layout/collections-create-provider";

type CollectionsPageViewProps = {
  collections: CollectionCardModel[];
};

export function CollectionsPageView({ collections }: CollectionsPageViewProps) {
  const ctx = useCollectionsCreate();
  const openCreate = useCallback(() => {
    ctx?.openCreateCollection();
  }, [ctx]);

  return (
    <>
      {collections.length === 0 ? (
        <CollectionsEmptyState onCreateClick={openCreate} />
      ) : (
        <CollectionsGrid collections={collections} onAddCollection={openCreate} />
      )}
    </>
  );
}
