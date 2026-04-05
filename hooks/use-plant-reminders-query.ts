"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { ReminderListItem } from "@/lib/reminders/queries";
import {
  mergeServerRemindersWithCache,
  sortRemindersByNextDue,
} from "@/lib/optimistic/reconcile-lists";
import { SEED_QUERY_OPTIONS } from "@/lib/query-cache-policy";
import { queryKeys } from "@/lib/query-keys";

export function usePlantRemindersQuery(
  collectionSlug: string,
  plantSlug: string,
  serverReminders: ReminderListItem[],
) {
  const qc = useQueryClient();
  const key = queryKeys.plant.reminders(collectionSlug, plantSlug);

  useEffect(() => {
    qc.setQueryData(key, (prev) =>
      sortRemindersByNextDue(
        mergeServerRemindersWithCache(
          serverReminders,
          prev as ReminderListItem[] | undefined,
        ),
      ),
    );
  }, [qc, key, serverReminders]);

  return useQuery({
    queryKey: key,
    queryFn: () =>
      qc.getQueryData<ReminderListItem[]>(key) ?? serverReminders,
    ...SEED_QUERY_OPTIONS,
    initialData: serverReminders,
  });
}
