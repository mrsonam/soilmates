"use client";

import Image from "next/image";
import type { PlantGalleryImage } from "@/lib/plants/plant-images";

type Props = {
  images: PlantGalleryImage[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxSelect?: number;
  /** Horizontal scroll row for compact layouts (e.g. assistant composer). */
  layout?: "grid" | "strip";
};

export function DiagnosisImageSelector({
  images,
  selectedIds,
  onToggle,
  maxSelect = 6,
  layout = "grid",
}: Props) {
  const set = new Set(selectedIds);
  const strip = layout === "strip";

  return (
    <div className={strip ? "space-y-2" : "space-y-3"}>
      <p
        className={
          strip
            ? "text-xs text-on-surface-variant"
            : "text-sm text-on-surface-variant"
        }
      >
        {strip ? (
          <>
            Photos for review ({selectedIds.length}/{maxSelect})
          </>
        ) : (
          <>
            Choose one or more photos ({selectedIds.length}/{maxSelect}{" "}
            selected).
          </>
        )}
      </p>
      <div
        className={
          strip
            ? "flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]"
            : "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
        }
      >
        {images.map((img) => {
          const selected = set.has(img.id);
          const disabled = !selected && selectedIds.length >= maxSelect;
          return (
            <button
              key={img.id}
              type="button"
              disabled={disabled}
              onClick={() => onToggle(img.id)}
              className={[
                "group relative overflow-hidden rounded-2xl ring-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                strip
                  ? "aspect-square w-[4.5rem] shrink-0 snap-start sm:w-24"
                  : "aspect-square",
                selected
                  ? "ring-primary"
                  : "ring-transparent hover:ring-outline-variant/30",
                disabled ? "cursor-not-allowed opacity-40" : "",
              ].join(" ")}
            >
              {img.signedUrl ? (
                <Image
                  src={img.signedUrl}
                  alt=""
                  fill
                  className="object-cover transition group-hover:scale-[1.02]"
                  sizes={
                    strip
                      ? "96px"
                      : "(max-width: 640px) 45vw, 180px"
                  }
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-surface-container-high/60 text-xs text-on-surface-variant">
                  Preview unavailable
                </div>
              )}
              <span
                className={[
                  "absolute right-2 top-2 flex size-7 items-center justify-center rounded-full text-xs font-bold shadow-sm",
                  selected
                    ? "bg-primary text-on-primary"
                    : "bg-black/35 text-white",
                ].join(" ")}
                aria-hidden
              >
                {selected ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
