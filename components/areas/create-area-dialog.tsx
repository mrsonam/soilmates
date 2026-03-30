"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createAreaAction } from "@/app/(app)/collections/[collectionSlug]/area-actions";
import { areaMutationFormInitialState } from "@/app/(app)/collections/[collectionSlug]/area-form-state";

type CreateAreaDialogProps = {
  open: boolean;
  onClose: () => void;
  collectionSlug: string;
  uploadsEnabled: boolean;
};

function CreateAreaFormBody({
  collectionSlug,
  uploadsEnabled,
  onClose,
  onSuccess,
  formKey,
}: {
  collectionSlug: string;
  uploadsEnabled: boolean;
  onClose: () => void;
  onSuccess: () => void;
  formKey: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createAreaAction,
    areaMutationFormInitialState,
  );

  useEffect(() => {
    if (state.success) {
      onSuccess();
      router.refresh();
    }
  }, [state.success, onSuccess, router]);

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <h2
          id="create-area-dialog-title"
          className="font-display text-xl font-semibold tracking-tight text-on-surface"
        >
          New area
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
          aria-label="Close"
        >
          <X className="size-5" strokeWidth={1.5} />
        </button>
      </div>
      <p className="mt-2 text-sm text-on-surface-variant">
        Name a space in your home or garden. You can refine the description
        anytime.
      </p>

      <form
        action={formAction}
        encType="multipart/form-data"
        className="mt-6 space-y-5"
      >
        <input type="hidden" name="collectionSlug" value={collectionSlug} />
        {state.error && (
          <p
            className="rounded-2xl bg-surface-container-low px-3 py-2.5 text-sm text-on-surface-variant"
            role="alert"
          >
            {state.error}
          </p>
        )}
        <div>
          <label
            htmlFor={`area-name-${formKey}`}
            className="mb-2 block text-sm font-medium text-on-surface"
          >
            Area name <span className="text-primary">*</span>
          </label>
          <input
            id={`area-name-${formKey}`}
            name="name"
            type="text"
            required
            autoComplete="off"
            disabled={pending}
            placeholder="e.g. Living Room"
            className="w-full rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        <div>
          <label
            htmlFor={`area-desc-${formKey}`}
            className="mb-2 block text-sm font-medium text-on-surface"
          >
            Description{" "}
            <span className="font-normal text-on-surface-variant">(optional)</span>
          </label>
          <textarea
            id={`area-desc-${formKey}`}
            name="description"
            rows={3}
            disabled={pending}
            placeholder="Bright south window, humid in summer…"
            className="w-full resize-none rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        {uploadsEnabled ? (
          <div>
            <label
              htmlFor={`area-cover-${formKey}`}
              className="mb-2 block text-sm font-medium text-on-surface"
            >
              Area photo{" "}
              <span className="font-normal text-on-surface-variant">(optional)</span>
            </label>
            <input
              id={`area-cover-${formKey}`}
              name="coverImage"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              disabled={pending}
              className="w-full text-sm text-on-surface file:mr-3 file:rounded-xl file:border-0 file:bg-primary/90 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-white"
            />
            <p className="mt-2 text-xs text-on-surface-variant">
              JPEG, PNG, WebP, or GIF · up to 10 MB. Shown on cards and the area
              page.
            </p>
          </div>
        ) : null}
        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="h-12 w-full rounded-full bg-surface-container-high text-sm font-medium text-on-surface transition hover:bg-surface-container-highest disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-full bg-primary text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create area"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function CreateAreaDialog({
  open,
  onClose,
  collectionSlug,
  uploadsEnabled,
}: CreateAreaDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);
  const onSuccess = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      setFormKey((k) => k + 1);
      el.showModal();
    } else {
      el.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-60 w-[min(100vw-1.5rem,26rem)] max-h-[min(90dvh,36rem)] -translate-x-1/2 -translate-y-1/2 modal-scroll rounded-3xl border-0 bg-surface-container-lowest p-0 shadow-[0_28px_56px_-16px_rgba(27,28,26,0.18)] backdrop:bg-on-surface/25 backdrop:backdrop-blur-sm"
      aria-labelledby="create-area-dialog-title"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {open ? (
        <CreateAreaFormBody
          key={formKey}
          formKey={formKey}
          collectionSlug={collectionSlug}
          uploadsEnabled={uploadsEnabled}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </dialog>
  );
}
