"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Camera, Loader2, Pencil, Trash2, X } from "lucide-react";
import { PendingButton } from "@/components/loading/pending-button";
import {
  removeAreaCoverAction,
  removeCollectionCoverAction,
  uploadAreaCoverAction,
  uploadCollectionCoverAction,
} from "@/app/(app)/collections/[collectionSlug]/cover-actions";

type InlineCoverEditProps = {
  variant: "collection" | "area";
  collectionSlug: string;
  /** Required when variant is "area". */
  areaId?: string;
  currentUrl: string | null;
  uploadsEnabled: boolean;
};

export function InlineCoverEdit({
  variant,
  collectionSlug,
  areaId,
  currentUrl,
  uploadsEnabled,
}: InlineCoverEditProps) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [pendingOp, setPendingOp] = useState<"upload" | "remove">("upload");

  useEffect(() => {
    if (!open) return;
    function handleDoc(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setError(null);
      }
    }
    document.addEventListener("mousedown", handleDoc);
    return () => document.removeEventListener("mousedown", handleDoc);
  }, [open]);

  function openCamera() {
    const el = fileRef.current;
    if (!el) return;
    el.setAttribute("capture", "environment");
    el.click();
    queueMicrotask(() => el.removeAttribute("capture"));
  }

  async function onUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setError(null);
    const fd = new FormData(form);
    fd.set("collectionSlug", collectionSlug);
    if (variant === "area" && areaId) fd.set("areaId", areaId);
    setPendingOp("upload");
    setPending(true);
    try {
      const r =
        variant === "collection"
          ? await uploadCollectionCoverAction(undefined, fd)
          : await uploadAreaCoverAction(undefined, fd);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      form.reset();
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  async function onRemove(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("collectionSlug", collectionSlug);
    if (variant === "area" && areaId) fd.set("areaId", areaId);
    setPendingOp("remove");
    setPending(true);
    try {
      const r =
        variant === "collection"
          ? await removeCollectionCoverAction(undefined, fd)
          : await removeAreaCoverAction(undefined, fd);
      if (!r.ok) {
        setError(r.error);
        return;
      }
      setOpen(false);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  if (!uploadsEnabled) {
    return null;
  }

  const label =
    variant === "collection" ? "Collection cover" : "Area cover";

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute bottom-2 right-2 z-10"
    >
      <div className="pointer-events-auto relative flex flex-col items-end">
        {open ? (
          <div
            className="absolute bottom-full right-0 z-20 mb-1.5 w-[min(17rem,calc(100vw-2.5rem))] rounded-2xl border border-outline-variant/15 bg-surface-container-lowest/98 p-3 shadow-lg backdrop-blur-md ring-1 ring-black/5"
            role="dialog"
            aria-label={label}
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
                {currentUrl ? "Replace" : "Add photo"}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  setError(null);
                }}
                disabled={pending}
                className="rounded-lg p-1 text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                aria-label="Close"
              >
                <X className="size-3.5" strokeWidth={2} aria-hidden />
              </button>
            </div>
            {error ? (
              <p
                className="mb-2 text-[0.7rem] leading-snug text-red-700 dark:text-red-200/90"
                role="alert"
              >
                {error}
              </p>
            ) : null}
            <form onSubmit={onUpload} className="space-y-2">
              <input type="hidden" name="collectionSlug" value={collectionSlug} />
              {variant === "area" && areaId ? (
                <input type="hidden" name="areaId" value={areaId} />
              ) : null}
              <input
                ref={fileRef}
                name="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={pending}
                className="w-full text-[0.7rem] text-on-surface file:mr-2 file:rounded-lg file:border-0 file:bg-primary file:px-2 file:py-1 file:text-[0.65rem] file:font-semibold file:text-white"
              />
              <div className="flex flex-wrap gap-1.5">
                <PendingButton
                  type="submit"
                  pending={pending && pendingOp === "upload"}
                  pendingLabel="Uploading…"
                  className="rounded-full bg-primary px-3 py-1.5 text-[0.7rem] font-medium text-on-primary disabled:opacity-60"
                >
                  Upload
                </PendingButton>
                <button
                  type="button"
                  disabled={pending}
                  onClick={openCamera}
                  className="inline-flex items-center gap-1 rounded-full border border-outline-variant/25 bg-surface-container-high px-2.5 py-1.5 text-[0.65rem] font-medium text-on-surface"
                >
                  <Camera className="size-3" strokeWidth={2} aria-hidden />
                  Cam
                </button>
              </div>
            </form>
            {currentUrl ? (
              <form onSubmit={onRemove} className="mt-2 border-t border-outline-variant/10 pt-2">
                <button
                  type="submit"
                  disabled={pending}
                  aria-busy={pending && pendingOp === "remove"}
                  className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-on-surface-variant hover:text-red-700 dark:hover:text-red-300 disabled:opacity-60"
                >
                  {pending && pendingOp === "remove" ? (
                    <Loader2 className="size-3 shrink-0 animate-spin" aria-hidden />
                  ) : (
                    <Trash2 className="size-3" strokeWidth={2} aria-hidden />
                  )}
                  {pending && pendingOp === "remove" ? "Removing…" : "Remove"}
                </button>
              </form>
            ) : null}
          </div>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen((o) => !o);
          }}
          disabled={pending}
          title={currentUrl ? "Change cover photo" : "Add cover photo"}
          aria-label={currentUrl ? "Change cover photo" : "Add cover photo"}
          aria-expanded={open}
          className="relative z-10 flex size-7 items-center justify-center rounded-full bg-black/45 text-white/95 shadow-sm backdrop-blur-sm transition hover:bg-black/60 disabled:opacity-50"
        >
          <Pencil className="size-3" strokeWidth={2} aria-hidden />
        </button>
      </div>
    </div>
  );
}
