"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import type { PlantGalleryImage } from "@/lib/plants/plant-images";
import { deletePlantImageAction } from "@/app/(app)/collections/[collectionSlug]/plants/plant-image-actions";
import { PhotoEmptyState } from "./photo-empty-state";
import { PhotoLightbox } from "./photo-lightbox";
import { PlantPhotoTimeline } from "./plant-photo-timeline";
import { PlantPhotoUploader } from "./plant-photo-uploader";
import { SetAsCoverAction } from "./set-as-cover-action";

type PlantPhotoGalleryProps = {
  collectionSlug: string;
  plantSlug: string;
  plantNickname: string;
  images: PlantGalleryImage[];
  uploadsEnabled: boolean;
  variant?: "tab" | "full";
  /** Deep-link to plant Assistant tab (photo check-in section). */
  diagnosisHref?: string;
};

export function PlantPhotoGallery({
  collectionSlug,
  plantSlug,
  plantNickname,
  images,
  uploadsEnabled,
  variant = "full",
  diagnosisHref,
}: PlantPhotoGalleryProps) {
  const router = useRouter();
  const [lightbox, setLightbox] = useState<PlantGalleryImage | null>(null);
  const [delPending, startDel] = useTransition();

  const previewLimit = variant === "tab" ? 8 : undefined;
  const galleryHref = `/collections/${collectionSlug}/plants/${plantSlug}/photos`;

  function deleteActive() {
    if (!lightbox) return;
    startDel(async () => {
      const r = await deletePlantImageAction({
        collectionSlug,
        plantSlug,
        imageId: lightbox.id,
      });
      if (r.ok) {
        setLightbox(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-8">
      {variant === "full" ? (
        <header className="space-y-2">
          <h2 className="font-display text-xl font-semibold tracking-tight text-on-surface sm:text-2xl">
            Growth gallery
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            A calm visual history of {plantNickname} — cover photo, progress
            shots, and room to grow into diagnosis and care attachments later.
          </p>
        </header>
      ) : (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed text-on-surface-variant">
            Track how {plantNickname} grows over time. Open the full gallery for
            the complete timeline.
          </p>
          {diagnosisHref && images.length > 0 ? (
            <Link
              href={diagnosisHref}
              className="inline-flex text-sm font-semibold text-primary underline-offset-4 hover:underline"
            >
              Use these photos for a plant check-in
            </Link>
          ) : null}
        </div>
      )}

      {images.length === 0 ? (
        <PhotoEmptyState plantNickname={plantNickname}>
          <div className="mx-auto max-w-xl">
            <PlantPhotoUploader
              collectionSlug={collectionSlug}
              plantSlug={plantSlug}
              uploadsEnabled={uploadsEnabled}
            />
          </div>
        </PhotoEmptyState>
      ) : (
        <>
          <div className="rounded-3xl bg-surface-container-lowest/80 p-4 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-6">
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
              Add photos
            </p>
            <div className="mt-3">
              <PlantPhotoUploader
                collectionSlug={collectionSlug}
                plantSlug={plantSlug}
                uploadsEnabled={uploadsEnabled}
              />
            </div>
          </div>
          <PlantPhotoTimeline
            images={images}
            onOpen={setLightbox}
            maxCards={previewLimit}
          />
          {variant === "tab" ? (
            <div className="flex justify-center">
              <Link
                href={galleryHref}
                className="inline-flex rounded-full bg-primary/10 px-5 py-2.5 text-sm font-semibold text-primary ring-1 ring-primary/20 transition hover:bg-primary/15"
              >
                {images.length > (previewLimit ?? 0)
                  ? "View full photo history"
                  : "Open full gallery"}
              </Link>
            </div>
          ) : null}
        </>
      )}

      <PhotoLightbox
        image={lightbox}
        onClose={() => setLightbox(null)}
        footer={
          lightbox ? (
            <>
              {!lightbox.isPrimary ? (
                <SetAsCoverAction
                  collectionSlug={collectionSlug}
                  plantSlug={plantSlug}
                  imageId={lightbox.id}
                />
              ) : null}
              <button
                type="button"
                disabled={delPending}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteActive();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-500/15 disabled:opacity-50 dark:text-red-300"
              >
                <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden />
                {delPending ? "Removing…" : "Delete"}
              </button>
            </>
          ) : null
        }
      />
    </div>
  );
}
