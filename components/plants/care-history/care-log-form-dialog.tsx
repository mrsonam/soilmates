"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { AppDateTimePicker } from "@/components/ui/app-datetime-picker";
import type { CareLogListItem } from "@/lib/plants/care-logs";
import {
  createDetailedCareLogAction,
  updateCareLogAction,
} from "@/app/(app)/collections/[collectionSlug]/plants/care-log-mutations";
import type { CareLogActionTypeValue } from "@/lib/validations/care-log";
import {
  buildCareLogMetadata,
  parseTagsInput,
  type CareLogFormMetaFields,
} from "./care-log-metadata-helpers";
import {
  CARE_LOG_ACTION_OPTIONS,
  formatDateTimeLocal,
} from "./care-log-ui";

type CareLogFormDialogProps = {
  open: boolean;
  onClose: () => void;
  collectionSlug: string;
  plantSlug: string;
  mode: "add" | "edit";
  initialLog?: CareLogListItem | null;
};

function emptyMeta(): CareLogFormMetaFields {
  return {
    waterMl: "",
    fertilizerType: "",
    soilMix: "",
    harvestAmount: "",
    movedReason: "",
  };
}

export function CareLogFormDialog({
  open,
  onClose,
  collectionSlug,
  plantSlug,
  mode,
  initialLog,
}: CareLogFormDialogProps) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [actionType, setActionType] =
    useState<CareLogActionTypeValue>("watered");
  const [actionAtLocal, setActionAtLocal] = useState(() =>
    formatDateTimeLocal(new Date()),
  );
  const [notes, setNotes] = useState("");
  const [tagsRaw, setTagsRaw] = useState("");
  const [meta, setMeta] = useState<CareLogFormMetaFields>(emptyMeta);

  const resetFromLog = useCallback((log: CareLogListItem | null | undefined) => {
    if (log) {
      setActionType(log.actionType as CareLogActionTypeValue);
      setActionAtLocal(formatDateTimeLocal(new Date(log.actionAt)));
      setNotes(log.notes ?? "");
      setTagsRaw(log.tags.join(", "));
      const md = log.metadata;
      setMeta({
        waterMl:
          typeof md.waterAmountMl === "number"
            ? String(md.waterAmountMl)
            : typeof md.waterAmountMl === "string"
              ? md.waterAmountMl
              : "",
        fertilizerType:
          typeof md.fertilizerType === "string" ? md.fertilizerType : "",
        soilMix: typeof md.soilMix === "string" ? md.soilMix : "",
        harvestAmount:
          typeof md.harvestAmount === "string" ? md.harvestAmount : "",
        movedReason: typeof md.movedReason === "string" ? md.movedReason : "",
      });
    } else {
      setActionType("watered");
      setActionAtLocal(formatDateTimeLocal(new Date()));
      setNotes("");
      setTagsRaw("");
      setMeta(emptyMeta());
    }
    setError(null);
  }, []);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) {
      resetFromLog(mode === "edit" ? initialLog ?? null : null);
      el.showModal();
    } else {
      el.close();
    }
  }, [open, mode, initialLog, resetFromLog]);

  const showWater = actionType === "watered" || actionType === "misted";
  const showFert = actionType === "fertilized";
  const showSoil =
    actionType === "repotted" || actionType === "soil_changed";
  const showHarvest = actionType === "harvested";
  const showMoved =
    actionType === "moved_location" || actionType === "rotated";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const actionAt = new Date(actionAtLocal);
    if (Number.isNaN(actionAt.getTime())) {
      setError("Enter a valid date and time.");
      return;
    }

    const tags = parseTagsInput(tagsRaw);
    const metadata = buildCareLogMetadata(actionType, meta);

    setPending(true);
    try {
      if (mode === "add") {
        const res = await createDetailedCareLogAction({
          collectionSlug,
          plantSlug,
          actionType,
          actionAt: actionAt.toISOString(),
          notes: notes.trim() || undefined,
          tags,
          metadata,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
      } else if (initialLog) {
        const res = await updateCareLogAction({
          collectionSlug,
          plantSlug,
          careLogId: initialLog.id,
          actionType,
          actionAt: actionAt.toISOString(),
          notes: notes.trim() || undefined,
          tags,
          metadata,
        });
        if (!res.ok) {
          setError(res.error);
          return;
        }
      }
      onClose();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  const title =
    mode === "add" ? "Add detailed log" : "Edit care log";
  const subtitle =
    mode === "add"
      ? "Record care activities for this plant."
      : "Update this entry. Only you can edit logs you created.";

  return (
    <dialog
      ref={dialogRef}
      className="fixed left-1/2 top-1/2 z-60 w-[min(100vw-1rem,32rem)] max-h-[min(92dvh,44rem)] -translate-x-1/2 -translate-y-1/2 modal-scroll rounded-3xl border-0 bg-surface-container-lowest p-0 shadow-[0_28px_56px_-16px_rgba(27,28,26,0.18)] backdrop:bg-on-surface/25 backdrop:backdrop-blur-sm sm:w-[min(100vw-2rem,36rem)]"
      aria-labelledby="care-log-form-title"
      onClose={onClose}
      onCancel={(ev) => {
        ev.preventDefault();
        onClose();
      }}
    >
      {open ? (
        <form onSubmit={handleSubmit} className="p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2
                id="care-log-form-title"
                className="font-display text-xl font-semibold tracking-tight text-on-surface"
              >
                {title}
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">{subtitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl p-2 text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
              aria-label="Close"
            >
              <X className="size-5" strokeWidth={1.5} aria-hidden />
            </button>
          </div>

          {error ? (
            <p
              className="mt-4 rounded-2xl bg-surface-container-low px-3 py-2.5 text-sm text-on-surface-variant"
              role="alert"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-6">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant">
              Action type
            </p>
            <div className="modal-scroll mt-2 flex max-h-40 flex-wrap gap-2 pr-1">
              {CARE_LOG_ACTION_OPTIONS.map(({ value, label, Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setActionType(value)}
                  className={[
                    "inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition sm:text-sm",
                    actionType === value
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-high text-on-surface ring-1 ring-outline-variant/10 hover:bg-surface-container-highest",
                  ].join(" ")}
                >
                  <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <label
              htmlFor="care-log-when"
              className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
            >
              When
            </label>
            <div className="mt-2">
              <AppDateTimePicker
                id="care-log-when"
                value={actionAtLocal}
                onChange={setActionAtLocal}
                disabled={pending}
              />
            </div>
          </div>

          {showWater ? (
            <div className="mt-4">
              <label
                htmlFor="care-log-ml"
                className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
              >
                Amount (ml)
              </label>
              <input
                id="care-log-ml"
                type="number"
                min={0}
                step={1}
                placeholder="500"
                value={meta.waterMl}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, waterMl: e.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-transparent bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
              />
            </div>
          ) : null}

          {showFert ? (
            <div className="mt-4">
              <label
                htmlFor="care-log-fert"
                className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
              >
                Fertilizer type
              </label>
              <input
                id="care-log-fert"
                type="text"
                placeholder="e.g. Organic seaweed"
                value={meta.fertilizerType}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, fertilizerType: e.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-transparent bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
              />
            </div>
          ) : null}

          {showSoil ? (
            <div className="mt-4">
              <label
                htmlFor="care-log-soil"
                className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
              >
                Soil / mix notes
              </label>
              <input
                id="care-log-soil"
                type="text"
                placeholder="e.g. Chunky aroid mix"
                value={meta.soilMix}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, soilMix: e.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-transparent bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
              />
            </div>
          ) : null}

          {showHarvest ? (
            <div className="mt-4">
              <label
                htmlFor="care-log-harvest"
                className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
              >
                Harvest amount
              </label>
              <input
                id="care-log-harvest"
                type="text"
                placeholder="e.g. 4 sprigs"
                value={meta.harvestAmount}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, harvestAmount: e.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-transparent bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
              />
            </div>
          ) : null}

          {showMoved ? (
            <div className="mt-4">
              <label
                htmlFor="care-log-moved"
                className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
              >
                Note
              </label>
              <input
                id="care-log-moved"
                type="text"
                placeholder="e.g. Closer to east window"
                value={meta.movedReason}
                onChange={(e) =>
                  setMeta((m) => ({ ...m, movedReason: e.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-transparent bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
              />
            </div>
          ) : null}

          <div className="mt-4">
            <label
              htmlFor="care-log-notes"
              className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
            >
              Notes & observations
            </label>
            <textarea
              id="care-log-notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Soil was dry to the touch…"
              className="mt-2 w-full resize-none rounded-2xl border border-transparent bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
            />
          </div>

          <div className="mt-4">
            <label
              htmlFor="care-log-tags"
              className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-on-surface-variant"
            >
              Tags
            </label>
            <input
              id="care-log-tags"
              type="text"
              value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              placeholder="routine, filtered water (comma-separated)"
              className="mt-2 w-full rounded-2xl border border-transparent bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
            />
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-full px-6 text-sm font-medium text-on-surface-variant transition hover:text-on-surface"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={pending}
              className="h-11 rounded-full bg-primary px-8 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-60"
            >
              {pending ? "Saving…" : mode === "add" ? "Save log" : "Save changes"}
            </button>
          </div>
        </form>
      ) : null}
    </dialog>
  );
}
