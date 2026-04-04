"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { PlantGalleryImage } from "@/lib/plants/plant-images";
import type { DiagnosisHistoryItem } from "@/lib/diagnosis/queries";
import { createPlantDiagnosisAction } from "@/lib/diagnosis/actions";
import { resolvePlantDiagnosisAction } from "@/lib/diagnosis/actions";
import { PlantDiagnosisStatus } from "@prisma/client";
import { DiagnosisImageSelector } from "./diagnosis-image-selector";
import {
  DiagnosisEmptyStateNoPhotos,
  DiagnosisEmptyStateNoDiagnoses,
} from "./diagnosis-empty-state";
import { DiagnosisResultCard } from "./diagnosis-result-card";
import { DiagnosisHistoryList } from "./diagnosis-history-list";

type Props = {
  collectionSlug: string;
  plantSlug: string;
  plantNickname: string;
  threadId: string | null;
  galleryImages: PlantGalleryImage[];
  active: DiagnosisHistoryItem | null;
  history: DiagnosisHistoryItem[];
  /** Nested in Assistant tab: tighter chrome, no duplicate page title. */
  variant?: "standalone" | "embedded";
};

export function PlantDiagnosisPanel({
  collectionSlug,
  plantSlug,
  plantNickname,
  threadId,
  galleryImages,
  active,
  history,
  variant = "standalone",
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [resolvePending, setResolvePending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    galleryImages.length > 0 ? [galleryImages[0].id] : [],
  );
  const [concern, setConcern] = useState("");

  const past = history.filter((h) => h.status !== PlantDiagnosisStatus.active);
  const hasAnyDiagnosis = history.length > 0;

  function toggle(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 6) return prev;
      return [...prev, id];
    });
  }

  function runDiagnosis() {
    if (!threadId || selectedIds.length === 0) return;
    setError(null);
    startTransition(async () => {
      const r = await createPlantDiagnosisAction({
        collectionSlug,
        plantSlug,
        imageIds: selectedIds,
        userConcern: concern.trim() || null,
        threadId,
      });
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setConcern("");
      router.refresh();
    });
  }

  const embedded = variant === "embedded";

  if (galleryImages.length === 0) {
    return (
      <div className={embedded ? "space-y-8" : "space-y-10"}>
        <DiagnosisEmptyStateNoPhotos plantNickname={plantNickname} />
        {active ? (
          <DiagnosisResultCard
            item={active}
            variant="full"
            onResolve={async () => {
              setResolvePending(true);
              try {
                const r = await resolvePlantDiagnosisAction({
                  collectionSlug,
                  plantSlug,
                  diagnosisId: active.id,
                });
                if (r.ok) router.refresh();
              } finally {
                setResolvePending(false);
              }
            }}
            resolvePending={resolvePending}
          />
        ) : null}
        {past.length > 0 ? <DiagnosisHistoryList items={past} /> : null}
        {!hasAnyDiagnosis ? <DiagnosisEmptyStateNoDiagnoses /> : null}
      </div>
    );
  }

  return (
    <div className={embedded ? "space-y-8" : "space-y-10"}>
      {!embedded ? (
        <header className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Careful review
          </p>
          <h2 className="font-display text-xl font-semibold text-on-surface">
            Diagnosis &amp; plant check-in
          </h2>
          <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            The assistant looks at your photos together with care history,
            reminders, and reference data. Conclusions stay tentative — we bias
            toward safe, reversible steps.
          </p>
        </header>
      ) : (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Photo review
          </p>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            Select photos and run a structured review — results also appear in
            the conversation below.
          </p>
        </div>
      )}

      {active ? (
        <DiagnosisResultCard
          item={active}
          variant="full"
          onResolve={async () => {
            setResolvePending(true);
            try {
              const r = await resolvePlantDiagnosisAction({
                collectionSlug,
                plantSlug,
                diagnosisId: active.id,
              });
              if (r.ok) router.refresh();
            } finally {
              setResolvePending(false);
            }
          }}
          resolvePending={resolvePending}
        />
      ) : hasAnyDiagnosis ? (
        <p className="rounded-2xl bg-surface-container-high/40 px-4 py-3 text-sm text-on-surface-variant ring-1 ring-outline-variant/[0.08]">
          No active review — the latest entry was closed or superseded. Run a new
          check below or browse earlier reviews.
        </p>
      ) : (
        <DiagnosisEmptyStateNoDiagnoses />
      )}

      <section className="rounded-3xl bg-surface-container-lowest/60 p-5 ring-1 ring-outline-variant/[0.08] sm:p-6">
        <h3 className="font-display text-lg font-semibold text-on-surface">
          New review
        </h3>
        <p className="mt-1 text-sm text-on-surface-variant">
          Select photos, add what you are worried about (optional), then run the
          review.
        </p>

        <div className="mt-5">
          <DiagnosisImageSelector
            images={galleryImages}
            selectedIds={selectedIds}
            onToggle={toggle}
            maxSelect={6}
          />
        </div>

        <label className="mt-6 block">
          <span className="text-sm font-medium text-on-surface">
            What are you worried about?{" "}
            <span className="font-normal text-on-surface-variant">(optional)</span>
          </span>
          <textarea
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            rows={3}
            maxLength={4000}
            placeholder="e.g. lower leaves yellowing, spots on new growth…"
            className="mt-2 w-full resize-y rounded-2xl border border-outline-variant/20 bg-surface-container-lowest/80 px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>

        {error ? (
          <p
            className="mt-4 rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-500/20"
            role="alert"
          >
            {error}
          </p>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            disabled={
              pending || !threadId || selectedIds.length === 0
            }
            onClick={() => runDiagnosis()}
            className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-on-primary shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Reviewing…" : "Run diagnosis"}
          </button>
          {!threadId ? (
            <p className="text-sm text-on-surface-variant">
              Assistant thread unavailable — refresh the page and try again.
            </p>
          ) : null}
        </div>
      </section>

      {past.length > 0 ? <DiagnosisHistoryList items={past} /> : null}
    </div>
  );
}
