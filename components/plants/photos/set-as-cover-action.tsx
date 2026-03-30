"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { setPlantCoverImageAction } from "@/app/(app)/collections/[collectionSlug]/plants/plant-image-actions";

type SetAsCoverActionProps = {
  collectionSlug: string;
  plantSlug: string;
  imageId: string;
  disabled?: boolean;
  className?: string;
};

export function SetAsCoverAction({
  collectionSlug,
  plantSlug,
  imageId,
  disabled,
  className,
}: SetAsCoverActionProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={disabled || pending}
      onClick={() => {
        startTransition(async () => {
          const r = await setPlantCoverImageAction({
            collectionSlug,
            plantSlug,
            imageId,
          });
          if (r.ok) router.refresh();
        });
      }}
      className={
        className ??
        "inline-flex items-center gap-1.5 rounded-full bg-primary/90 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary disabled:opacity-50"
      }
    >
      <Sparkles className="size-3.5" strokeWidth={1.75} aria-hidden />
      {pending ? "Updating…" : "Set as cover"}
    </button>
  );
}
