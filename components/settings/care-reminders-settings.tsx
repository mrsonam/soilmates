"use client";

import type {
  CareSensitivity,
  ReminderPreferredWindow,
} from "@prisma/client";
import { useEffect, useState } from "react";
import { AppSelect } from "@/components/ui/app-select";
import {
  utcMinutesToTimeValue,
  utcTimeValueToMinutes,
} from "@/lib/push/subscription-client";
import { useAutoSaveSettings } from "@/hooks/use-auto-save-settings";
import { PendingButton } from "@/components/loading/pending-button";
import { AutoSaveStatus } from "./auto-save-status";

const WINDOW_OPTIONS: { value: ReminderPreferredWindow; label: string }[] = [
  { value: "flexible", label: "Flexible — any time" },
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
];

const SENSITIVITY_OPTIONS: {
  value: CareSensitivity;
  label: string;
  hint: string;
}[] = [
  {
    value: "relaxed",
    label: "Relaxed",
    hint: "Fewer cautious nudges",
  },
  {
    value: "standard",
    label: "Standard",
    hint: "Balanced guidance",
  },
  {
    value: "cautious",
    label: "Cautious",
    hint: "More conservative reminders later",
  },
];

type Props = {
  preferredNotificationWindow: ReminderPreferredWindow | null;
  notificationQuietStartMinute: number | null;
  notificationQuietEndMinute: number | null;
  careSensitivity: CareSensitivity;
};

export function CareRemindersSettings({
  preferredNotificationWindow: initialWindow,
  notificationQuietStartMinute: startMin,
  notificationQuietEndMinute: endMin,
  careSensitivity: initialSensitivity,
}: Props) {
  const { save, status, error } = useAutoSaveSettings();
  const [windowPref, setWindowPref] = useState<ReminderPreferredWindow>(
    initialWindow ?? "flexible",
  );
  const [quietEnabled, setQuietEnabled] = useState(
    startMin != null && endMin != null,
  );
  const [quietStart, setQuietStart] = useState(
    startMin != null ? utcMinutesToTimeValue(startMin) : "22:00",
  );
  const [quietEnd, setQuietEnd] = useState(
    endMin != null ? utcMinutesToTimeValue(endMin) : "07:00",
  );
  const [sensitivity, setSensitivity] =
    useState<CareSensitivity>(initialSensitivity);

  useEffect(() => {
    setWindowPref(initialWindow ?? "flexible");
    setQuietEnabled(startMin != null && endMin != null);
    if (startMin != null) setQuietStart(utcMinutesToTimeValue(startMin));
    if (endMin != null) setQuietEnd(utcMinutesToTimeValue(endMin));
    setSensitivity(initialSensitivity);
  }, [initialWindow, startMin, endMin, initialSensitivity]);

  return (
    <div className="space-y-8">
      <div>
        <label className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Preferred reminder window
        </label>
        <p className="mt-1 text-sm text-on-surface-variant">
          We&apos;ll prefer this part of the day for gentle &quot;due soon&quot;
          nudges. Overdue alerts still respect quiet hours.
        </p>
        <div className="mt-3 max-w-md">
          <AppSelect
            options={WINDOW_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            value={windowPref}
            disabled={status === "saving"}
            onChange={(v) => {
              const next = v as ReminderPreferredWindow;
              setWindowPref(next);
              void save({ preferredNotificationWindow: next });
            }}
          />
        </div>
      </div>

      <div>
        <label
          className={`flex items-center gap-2 ${status === "saving" ? "cursor-wait opacity-80" : "cursor-pointer"}`}
        >
          <input
            type="checkbox"
            className="size-4 rounded border-outline-variant"
            checked={quietEnabled}
            disabled={status === "saving"}
            onChange={(e) => {
              const on = e.target.checked;
              setQuietEnabled(on);
              if (!on) {
                void save({
                  notificationQuietStartMinute: null,
                  notificationQuietEndMinute: null,
                });
              }
            }}
          />
          <span className="text-sm font-medium text-on-surface">
            Quiet hours (UTC)
          </span>
        </label>
        <p className="mt-1 text-sm text-on-surface-variant">
          We won&apos;t send push reminders during this window. Times use UTC on
          the server for now.
        </p>
        {quietEnabled ? (
          <div className="mt-4 flex flex-wrap items-end gap-4">
            <div>
              <span className="text-xs text-on-surface-variant">From</span>
              <input
                type="time"
                value={quietStart}
                disabled={status === "saving"}
                onChange={(e) => setQuietStart(e.target.value)}
                className="mt-1 block max-w-[11rem] rounded-2xl border-0 bg-surface-container-lowest px-3 py-2 text-sm shadow-(--shadow-ambient) ring-1 ring-outline-variant/10 disabled:opacity-60"
              />
            </div>
            <div>
              <span className="text-xs text-on-surface-variant">To</span>
              <input
                type="time"
                value={quietEnd}
                disabled={status === "saving"}
                onChange={(e) => setQuietEnd(e.target.value)}
                className="mt-1 block max-w-[11rem] rounded-2xl border-0 bg-surface-container-lowest px-3 py-2 text-sm shadow-(--shadow-ambient) ring-1 ring-outline-variant/10 disabled:opacity-60"
              />
            </div>
            <PendingButton
              type="button"
              pending={status === "saving"}
              pendingLabel="Saving…"
              onClick={() => {
                const a = utcTimeValueToMinutes(quietStart);
                const b = utcTimeValueToMinutes(quietEnd);
                if (a == null || b == null) return;
                void save({
                  notificationQuietStartMinute: a,
                  notificationQuietEndMinute: b,
                });
              }}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-on-primary shadow-sm transition hover:bg-primary/90"
            >
              Apply quiet hours
            </PendingButton>
          </div>
        ) : null}
      </div>

      <div>
        <label className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Care sensitivity
        </label>
        <p className="mt-1 text-sm text-on-surface-variant">
          How conservative Soil Mates should be with care nudges and reminders
          over time.
        </p>
        <div
          className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap"
          role="radiogroup"
          aria-label="Care sensitivity"
        >
          {SENSITIVITY_OPTIONS.map((o) => {
            const active = sensitivity === o.value;
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={status === "saving"}
                onClick={() => {
                  setSensitivity(o.value);
                  void save({ careSensitivity: o.value });
                }}
                className={`flex flex-1 flex-col rounded-2xl px-4 py-3 text-left ring-1 transition disabled:opacity-60 sm:min-w-[8.5rem] ${
                  active
                    ? "bg-primary/12 ring-primary/40"
                    : "bg-surface-container-high/80 ring-outline-variant/10 hover:bg-surface-container-high"
                }`}
              >
                <span className="text-sm font-medium text-on-surface">
                  {o.label}
                </span>
                <span className="mt-0.5 text-xs text-on-surface-variant">
                  {o.hint}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <AutoSaveStatus status={status} error={error} />
    </div>
  );
}
