import type { AutoSaveStatus } from "@/hooks/use-auto-save-settings";

export function AutoSaveStatus({
  status,
  error,
}: {
  status: AutoSaveStatus;
  error: string | null;
}) {
  if (status === "idle") return null;
  return (
    <p
      className="min-h-[1.25rem] text-xs text-on-surface-variant"
      aria-live="polite"
    >
      {status === "saving" ? (
        <span className="text-on-surface-variant">Saving…</span>
      ) : status === "saved" ? (
        <span className="text-primary">Saved</span>
      ) : (
        <span className="text-red-600 dark:text-red-300">{error ?? "Could not save."}</span>
      )}
    </p>
  );
}
