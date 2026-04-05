"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  acceptCollectionInvite,
  declineCollectionInvite,
} from "@/app/actions/collection-invites";
import type { InvitationCardData } from "@/components/invitations/invitation-card";
import { queryKeys } from "@/lib/query-keys";

export function useAcceptInvitationMutation() {
  const qc = useQueryClient();
  const router = useRouter();
  const key = queryKeys.invitations.pending();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const r = await acceptCollectionInvite(inviteId);
      if (!r.ok) throw new Error(r.error);
      return r;
    },
    onMutate: async (inviteId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<InvitationCardData[]>(key);
      qc.setQueryData(key, (old: InvitationCardData[] | undefined) =>
        (old ?? []).filter((i) => i.id !== inviteId),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      }
    },
    onSuccess: (data) => {
      router.push(`/collections/${data.collectionSlug}`);
    },
    onSettled: () => {
      router.refresh();
    },
  });
}

export function useDeclineInvitationMutation() {
  const qc = useQueryClient();
  const router = useRouter();
  const key = queryKeys.invitations.pending();

  return useMutation({
    mutationFn: async (inviteId: string) => {
      const r = await declineCollectionInvite(inviteId);
      if (!r.ok) throw new Error(r.error);
      return r;
    },
    onMutate: async (inviteId) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData<InvitationCardData[]>(key);
      qc.setQueryData(key, (old: InvitationCardData[] | undefined) =>
        (old ?? []).filter((i) => i.id !== inviteId),
      );
      return { previous };
    },
    onError: (_e, _id, ctx) => {
      if (ctx?.previous !== undefined) {
        qc.setQueryData(key, ctx.previous);
      }
    },
    onSettled: () => {
      router.refresh();
    },
  });
}
