"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Prefetch sibling plant routes (tabs / deep links) during idle time so first
 * navigation to history, photos, or reminders feels instant.
 */
export function PlantDetailRoutePrefetch({
  collectionSlug,
  plantSlug,
}: {
  collectionSlug: string;
  plantSlug: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const base = `/collections/${collectionSlug}/plants/${plantSlug}`;
    const urls = [
      `${base}/history`,
      `${base}/photos`,
      `${base}/reminders`,
      `${base}/assistant`,
    ];

    const run = () => {
      for (const u of urls) {
        try {
          router.prefetch(u);
        } catch {
          /* ignore */
        }
      }
    };

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    if (typeof requestIdleCallback !== "undefined") {
      idleId = requestIdleCallback(run, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(run, 400);
    }

    return () => {
      if (idleId !== undefined && typeof cancelIdleCallback !== "undefined") {
        cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [router, collectionSlug, plantSlug]);

  return null;
}
