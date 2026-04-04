"use client";

import { useState } from "react";
import { Download, FileJson, Table } from "lucide-react";

export function ExportDataCard() {
  const [loading, setLoading] = useState<string | null>(null);

  async function download(url: string, filename: string) {
    setLoading(filename);
    try {
      const res = await fetch(url, { credentials: "same-origin" });
      if (!res.ok) {
        throw new Error("Download failed");
      }
      const blob = await res.blob();
      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(href);
    } catch {
      window.location.assign(url);
    } finally {
      setLoading(null);
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-on-surface-variant">
        Download everything Soil Mates holds for your spaces — for backups,
        moving tools, or your own records. Only collections you belong to are
        included.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={loading !== null}
          onClick={() =>
            download(
              "/api/me/export?format=json",
              `soilmates-export-${stamp}.json`,
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-2.5 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-50"
        >
          <FileJson className="size-4" strokeWidth={1.75} aria-hidden />
          {loading?.endsWith(".json") ? "Preparing…" : "Download JSON"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() =>
            download(
              "/api/me/export?format=csv&kind=plants",
              `soilmates-plants-${stamp}.csv`,
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-surface-container-high px-4 py-2.5 text-sm font-medium text-on-surface ring-1 ring-outline-variant/20 hover:bg-surface-container-highest disabled:opacity-50"
        >
          <Table className="size-4" strokeWidth={1.75} aria-hidden />
          {loading?.includes("plants") ? "Preparing…" : "Plants CSV"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() =>
            download(
              "/api/me/export?format=csv&kind=care_logs",
              `soilmates-care-logs-${stamp}.csv`,
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-surface-container-high px-4 py-2.5 text-sm font-medium text-on-surface ring-1 ring-outline-variant/20 hover:bg-surface-container-highest disabled:opacity-50"
        >
          <Download className="size-4" strokeWidth={1.75} aria-hidden />
          {loading?.includes("care-logs") ? "Preparing…" : "Care logs CSV"}
        </button>
        <button
          type="button"
          disabled={loading !== null}
          onClick={() =>
            download(
              "/api/me/export?format=csv&kind=reminders",
              `soilmates-reminders-${stamp}.csv`,
            )
          }
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-surface-container-high px-4 py-2.5 text-sm font-medium text-on-surface ring-1 ring-outline-variant/20 hover:bg-surface-container-highest disabled:opacity-50"
        >
          <Download className="size-4" strokeWidth={1.75} aria-hidden />
          {loading?.includes("reminders") ? "Preparing…" : "Reminders CSV"}
        </button>
      </div>
      <p className="text-xs text-on-surface-variant/90">
        JSON includes nested plants, areas, care logs, reminders, image
        metadata, and diagnoses. Photos themselves stay in your private storage.
      </p>
    </div>
  );
}
