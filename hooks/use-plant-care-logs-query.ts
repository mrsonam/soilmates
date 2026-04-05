"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { CareLogListItem } from "@/lib/plants/care-logs";
import {
  mergeServerCareLogsWithCache,
  sortCareLogsNewestFirst,
} from "@/lib/optimistic/reconcile-lists";
import { SEED_QUERY_OPTIONS } from "@/lib/query-cache-policy";
import { queryKeys } from "@/lib/query-keys";

export function usePlantCareLogsQuery(
  collectionSlug: string,
  plantSlug: string,
  serverLogs: CareLogListItem[],
) {
  const qc = useQueryClient();
  const key = queryKeys.plant.careLogs(collectionSlug, plantSlug);

  useEffect(() => {
    qc.setQueryData(key, (prev) =>
      sortCareLogsNewestFirst(
        mergeServerCareLogsWithCache(
          serverLogs,
          prev as CareLogListItem[] | undefined,
        ),
      ),
    );
  }, [qc, key, serverLogs]);

  return useQuery({
    queryKey: key,
    queryFn: () =>
      qc.getQueryData<CareLogListItem[]>(key) ?? serverLogs,
    ...SEED_QUERY_OPTIONS,
    initialData: serverLogs,
  });
}
