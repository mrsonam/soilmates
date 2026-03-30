"use client";

import { useActionState } from "react";
import {
  createCollectionAction,
  joinCollectionByInviteAction,
} from "@/app/onboarding/collections/actions";
import {
  collectionFormInitialState,
  type CollectionFormState,
} from "@/app/onboarding/collections/collection-form-state";

function FieldError({ state }: { state: CollectionFormState }) {
  if (!state.error) return null;
  return (
    <p
      className="rounded-xl bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant"
      role="alert"
    >
      {state.error}
    </p>
  );
}

export function CollectionSetupForm({
  uploadsEnabled,
}: {
  uploadsEnabled: boolean;
}) {
  const [createState, createFormAction, createPending] = useActionState(
    createCollectionAction,
    collectionFormInitialState,
  );
  const [joinState, joinFormAction, joinPending] = useActionState(
    joinCollectionByInviteAction,
    collectionFormInitialState,
  );

  return (
    <div className="mx-auto w-full max-w-md space-y-14">
      <section className="rounded-4xl bg-surface-container-lowest p-8 shadow-(--shadow-ambient) sm:p-10">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-on-surface sm:text-[1.75rem]">
          Create your first collection
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Start your shared plant space
        </p>

        <form
          action={createFormAction}
          encType="multipart/form-data"
          className="mt-8 space-y-5"
        >
          <FieldError state={createState} />
          <div>
            <label
              htmlFor="collection-name"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-on-surface-variant"
            >
              Collection name
            </label>
            <input
              id="collection-name"
              name="name"
              type="text"
              required
              autoComplete="off"
              placeholder="e.g. Home jungle"
              disabled={createPending}
              className="w-full rounded-2xl bg-surface-container-highest px-4 py-3.5 text-[0.9375rem] text-on-surface outline-none ring-0 transition placeholder:text-on-surface-variant/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#737972]/80"
            />
          </div>
          <div>
            <label
              htmlFor="collection-cover"
              className="mb-2 block text-xs font-medium uppercase tracking-wide text-on-surface-variant"
            >
              Cover photo{" "}
              {uploadsEnabled ? (
                <span className="text-primary">*</span>
              ) : (
                <span className="font-normal normal-case text-on-surface-variant/80">
                  (optional — add Supabase env to require)
                </span>
              )}
            </label>
            {uploadsEnabled ? (
              <input
                id="collection-cover"
                name="coverImage"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                required
                disabled={createPending}
                className="w-full rounded-2xl bg-surface-container-highest px-4 py-3 text-[0.9375rem] text-on-surface file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white"
              />
            ) : (
              <p className="rounded-2xl bg-amber-500/10 px-4 py-3 text-xs leading-relaxed text-amber-950/90 ring-1 ring-amber-500/20 dark:text-amber-100/90">
                Configure Supabase storage to upload a cover. You can create the
                collection now and add a photo later from the collection page.
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={createPending}
            className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary text-[0.9375rem] font-medium text-on-primary transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {createPending ? "Creating…" : "Create collection"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs leading-relaxed text-on-surface-variant">
          You can invite others later from collection settings.
        </p>
      </section>

      <section className="space-y-5">
        <div className="flex items-center gap-4">
          <span className="h-px flex-1 bg-outline-variant/15" />
          <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-on-surface-variant">
            or
          </span>
          <span className="h-px flex-1 bg-outline-variant/15" />
        </div>

        <div className="rounded-4xl bg-surface-container-low p-8 sm:p-10">
          <h2 className="font-display text-lg font-semibold text-on-surface">
            Join a collection
          </h2>
          <p className="mt-1.5 text-sm text-on-surface-variant">
            Paste the invite code from someone who shared their space with you.
          </p>
          <form action={joinFormAction} className="mt-6 space-y-5">
            <FieldError state={joinState} />
            <div>
              <label
                htmlFor="invite-token"
                className="mb-2 block text-xs font-medium uppercase tracking-wide text-on-surface-variant"
              >
                Invite code
              </label>
              <input
                id="invite-token"
                name="token"
                type="text"
                required
                autoComplete="off"
                placeholder="Paste code"
                disabled={joinPending}
                className="w-full rounded-2xl bg-surface-container-lowest px-4 py-3.5 font-mono text-[0.8125rem] text-on-surface outline-none transition placeholder:text-on-surface-variant/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#737972]/80"
              />
            </div>
            <button
              type="submit"
              disabled={joinPending}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-surface-container-high text-[0.9375rem] font-medium text-on-surface transition hover:bg-surface-container-highest disabled:cursor-not-allowed disabled:opacity-60"
            >
              {joinPending ? "Joining…" : "Join"}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
