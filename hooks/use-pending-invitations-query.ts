"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { InvitationCardData } from "@/components/invitations/invitation-card";
import { SEED_QUERY_OPTIONS } from "@/lib/query-cache-policy";
import { queryKeys } from "@/lib/query-keys";

export function usePendingInvitationsQuery(
  serverInvites: InvitationCardData[],
) {
  const qc = useQueryClient();
  const key = queryKeys.invitations.pending();

  useEffect(() => {
    qc.setQueryData(key, serverInvites);
  }, [qc, key, serverInvites]);

  return useQuery({
    queryKey: key,
    queryFn: () =>
      qc.getQueryData<InvitationCardData[]>(key) ?? serverInvites,
    ...SEED_QUERY_OPTIONS,
    initialData: serverInvites,
  });
}
