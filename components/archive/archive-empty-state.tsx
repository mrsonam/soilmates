import { Archive } from "lucide-react";

export function ArchiveEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-lowest/40 px-6 py-14 text-center">
      <Archive
        className="size-10 text-on-surface-variant/50"
        strokeWidth={1.25}
        aria-hidden
      />
      <p className="mt-4 font-display text-lg font-medium text-on-surface">
        No archived plants yet
      </p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-on-surface-variant">
        When you archive a plant, it rests here quietly. Care history and photos
        stay with you — you can bring it back anytime.
      </p>
    </div>
  );
}
