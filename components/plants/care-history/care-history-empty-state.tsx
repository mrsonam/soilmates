import { ScrollText } from "lucide-react";

type CareHistoryEmptyStateProps = {
  onAddLog: () => void;
};

export function CareHistoryEmptyState({ onAddLog }: CareHistoryEmptyStateProps) {
  return (
    <div className="rounded-3xl bg-surface-container-low/60 px-6 py-14 text-center ring-1 ring-outline-variant/10 sm:px-10">
      <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary-fixed/40 text-primary">
        <ScrollText className="size-7" strokeWidth={1.5} aria-hidden />
      </span>
      <h3 className="mt-6 font-display text-lg font-semibold text-on-surface">
        No care history yet
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-on-surface-variant">
        A care journal helps you spot patterns, remember what worked, and share
        the story of your plant over months and years. Start with a quick log or
        add a detailed entry.
      </p>
      <button
        type="button"
        onClick={onAddLog}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary/90"
      >
        Add first log
      </button>
    </div>
  );
}
