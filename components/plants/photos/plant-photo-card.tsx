"use client";

import type { PlantGalleryImage } from "@/lib/plants/plant-images";

type PlantPhotoCardProps = {
  image: PlantGalleryImage;
  onOpen: () => void;
};

export function PlantPhotoCard({ image, onOpen }: PlantPhotoCardProps) {
  const when = image.capturedAt ?? image.createdAt;
  const short = new Date(when).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-2xl bg-surface-container-low text-left shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] transition hover:ring-primary/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
    >
      <div className="relative aspect-square w-full overflow-hidden">
        {image.signedUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed URL
          <img
            src={image.signedUrl}
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-surface-container-high text-xs text-on-surface-variant">
            Preview unavailable
          </div>
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent pt-10" />
        <span className="absolute bottom-2 left-2 rounded-lg bg-white/90 px-2 py-0.5 text-[0.65rem] font-semibold tabular-nums text-on-surface shadow-sm backdrop-blur-sm">
          {short}
        </span>
        {image.isPrimary ? (
          <span className="absolute left-2 top-2 rounded-lg bg-primary/90 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-white shadow-sm">
            Cover
          </span>
        ) : (
          <span className="absolute left-2 top-2 rounded-lg bg-black/40 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-white/95 backdrop-blur-sm">
            {image.imageType === "progress" ? "Progress" : image.imageType}
          </span>
        )}
      </div>
    </button>
  );
}
