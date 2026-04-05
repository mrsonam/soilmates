"use client";

import { useEffect } from "react";
import { recordRecentCollectionVisit } from "@/lib/recently-viewed";

/** Tracks last-opened collections for cache warming hints (sessionStorage). */
export function RecordCollectionVisit({
  collectionSlug,
}: {
  collectionSlug: string;
}) {
  useEffect(() => {
    recordRecentCollectionVisit(collectionSlug);
  }, [collectionSlug]);
  return null;
}
