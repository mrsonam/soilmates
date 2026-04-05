"use client";

import {
  useActionState,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { Users, X } from "lucide-react";
import { createCollectionInAppAction } from "@/app/(app)/collections/actions";
import { createCollectionFormInitialState } from "@/app/(app)/collections/create-collection-form-state";

type CreateCollectionDialogProps = {
  open: boolean;
  onClose: () => void;
  uploadsEnabled: boolean;
};

function CreateCollectionFormBody({
  uploadsEnabled,
  onClose,
  onSuccess,
  formKey,
}: {
  uploadsEnabled: boolean;
  onClose: () => void;
  onSuccess: () => void;
  formKey: number;
}) {
  const router = useRouter();
  const [collaborative, setCollaborative] = useState(true);
  const [state, formAction, pending] = useActionState(
    createCollectionInAppAction,
    createCollectionFormInitialState,
  );

  useEffect(() => {
    if (state.success && state.slug) {
      onSuccess();
      router.push(`/collections/${state.slug}`);
      router.refresh();
    }
  }, [state.success, state.slug, onSuccess, router]);

  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <h2
          id="create-collection-dialog-title"
          className="font-display text-xl font-semibold tracking-tight text-on-surface"
        >
          Create Collection
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

      <form
        action={formAction}
        encType="multipart/form-data"
        className="mt-6 space-y-6"
      >
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
            htmlFor={`cc-name-${formKey}`}
            className="mb-2 block text-sm font-medium text-on-surface"
          >
            Collection name
          </label>
          <input
            id={`cc-name-${formKey}`}
            name="name"
            type="text"
            required
            autoComplete="off"
            disabled={pending}
            placeholder="e.g., Balcony Greens"
            className="w-full rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>

        <div>
          <label
            htmlFor={`cc-desc-${formKey}`}
            className="mb-2 block text-sm font-medium text-on-surface"
          >
            Description{" "}
            <span className="font-normal text-on-surface-variant">(optional)</span>
          </label>
          <textarea
            id={`cc-desc-${formKey}`}
            name="description"
            rows={3}
            disabled={pending}
            placeholder="What's the purpose of this collection?"
            className="w-full resize-none rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface outline-none transition placeholder:text-on-surface-variant/50 focus-visible:border-primary/25 focus-visible:ring-2 focus-visible:ring-primary/20"
          />
        </div>

        <div>
          <label
            htmlFor={`cc-cover-${formKey}`}
            className="mb-2 block text-sm font-medium text-on-surface"
          >
            Cover photo{" "}
            {uploadsEnabled ? (
              <span className="text-primary">*</span>
            ) : (
              <span className="font-normal text-on-surface-variant">
                (needs storage)
              </span>
            )}
          </label>
          {uploadsEnabled ? (
            <>
              <input
                id={`cc-cover-${formKey}`}
                name="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                required
                disabled={pending}
                className="w-full rounded-2xl border border-outline-variant/15 bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
              <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                JPEG, PNG, WebP, or GIF · up to 10 MB. Shown on your collections
                list and collection home.
              </p>
            </>
          ) : (
            <p className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-950/90 ring-1 ring-amber-500/20 dark:text-amber-100/90">
              Add{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 text-xs">
                SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 text-xs">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{" "}
              to require a cover when creating a collection. Without storage you
              can still create a collection without a photo.
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 rounded-2xl bg-primary-fixed/35 px-4 py-3.5 ring-1 ring-primary/10">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-surface-container-lowest/80 text-primary">
            <Users className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-on-surface">Collaborative space</p>
            <p className="text-xs text-on-surface-variant">
              Invite others to manage these plants
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={collaborative}
            onClick={() => setCollaborative((c) => !c)}
            className={[
              "relative h-7 w-12 shrink-0 rounded-full transition-colors",
              collaborative ? "bg-primary" : "bg-outline-variant/50",
            ].join(" ")}
          >
            <span
              className={[
                "absolute top-0.5 size-6 rounded-full bg-on-primary shadow-sm transition-transform",
                collaborative ? "left-5" : "left-0.5",
              ].join(" ")}
            />
            <span className="sr-only">Toggle collaborative space</span>
          </button>
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
            name="openAfter"
            value="1"
            disabled={pending}
            className="h-12 w-full rounded-full bg-primary text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create Collection"}
          </button>
        </div>
      </form>
    </div>
  );
}

export function CreateCollectionDialog({
  open,
  onClose,
  uploadsEnabled,
}: CreateCollectionDialogProps) {
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
      className="fixed left-1/2 top-1/2 z-60 w-[min(100vw-1.5rem,28rem)] max-h-[min(92dvh,40rem)] -translate-x-1/2 -translate-y-1/2 modal-scroll rounded-3xl border-0 bg-surface-container-lowest p-0 shadow-[0_28px_56px_-16px_rgba(27,28,26,0.18)] backdrop:bg-on-surface/25 backdrop:backdrop-blur-sm"
      aria-labelledby="create-collection-dialog-title"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      {open ? (
        <CreateCollectionFormBody
          key={formKey}
          formKey={formKey}
          uploadsEnabled={uploadsEnabled}
          onClose={onClose}
          onSuccess={onSuccess}
        />
      ) : null}
    </dialog>
  );
}
