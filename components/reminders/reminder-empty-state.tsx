import { Bell } from "lucide-react";

type ReminderEmptyStateProps = {
  onAdd: () => void;
};

export function ReminderEmptyState({ onAdd }: ReminderEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-6 py-12 text-center sm:px-10">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary">
        <Bell className="size-6" strokeWidth={1.5} aria-hidden />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold text-on-surface">
        No reminders yet
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
        Gentle nudges help you stay consistent with watering, feeding, and
        checks — without the stress of a rigid schedule.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="mt-8 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-sm font-medium text-on-primary transition hover:bg-primary/90"
      >
        Add reminder
      </button>
    </div>
  );
}
