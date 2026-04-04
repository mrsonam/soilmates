"use client";

import { useCallback, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { patchPlantSimpleAction } from "@/app/(app)/collections/[collectionSlug]/plants/plant-patch-actions";
import { SyncEntityType, SyncOperationType } from "@/lib/sync/operation-types";
import { runOrEnqueueMutation } from "@/lib/sync/run-or-enqueue";

type PlantFavoriteToggleProps = {
  collectionSlug: string;
  plantSlug: string;
  initialFavorite: boolean;
  /** Large control on plant detail cover vs compact on grid cards */
  variant?: "hero" | "card";
  className?: string;
};

export function PlantFavoriteToggle({
  collectionSlug,
  plantSlug,
  initialFavorite,
  variant = "hero",
  className = "",
}: PlantFavoriteToggleProps) {
  const router = useRouter();
  const [favorite, setFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setFavorite(initialFavorite);
  }, [initialFavorite]);

  const toggle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const next = !favorite;
      setFavorite(next);
      startTransition(async () => {
        const res = await runOrEnqueueMutation({
          operationType: SyncOperationType.PLANT_PATCH_SIMPLE,
          entityType: SyncEntityType.PLANT,
          entityId: plantSlug,
          payload: {
            collectionSlug,
            plantSlug,
            isFavorite: next,
          },
          execute: () =>
            patchPlantSimpleAction({
              collectionSlug,
              plantSlug,
              isFavorite: next,
            }),
        });
        if (!res.ok) {
          setFavorite(!next);
          return;
        }
        try {
          router.refresh();
        } catch {
          /* ignore */
        }
      });
    },
    [collectionSlug, plantSlug, favorite, router],
  );

  const isHero = variant === "hero";

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-pressed={favorite}
      aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
      title={favorite ? "Remove from favorites" : "Add to favorites"}
      className={[
        isHero
          ? [
              "flex size-10 items-center justify-center rounded-full shadow-md ring-2 ring-surface/90 transition",
              favorite
                ? "bg-[#c45c5c] text-white"
                : "bg-surface/90 text-on-surface-variant backdrop-blur-sm ring-outline-variant/20 hover:text-primary",
            ].join(" ")
          : [
              "flex size-8 shrink-0 items-center justify-center rounded-full shadow-sm ring-1 ring-outline-variant/10 backdrop-blur-sm transition",
              favorite
                ? "bg-primary/15 text-primary"
                : "bg-surface/90 text-on-surface-variant hover:text-primary",
            ].join(" "),
        pending ? "opacity-70" : "",
        className,
      ].join(" ")}
    >
      <Heart
        className={[
          isHero ? "size-5" : "size-4",
          favorite && isHero ? "fill-white/25" : "",
          favorite && !isHero ? "fill-primary/30" : "",
        ].join(" ")}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="sr-only">
        {favorite ? "Favorite plant" : "Add plant to favorites"}
      </span>
    </button>
  );
}
