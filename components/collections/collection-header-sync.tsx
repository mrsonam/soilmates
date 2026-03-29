"use client";

import { useEffect } from "react";
import { useCollectionHeaderDispatch } from "@/components/layout/collection-header-context";

type CollectionHeaderSyncProps = {
  subtitleLine: string;
  showCollectionSearch?: boolean;
};

/**
 * Registers collection-specific header copy while this route is mounted.
 */
export function CollectionHeaderSync({
  subtitleLine,
  showCollectionSearch = true,
}: CollectionHeaderSyncProps) {
  const { setCollectionHeader, resetCollectionHeader } =
    useCollectionHeaderDispatch() ?? {};

  useEffect(() => {
    if (!setCollectionHeader || !resetCollectionHeader) return;
    setCollectionHeader({
      subtitleLine,
      showCollectionSearch,
    });
    return () => {
      resetCollectionHeader();
    };
  }, [
    resetCollectionHeader,
    setCollectionHeader,
    subtitleLine,
    showCollectionSearch,
  ]);

  return null;
}
