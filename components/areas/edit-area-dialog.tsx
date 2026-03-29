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
import { updateAreaAction } from "@/app/(app)/collections/[collectionSlug]/area-actions";
import { areaMutationFormInitialState } from "@/app/(app)/collections/[collectionSlug]/area-form-state";
import type { AreaForCollectionDetail } from "@/lib/collections/collection-detail";

type EditAreaDialogProps = {
  open: boolean;
  onClose: () => void;
  collectionSlug: string;
  area: AreaForCollectionDetail | null;
};

function EditAreaFormBody({
  collectionSlug,
  area,
  onClose,
  onSuccess,
  formKey,
}: {
  collectionSlug: string;
  area: AreaForCollectionDetail;
  onClose: () => void;
  onSuccess: () => void;
  formKey: number;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    updateAreaAction,
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
          id="edit-area-dialog-title"
          className="font-display text-xl font-semibold tracking-tight text-on-surface"
        >
          Edit area
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

      <form action={formAction} className="mt-6 space-y-5">
        <input type="hidden" name="collectionSlug" value={collectionSlug} />
        <input type="hidden" name="areaId" value={area.id} />
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
            htmlFor={`edit-area-name-${formKey}`}
            className="mb-2 block text-sm font-medium text-on-surface"
          >
            Area name <span className="text-primary">*</span>
          </label>
          <input
            id={`edit-area-name-${formKey}`}
            name="name"
            type="text"
            required
            autoComplete="off"
            disabled={pending}
            defaultValue={area.name}
            className="w-full rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none transition focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
        <div>
          <label
            htmlFor={`edit-area-desc-${formKey}`}
            className="mb-2 block text-sm font-medium text-on-surface"
          >
            Description{" "}
            <span className="font-normal text-on-surface-variant">(optional)</span>
          </label>
          <textarea
            id={`edit-area-desc-${formKey}`}
            name="description"
            rows={3}
            disabled={pending}
            defaultValue={area.description ?? ""}
            placeholder="Environment notes…"
            className="w-full resize-none rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>
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
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function EditAreaDialog({
  open,
  onClose,
  collectionSlug,
  area,
}: EditAreaDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [formKey, setFormKey] = useState(0);
  const onSuccess = useCallback(() => {
    onClose();
  }, [onClose]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open && area) {
      setFormKey((k) => k + 1);
      el.showModal();
    } else {
      el.close();
    }
  }, [open, area]);

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-60 w-[min(100vw-1.5rem,26rem)] max-h-[min(90dvh,36rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-3xl border-0 bg-surface-container-lowest p-0 shadow-[0_28px_56px_-16px_rgba(27,28,26,0.18)] backdrop:bg-on-surface/25 backdrop:backdrop-blur-sm"
      aria-labelledby="edit-area-dialog-title"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {open && area ? (
        <EditAreaFormBody
          key={`${formKey}-${area.id}`}
          formKey={formKey}
          collectionSlug={collectionSlug}
          area={area}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </dialog>
  );
}
