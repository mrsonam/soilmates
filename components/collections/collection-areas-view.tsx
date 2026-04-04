"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCollectionPageActions } from "@/components/layout/collection-page-actions";
import { AreasSection } from "@/components/areas/areas-section";
import { CreateAreaDialog } from "@/components/areas/create-area-dialog";
import { EditAreaDialog } from "@/components/areas/edit-area-dialog";
import { CollectionSectionTabs } from "@/components/collections/collection-section-tabs";
import type { AreaForCollectionDetail } from "@/lib/collections/collection-detail";

type CollectionAreasViewProps = {
  collectionSlug: string;
  areas: AreaForCollectionDetail[];
  uploadsEnabled: boolean;
};

export function CollectionAreasView({
  collectionSlug,
  areas,
  uploadsEnabled,
}: CollectionAreasViewProps) {
  const searchParams = useSearchParams();
  const pageActions = useCollectionPageActions();
  const openedCreateFromQuery = useRef(false);
  const [createAreaOpen, setCreateAreaOpen] = useState(false);
  const [editArea, setEditArea] = useState<AreaForCollectionDetail | null>(null);

  const openCreateArea = useCallback(() => setCreateAreaOpen(true), []);

  useEffect(() => {
    pageActions?.registerCreateAreaHandler(openCreateArea);
    return () => pageActions?.registerCreateAreaHandler(null);
  }, [openCreateArea, pageActions]);

  useEffect(() => {
    if (openedCreateFromQuery.current) return;
    const q = searchParams.get("create");
    if (q === "1" || q === "true") {
      openedCreateFromQuery.current = true;
      setCreateAreaOpen(true);
    }
  }, [searchParams]);

  return (
    <div>
      <CollectionSectionTabs collectionSlug={collectionSlug} className="mb-8" />
      <AreasSection
        collectionSlug={collectionSlug}
        areas={areas}
        onCreateClick={openCreateArea}
        onEditArea={setEditArea}
      />
      <CreateAreaDialog
        open={createAreaOpen}
        onClose={() => setCreateAreaOpen(false)}
        collectionSlug={collectionSlug}
        uploadsEnabled={uploadsEnabled}
      />
      <EditAreaDialog
        open={editArea !== null}
        onClose={() => setEditArea(null)}
        collectionSlug={collectionSlug}
        area={editArea}
        uploadsEnabled={uploadsEnabled}
      />
    </div>
  );
}
