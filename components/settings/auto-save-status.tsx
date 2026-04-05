import { Loader2 } from "lucide-react";
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
      className="flex min-h-[1.25rem] items-center gap-2 text-xs text-on-surface-variant"
      aria-live="polite"
    >
      {status === "saving" ? (
        <>
          <Loader2
            className="size-3.5 shrink-0 animate-spin text-primary/80"
            aria-hidden
          />
          <span className="font-medium text-on-surface-variant">Saving…</span>
        </>
      ) : status === "saved" ? (
        <span className="text-primary">Saved</span>
      ) : (
        <span className="text-red-600 dark:text-red-300">
          {error ?? "Could not save."}
        </span>
      )}
    </p>
  );
}
