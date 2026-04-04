"use client";

type QueuedUploadItemProps = {
  fileName: string;
  status: "pending" | "uploading" | "failed";
  error?: string | null;
};

export function QueuedUploadItem({
  fileName,
  status,
  error,
}: QueuedUploadItemProps) {
  const statusLabel =
    status === "uploading"
      ? "Uploading…"
      : status === "failed"
        ? "Needs attention"
        : "Waiting to upload";

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-surface-container-high/60 px-3 py-2 text-sm ring-1 ring-outline-variant/10">
      <span className="truncate text-on-surface">{fileName}</span>
      <span className="shrink-0 text-xs text-on-surface-variant">{statusLabel}</span>
      {error ? (
        <span className="sr-only" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
