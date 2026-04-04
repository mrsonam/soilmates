"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, ImagePlus, Sparkles } from "lucide-react";
import type { PlantGalleryImage } from "@/lib/plants/plant-images";
import { uploadPlantImagesAction } from "@/app/(app)/collections/[collectionSlug]/plants/plant-image-actions";
import { createPlantDiagnosisAction } from "@/lib/diagnosis/actions";
import { DiagnosisImageSelector } from "@/components/diagnosis/diagnosis-image-selector";
import { DiagnosisEmptyStateNoPhotos } from "@/components/diagnosis/diagnosis-empty-state";
import { AssistantComposer } from "./assistant-composer";

const MAX_REVIEW_PHOTOS = 6;

type PlantAssistantComposerProps = {
  collectionSlug: string;
  plantSlug: string;
  plantNickname: string;
  threadId: string;
  galleryImages: PlantGalleryImage[];
  uploadsEnabled: boolean;
  onSendText: (text: string) => Promise<void>;
  /** True while a chat message is in flight */
  chatPending: boolean;
  /** Upload / diagnosis activity — merge with chat pending for “Thinking…” */
  setComposerBusy: (busy: boolean) => void;
  /** Collapse photo review back to chat-only (icon beside Message) */
  onBackToChat?: () => void;
};

export function PlantAssistantComposer({
  collectionSlug,
  plantSlug,
  plantNickname,
  threadId,
  galleryImages,
  uploadsEnabled,
  onSendText,
  chatPending,
  setComposerBusy,
  onBackToChat,
}: PlantAssistantComposerProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    galleryImages.length > 0 ? [galleryImages[0].id] : [],
  );
  const [concern, setConcern] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [uploadPending, setUploadPending] = useState(false);
  const [diagPending, startDiag] = useTransition();

  useEffect(() => {
    const ids = new Set(galleryImages.map((g) => g.id));
    setSelectedIds((prev) => {
      const next = prev.filter((id) => ids.has(id));
      if (next.length === 0 && galleryImages.length > 0) {
        return [galleryImages[0].id];
      }
      return next;
    });
  }, [galleryImages]);

  useEffect(() => {
    setComposerBusy(uploadPending || diagPending);
  }, [uploadPending, diagPending, setComposerBusy]);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_REVIEW_PHOTOS) return prev;
      return [...prev, id];
    });
  }

  async function uploadFiles(list: FileList | null) {
    if (!list || list.length === 0 || !uploadsEnabled) return;
    setLocalError(null);
    setUploadPending(true);
    try {
      const fd = new FormData();
      fd.set("collectionSlug", collectionSlug);
      fd.set("plantSlug", plantSlug);
      fd.set("mode", "progress");
      for (let i = 0; i < list.length; i++) {
        const f = list.item(i);
        if (f && f.size > 0) fd.append("files", f);
      }
      const result = await uploadPlantImagesAction(fd);
      if (!result.ok) {
        setLocalError(result.error);
        return;
      }
      if (result.uploadedImageIds?.length) {
        setSelectedIds((prev) => {
          const merged = [...new Set([...prev, ...result.uploadedImageIds!])];
          return merged.slice(0, MAX_REVIEW_PHOTOS);
        });
      }
      router.refresh();
    } finally {
      setUploadPending(false);
      if (fileRef.current) fileRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  }

  function runDiagnosis() {
    if (!threadId || selectedIds.length === 0) return;
    setLocalError(null);
    startDiag(async () => {
      const r = await createPlantDiagnosisAction({
        collectionSlug,
        plantSlug,
        imageIds: selectedIds,
        userConcern: concern.trim() || null,
        threadId,
      });
      if (!r.ok) {
        setLocalError(r.error);
        return;
      }
      setConcern("");
      router.refresh();
    });
  }

  const busy = chatPending || uploadPending || diagPending;
  const canReview =
    uploadsEnabled &&
    threadId &&
    galleryImages.length > 0 &&
    selectedIds.length > 0;

  return (
    <div className="space-y-4">
      {localError ? (
        <p
          className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-950 ring-1 ring-amber-500/20 dark:text-amber-100/90"
          role="alert"
        >
          {localError}
        </p>
      ) : null}

      {galleryImages.length === 0 ? (
        <div className="rounded-2xl ring-1 ring-outline-variant/[0.08]">
          <DiagnosisEmptyStateNoPhotos plantNickname={plantNickname} />
        </div>
      ) : (
        <DiagnosisImageSelector
          layout="strip"
          images={galleryImages}
          selectedIds={selectedIds}
          onToggle={toggle}
          maxSelect={MAX_REVIEW_PHOTOS}
        />
      )}

      {uploadsEnabled ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={cameraRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            capture="environment"
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => void uploadFiles(e.target.files)}
          />
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="sr-only"
            tabIndex={-1}
            onChange={(e) => void uploadFiles(e.target.files)}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => cameraRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-surface-container-high/90 px-4 py-2 text-sm font-medium text-on-surface ring-1 ring-outline-variant/15 transition hover:bg-surface-container-high disabled:opacity-40"
          >
            <Camera className="size-4 shrink-0" aria-hidden />
            Take photo
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-full bg-surface-container-high/90 px-4 py-2 text-sm font-medium text-on-surface ring-1 ring-outline-variant/15 transition hover:bg-surface-container-high disabled:opacity-40"
          >
            <ImagePlus className="size-4 shrink-0" aria-hidden />
            From device
          </button>
        </div>
      ) : (
        <p className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-950/90 ring-1 ring-amber-500/20 dark:text-amber-100/90">
          Photo uploads require server storage configuration (see project docs).
        </p>
      )}

      <label className="block">
        <span className="text-xs font-medium text-on-surface-variant">
          Notes for photo review{" "}
          <span className="font-normal opacity-80">(optional)</span>
        </span>
        <textarea
          value={concern}
          onChange={(e) => setConcern(e.target.value)}
          rows={2}
          maxLength={4000}
          disabled={busy}
          placeholder="e.g. lower leaves yellowing…"
          className="mt-1.5 w-full resize-y rounded-2xl border border-outline-variant/20 bg-surface-container-lowest/80 px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/55 focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!canReview || busy}
          onClick={() => runDiagnosis()}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-on-primary shadow-sm transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Sparkles className="size-4 shrink-0" aria-hidden />
          {diagPending ? "Reviewing…" : "Run photo review"}
        </button>
      </div>

      <div className="border-t border-outline-variant/10 pt-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-on-surface-variant">Message</p>
          {onBackToChat ? (
            <button
              type="button"
              onClick={onBackToChat}
              disabled={busy}
              className="flex size-9 items-center justify-center rounded-xl text-on-surface-variant ring-1 ring-outline-variant/20 transition hover:bg-surface-container-highest hover:text-on-surface disabled:opacity-40"
              aria-label="Back to chat"
            >
              <ArrowLeft className="size-4" strokeWidth={1.75} aria-hidden />
            </button>
          ) : null}
        </div>
        <AssistantComposer
          onSend={onSendText}
          disabled={busy || !threadId}
          placeholder={`Ask about ${plantNickname}…`}
        />
      </div>
    </div>
  );
}
