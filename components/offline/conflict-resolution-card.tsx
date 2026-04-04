"use client";

type ConflictResolutionCardProps = {
  title?: string;
  message: string;
  onDismiss: () => void;
};

export function ConflictResolutionCard({
  title = "Something changed while you were offline",
  message,
  onDismiss,
}: ConflictResolutionCardProps) {
  return (
    <div className="rounded-2xl bg-surface-container-high/80 p-4 ring-1 ring-outline-variant/15">
      <p className="text-sm font-medium text-on-surface">{title}</p>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
        {message}
      </p>
      <p className="mt-3 text-sm text-on-surface-variant">
        This item changed before your offline update could sync. You can remove
        this update from the queue and try again with the latest data.
      </p>
      <button
        type="button"
        onClick={onDismiss}
        className="mt-4 rounded-full bg-surface-container-lowest px-4 py-2 text-sm font-medium text-on-surface ring-1 ring-outline-variant/20 transition hover:bg-surface-container-high"
      >
        Remove queued update
      </button>
    </div>
  );
}
