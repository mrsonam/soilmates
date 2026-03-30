import { Leaf } from "lucide-react";

export function ActivityEmptyState() {
  return (
    <div className="rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-6 py-14 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Leaf className="size-6" strokeWidth={1.5} aria-hidden />
      </div>
      <p className="mt-4 font-display text-lg font-semibold text-on-surface">
        No activity yet
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
        Activity will appear as plants are cared for and updated across your
        shared spaces. Water, photograph, and tend together — everything stays
        calm and in one place.
      </p>
    </div>
  );
}
