import Link from "next/link";
import { Camera, Droplets, Leaf, Plus, Sprout, Users } from "lucide-react";

type PlantsEmptyStateProps = {
  variant: "collection" | "global";
  addPlantHref: string;
  /** Global only: if false, prompt to open Collections first. */
  hasCollections?: boolean;
};

export function PlantsEmptyState({
  variant,
  addPlantHref,
  hasCollections = true,
}: PlantsEmptyStateProps) {
  const showAddPlantCta = variant === "collection" || hasCollections;

  const primaryCta = !showAddPlantCta ? (
    <Link
      href="/collections"
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary/90"
    >
      Go to collections
    </Link>
  ) : (
    <Link
      href={addPlantHref}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary/90"
    >
      <Plus className="size-4" strokeWidth={2.25} aria-hidden />
      Add your first plant
    </Link>
  );

  const subcopy =
    variant === "global" && !hasCollections
      ? "Create or join a collection first. Plants live inside a shared space so care stays organized."
      : "Track your houseplants, herbs, and seedlings in one shared place. Build your digital greenhouse and watch your collection thrive.";

  return (
    <div className="mx-auto max-w-lg py-6 text-center sm:py-10">
      <div className="relative mx-auto h-40 w-56">
        <div className="absolute left-4 top-6 rotate-[-6deg] rounded-2xl bg-surface-container-lowest px-6 py-8 shadow-(--shadow-ambient) ring-1 ring-outline-variant/10">
          <Sprout className="mx-auto size-10 text-primary/40" strokeWidth={1} aria-hidden />
        </div>
        <div className="absolute right-2 top-2 rotate-[8deg] rounded-2xl bg-primary-fixed/35 px-6 py-8 shadow-(--shadow-ambient) ring-1 ring-primary/10">
          <Leaf className="mx-auto size-10 text-primary/50" strokeWidth={1} aria-hidden />
        </div>
        <span className="absolute right-0 top-0 flex size-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-md">
          <Plus className="size-5" strokeWidth={2.25} aria-hidden />
        </span>
      </div>

      <h2 className="mt-10 font-display text-2xl font-semibold tracking-tight text-primary sm:text-3xl">
        Your plant space starts here.
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant sm:text-[0.9375rem]">
        {subcopy}
      </p>

      <div className="mt-8 flex flex-col items-stretch gap-3 sm:mx-auto sm:max-w-sm sm:flex-row sm:justify-center">
        {primaryCta}
        <button
          type="button"
          disabled
          className="inline-flex h-12 cursor-not-allowed items-center justify-center rounded-full bg-surface-container-high px-6 text-sm font-medium text-on-surface-variant/60"
          title="Coming soon"
        >
          Browse templates
        </button>
      </div>

      <ul className="mt-16 grid gap-4 text-left sm:grid-cols-3 sm:gap-5">
        <li className="rounded-3xl bg-surface-container-lowest p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Droplets className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <h3 className="mt-3 font-display text-sm font-semibold text-on-surface">
            Watering logs
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
            Keep your greens hydrated with personalized schedules.
          </p>
        </li>
        <li className="rounded-3xl bg-surface-container-lowest p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-fixed/50 text-primary">
            <Camera className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <h3 className="mt-3 font-display text-sm font-semibold text-on-surface">
            Growth diary
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
            Snap photos and track visual progress over seasons.
          </p>
        </li>
        <li className="rounded-3xl bg-surface-container-lowest p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#f0d4dc]/40 text-[#6b5348]">
            <Users className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <h3 className="mt-3 font-display text-sm font-semibold text-on-surface">
            Family access
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-on-surface-variant">
            Share care responsibilities with everyone in your home.
          </p>
        </li>
      </ul>
    </div>
  );
}
