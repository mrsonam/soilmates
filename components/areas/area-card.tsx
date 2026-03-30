"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Droplets, MoreVertical, Pencil, Sun } from "lucide-react";
import type { AreaForCollectionDetail } from "@/lib/collections/collection-detail";
import { ArchiveAreaForm } from "./archive-area-form";
import { gradientClassForAreaId } from "./area-visuals";

type AreaCardProps = {
  area: AreaForCollectionDetail;
  collectionSlug: string;
  onEdit: () => void;
};

export function AreaCard({ area, collectionSlug, onEdit }: AreaCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  const gradient = gradientClassForAreaId(area.id);
  const lightHint =
    area.plantCount > 0 ? "Mixed light" : "Set plants to track light";
  const humidityHint = "Track soon";

  return (
    <article className="relative">
      <Link
        href={`/collections/${collectionSlug}/areas/${area.slug}`}
        className="group block overflow-hidden rounded-3xl bg-surface-container-lowest shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] transition hover:shadow-[0_20px_40px_-16px_rgba(27,28,26,0.1)] hover:ring-primary/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
      >
        <div
          className={`relative aspect-[4/3] overflow-hidden bg-gradient-to-br ${gradient}`}
          aria-hidden
        >
          {area.coverImageSignedUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element -- signed URL */}
              <img
                src={area.coverImageSignedUrl}
                alt=""
                className="absolute inset-0 size-full object-cover"
              />
            </>
          ) : null}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(255,255,255,0.12),transparent_50%)]" />
        </div>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-lg font-semibold tracking-tight text-on-surface group-hover:text-primary">
              {area.name}
            </h3>
            <span className="shrink-0 rounded-full bg-primary-fixed/45 px-2.5 py-1 text-[0.65rem] font-bold uppercase tracking-wide text-primary">
              {area.plantCount} {area.plantCount === 1 ? "plant" : "plants"}
            </span>
          </div>
          {area.description ? (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
              {area.description}
            </p>
          ) : (
            <p className="mt-2 text-sm italic text-on-surface-variant/70">
              No description yet
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-on-surface-variant">
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high/80 px-2.5 py-1">
              <Sun className="size-3.5 text-primary/80" strokeWidth={1.75} aria-hidden />
              {lightHint}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-surface-container-high/80 px-2.5 py-1">
              <Droplets
                className="size-3.5 text-primary/80"
                strokeWidth={1.75}
                aria-hidden
              />
              {humidityHint}
            </span>
          </div>
          <p className="mt-3 text-[0.65rem] text-on-surface-variant/70">
            Order {area.sortOrder + 1}
          </p>
        </div>
      </Link>

      <div className="absolute right-3 top-3 z-10" ref={wrapRef}>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setMenuOpen((o) => !o);
          }}
          className="flex size-10 items-center justify-center rounded-full bg-surface/90 text-on-surface shadow-sm ring-1 ring-outline-variant/15 backdrop-blur-sm transition hover:bg-surface"
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          aria-label="Area actions"
        >
          <MoreVertical className="size-5" strokeWidth={1.5} aria-hidden />
        </button>
        {menuOpen && (
          <div
            className="absolute right-0 mt-1 min-w-[11rem] overflow-hidden rounded-2xl bg-surface-container-lowest py-1 shadow-(--shadow-ambient) ring-1 ring-outline-variant/15"
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onEdit();
              }}
              className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-on-surface transition hover:bg-surface-container-low"
            >
              <Pencil className="size-4 text-on-surface-variant" aria-hidden />
              Edit area
            </button>
            <div className="border-t border-outline-variant/10 px-1 py-1">
              <ArchiveAreaForm
                collectionSlug={collectionSlug}
                areaId={area.id}
                areaName={area.name}
                onDone={() => setMenuOpen(false)}
              />
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
