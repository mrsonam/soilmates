"use client";

import { useEffect } from "react";
import { useCollectionHeaderDispatch } from "@/components/layout/collection-header-context";

type AreaHeaderSyncProps = {
  collectionName: string;
  areaName: string;
  tagline: string | null;
};

/**
 * Registers area detail header copy for the app shell (same pattern as collection
 * detail, without breadcrumb in the page body).
 */
export function AreaHeaderSync({
  collectionName,
  areaName,
  tagline,
}: AreaHeaderSyncProps) {
  const { setCollectionHeader } = useCollectionHeaderDispatch() ?? {};

  useEffect(() => {
    if (!setCollectionHeader) return;
    setCollectionHeader({
      areaHeader: {
        eyebrow: collectionName,
        title: areaName,
        tagline,
      },
      showCollectionSearch: false,
    });
    return () => {
      setCollectionHeader({ areaHeader: null });
    };
  }, [setCollectionHeader, collectionName, areaName, tagline]);

  return null;
}
