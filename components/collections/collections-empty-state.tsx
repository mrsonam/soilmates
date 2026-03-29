"use client";

import {
  Hand,
  Heart,
  Home,
  Leaf,
  Link2,
  Plus,
  Sparkles,
  Sprout,
  Users,
} from "lucide-react";

type CollectionsEmptyStateProps = {
  onCreateClick: () => void;
};

export function CollectionsEmptyState({
  onCreateClick,
}: CollectionsEmptyStateProps) {
  const scrollToLearn = () => {
    document.getElementById("collections-learn")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <div className="space-y-14 sm:space-y-16">
      <div className="mx-auto max-w-lg text-center">
        <div className="relative mx-auto h-48 w-48 sm:h-56 sm:w-56">
          <span
            className="absolute -left-2 top-6 flex size-11 items-center justify-center rounded-full bg-primary-fixed/90 text-primary shadow-sm ring-2 ring-surface"
            aria-hidden
          >
            <Leaf className="size-5" strokeWidth={1.75} />
          </span>
          <span
            className="absolute -right-1 top-2 flex size-10 items-center justify-center rounded-full bg-[#e8d4c8]/90 text-[#6b5348] shadow-sm ring-2 ring-surface"
            aria-hidden
          >
            <Hand className="size-4" strokeWidth={1.75} />
          </span>

          <div
            className="absolute left-1/2 top-1/2 flex size-40 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:size-44"
            aria-hidden
          >
            <div className="absolute size-28 rotate-[-8deg] rounded-3xl bg-primary-fixed/50 ring-1 ring-primary/10 sm:size-32" />
            <div className="absolute size-28 translate-x-2 translate-y-1 rotate-[6deg] rounded-3xl bg-[#f0d4dc]/60 ring-1 ring-[#c9a8b0]/20 sm:size-32" />
            <div className="absolute size-28 -translate-x-2 translate-y-2 rotate-[14deg] rounded-3xl bg-[#f2d4b8]/70 ring-1 ring-[#d4a574]/25 sm:size-32" />

            <div className="relative z-10 flex size-24 items-center justify-center gap-1 rounded-2xl bg-surface-container-lowest/95 shadow-(--shadow-ambient) ring-1 ring-outline-variant/10 sm:size-28">
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Users className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="flex size-8 items-center justify-center rounded-xl bg-[#c9a8b0]/15 text-[#6b5348]">
                <Link2 className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary-fixed-dim/40 text-primary">
                <Sprout className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
            </div>
          </div>
        </div>

        <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight text-on-surface sm:text-3xl">
          You haven&apos;t created any collections yet.
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-on-surface-variant sm:text-[0.9375rem]">
          Collections are shared digital gardens where you can organize your plants
          by room or project and collaborate with household members on care
          schedules.
        </p>

        <div className="mt-8 flex flex-col items-stretch gap-3 sm:mx-auto sm:max-w-sm sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onCreateClick}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary/90"
          >
            <Plus className="size-4" strokeWidth={2.25} aria-hidden />
            Create your first collection
          </button>
          <button
            type="button"
            onClick={scrollToLearn}
            className="inline-flex h-12 items-center justify-center rounded-full bg-surface-container-high px-6 text-sm font-medium text-on-surface transition hover:bg-surface-container-highest"
          >
            Learn how they work
          </button>
        </div>
      </div>

      <div
        id="collections-learn"
        className="scroll-mt-8 border-t border-outline-variant/10 pt-12 sm:pt-14"
      >
        <p className="text-center text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
          Why collections
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-3 sm:gap-5">
          <li className="rounded-3xl bg-surface-container-lowest p-6 text-left shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Home className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              Room sync
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Organize by living room, balcony, or home office—areas stay in sync
              with your real space.
            </p>
          </li>
          <li className="rounded-3xl bg-surface-container-lowest p-6 text-left shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-[#f0d4dc]/40 text-[#6b5348]">
              <Heart className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              Co-parenting
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Invite roommates or family so everyone can water, mist, and log care
              in one place.
            </p>
          </li>
          <li className="rounded-3xl bg-surface-container-lowest p-6 text-left shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:col-span-1">
            <span className="flex size-10 items-center justify-center rounded-2xl bg-primary-fixed/50 text-primary">
              <Sparkles className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
            <h3 className="mt-4 font-display text-base font-semibold text-on-surface">
              Growth tracking
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
              Collective progress photos and health signals will live here as your
              garden grows.
            </p>
          </li>
        </ul>
      </div>
    </div>
  );
}
