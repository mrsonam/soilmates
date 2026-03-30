"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import type { PlantGalleryImage } from "@/lib/plants/plant-images";

type PhotoLightboxProps = {
  image: PlantGalleryImage | null;
  onClose: () => void;
  footer?: ReactNode;
};

export function PhotoLightbox({ image, onClose, footer }: PhotoLightboxProps) {
  useEffect(() => {
    if (!image) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [image, onClose]);

  if (!image?.signedUrl) return null;

  const when = image.capturedAt ?? image.createdAt;
  const dateLabel = new Date(when).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Photo preview"
      onClick={onClose}
    >
      <div
        className="relative max-h-[min(90vh,900px)] w-full max-w-4xl overflow-hidden rounded-3xl bg-surface-container-lowest shadow-2xl ring-1 ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 flex size-10 items-center justify-center rounded-full bg-black/35 text-white transition hover:bg-black/50"
          aria-label="Close"
        >
          <X className="size-5" strokeWidth={1.75} />
        </button>
        {/* eslint-disable-next-line @next/next/no-img-element -- signed URL */}
        <img
          src={image.signedUrl}
          alt=""
          className="max-h-[min(85vh,880px)] w-full object-contain"
        />
        <div className="border-t border-outline-variant/10 bg-surface-container-lowest/95 px-4 py-3 sm:px-6">
          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
                {image.isPrimary
                  ? "Cover"
                  : image.imageType === "progress"
                    ? "Progress"
                    : String(image.imageType)}
              </p>
              <p className="text-on-surface">{dateLabel}</p>
              {image.uploadedByName ? (
                <p className="text-xs text-on-surface-variant">
                  Added by {image.uploadedByName}
                </p>
              ) : null}
            </div>
            {footer ? (
              <div className="flex flex-wrap items-center justify-end gap-2">{footer}</div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
