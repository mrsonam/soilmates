"use client";

import type { PlantGalleryImage } from "@/lib/plants/plant-images";
import { PlantPhotoCard } from "./plant-photo-card";

type PlantPhotoTimelineProps = {
  images: PlantGalleryImage[];
  onOpen: (image: PlantGalleryImage) => void;
  /** Limit number of cards (e.g. tab preview). */
  maxCards?: number;
};

function monthLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function sortKey(iso: string) {
  return new Date(iso).getTime();
}

export function PlantPhotoTimeline({
  images,
  onOpen,
  maxCards,
}: PlantPhotoTimelineProps) {
  const sorted = [...images].sort(
    (a, b) =>
      sortKey(b.capturedAt ?? b.createdAt) - sortKey(a.capturedAt ?? a.createdAt),
  );
  const limited =
    maxCards != null ? sorted.slice(0, maxCards) : sorted;

  const groups = new Map<string, PlantGalleryImage[]>();
  for (const img of limited) {
    const when = img.capturedAt ?? img.createdAt;
    const key = monthLabel(when);
    const list = groups.get(key) ?? [];
    list.push(img);
    groups.set(key, list);
  }

  const orderedKeys = [...groups.keys()];

  return (
    <div className="space-y-10">
      {orderedKeys.map((label) => (
        <section key={label} className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-outline-variant/15" aria-hidden />
            <h3 className="shrink-0 font-display text-sm font-semibold tracking-wide text-on-surface-variant">
              {label}
            </h3>
            <span className="h-px flex-1 bg-outline-variant/15" aria-hidden />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {groups.get(label)!.map((img) => (
              <PlantPhotoCard
                key={img.id}
                image={img}
                onOpen={() => onOpen(img)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
