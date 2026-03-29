import { MapPin } from "lucide-react";

type AreasEmptyStateProps = {
  onCreateClick: () => void;
};

export function AreasEmptyState({ onCreateClick }: AreasEmptyStateProps) {
  return (
    <div className="mx-auto max-w-lg rounded-[2rem] bg-surface-container-low/60 px-8 py-14 text-center ring-1 ring-outline-variant/[0.08] sm:px-12 sm:py-16">
      <div className="mx-auto flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <MapPin className="size-8" strokeWidth={1.25} aria-hidden />
      </div>
      <h3 className="mt-8 font-display text-xl font-semibold tracking-tight text-on-surface">
        No areas yet
      </h3>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
        Areas group plants by where they live—think{" "}
        <span className="text-on-surface">Living Room</span>,{" "}
        <span className="text-on-surface">Balcony</span>,{" "}
        <span className="text-on-surface">Kitchen</span>, or{" "}
        <span className="text-on-surface">Herb shelf</span>. You&apos;ll care and
        report by location.
      </p>
      <button
        type="button"
        onClick={onCreateClick}
        className="mt-10 inline-flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-primary text-sm font-medium text-on-primary transition hover:bg-primary/90"
      >
        Create your first area
      </button>
    </div>
  );
}
