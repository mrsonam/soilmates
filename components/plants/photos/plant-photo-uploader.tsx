"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Camera } from "lucide-react";
import { uploadPlantImagesAction } from "@/app/(app)/collections/[collectionSlug]/plants/plant-image-actions";

type PlantPhotoUploaderProps = {
  collectionSlug: string;
  plantSlug: string;
  /** From server: true when Supabase storage env vars are set. */
  uploadsEnabled: boolean;
  compact?: boolean;
};

export function PlantPhotoUploader({
  collectionSlug,
  plantSlug,
  uploadsEnabled,
  compact,
}: PlantPhotoUploaderProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [mode, setMode] = useState<"progress" | "cover">("progress");

  if (!uploadsEnabled) {
    return (
      <p className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-950/90 ring-1 ring-amber-500/20 dark:text-amber-100/90">
        Photo uploads need{" "}
        <code className="rounded bg-black/5 px-1 py-0.5 text-xs">SUPABASE_URL</code>{" "}
        and{" "}
        <code className="rounded bg-black/5 px-1 py-0.5 text-xs">
          SUPABASE_SERVICE_ROLE_KEY
        </code>{" "}
        on the server, plus a private Storage bucket named{" "}
        <code className="rounded bg-black/5 px-1 py-0.5 text-xs">
          plant-images
        </code>
        .
      </p>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    const formData = new FormData(form);
    const files = formData.getAll("files") as File[];
    const hasFile = files.some((f) => f && f.size > 0);
    if (!hasFile) {
      setError("Choose at least one image.");
      return;
    }
    formData.set("collectionSlug", collectionSlug);
    formData.set("plantSlug", plantSlug);
    formData.set("mode", mode);
    setPending(true);
    try {
      const result = await uploadPlantImagesAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      form.reset();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const formClass = compact
    ? "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end"
    : "space-y-4";

  return (
    <form onSubmit={handleSubmit} className={formClass}>
      <div className={compact ? "flex flex-1 flex-col gap-2 sm:min-w-[12rem]" : "space-y-2"}>
        <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
          Upload as
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setMode("progress")}
            className={[
              "rounded-xl px-3 py-2 text-sm font-medium transition",
              mode === "progress"
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
          >
            Progress
          </button>
          <button
            type="button"
            onClick={() => setMode("cover")}
            className={[
              "rounded-xl px-3 py-2 text-sm font-medium transition",
              mode === "cover"
                ? "bg-primary text-white shadow-sm"
                : "bg-surface-container-high text-on-surface-variant hover:text-on-surface",
            ].join(" ")}
          >
            Cover
          </button>
        </div>
      </div>

      <div className={compact ? "flex flex-1 flex-col gap-2" : "space-y-2"}>
        <label
          htmlFor={`captured-${plantSlug}`}
          className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant"
        >
          Captured on (optional)
        </label>
        <input
          id={`captured-${plantSlug}`}
          type="date"
          name="capturedAt"
          className="w-full max-w-[12rem] rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2">
        <label className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
          Images
        </label>
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <input
            name="files"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="max-w-full min-w-0 flex-1 text-sm text-on-surface file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
            disabled={pending}
          />
          <label className="inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl border border-primary/30 bg-surface-container-lowest px-3 py-2 text-xs font-semibold text-primary sm:py-2.5">
            Take photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              capture="environment"
              className="sr-only"
              disabled={pending}
              onChange={(ev) => {
                const input = ev.currentTarget;
                const file = input.files?.[0];
                if (!file) return;
                const fd = new FormData();
                fd.append("files", file);
                fd.set("collectionSlug", collectionSlug);
                fd.set("plantSlug", plantSlug);
                fd.set("mode", mode);
                const cap = document.getElementById(
                  `captured-${plantSlug}`,
                ) as HTMLInputElement | null;
                if (cap?.value) fd.set("capturedAt", cap.value);
                setPending(true);
                setError(null);
                void uploadPlantImagesAction(fd).then((result) => {
                  setPending(false);
                  input.value = "";
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  router.refresh();
                });
              }}
            />
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-50"
          >
            <Camera className="size-4" strokeWidth={1.75} aria-hidden />
            {pending ? "Uploading…" : "Upload"}
          </button>
          <span className="text-xs text-on-surface-variant">
            JPEG, PNG, WebP, GIF · up to 10 MB each
          </span>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-red-700 dark:text-red-300/90" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  );
}
