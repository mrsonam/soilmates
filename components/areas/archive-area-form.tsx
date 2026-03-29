"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { archiveAreaAction } from "@/app/(app)/collections/[collectionSlug]/area-actions";
import { areaMutationFormInitialState } from "@/app/(app)/collections/[collectionSlug]/area-form-state";

type ArchiveAreaFormProps = {
  collectionSlug: string;
  areaId: string;
  areaName: string;
  onDone: () => void;
};

export function ArchiveAreaForm({
  collectionSlug,
  areaId,
  areaName,
  onDone,
}: ArchiveAreaFormProps) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    archiveAreaAction,
    areaMutationFormInitialState,
  );

  useEffect(() => {
    if (state.success) {
      onDone();
      router.refresh();
    }
  }, [state.success, onDone, router]);

  return (
    <form
      action={formAction}
      className="w-full text-left"
      onSubmit={(e) => {
        if (
          !confirm(
            `Archive “${areaName}”? It will be hidden from the list. You can’t archive while active plants are still in this area.`,
          )
        ) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="collectionSlug" value={collectionSlug} />
      <input type="hidden" name="areaId" value={areaId} />
      {state.error && (
        <p className="mb-2 rounded-lg bg-surface-container-low px-2 py-1.5 text-xs text-on-surface-variant">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface disabled:opacity-50"
      >
        <Archive className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
        {pending ? "Archiving…" : "Archive area"}
      </button>
    </form>
  );
}
