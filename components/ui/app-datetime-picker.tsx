"use client";

import { AppDatePicker } from "@/components/ui/app-date-picker";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function splitLocalDateTime(v: string): { date: string; time: string } {
  const t = v.indexOf("T");
  const now = new Date();
  const fallbackTime = `${pad2(now.getHours())}:${pad2(now.getMinutes())}`;
  if (t === -1) {
    return { date: "", time: fallbackTime };
  }
  const date = v.slice(0, t);
  const tm = v.slice(t + 1);
  const time = /^\d{2}:\d{2}/.test(tm) ? tm.slice(0, 5) : fallbackTime;
  return { date, time };
}

function mergeLocalDateTime(date: string, time: string) {
  const now = new Date();
  const fd =
    date ||
    `${now.getFullYear()}-${pad2(now.getMonth() + 1)}-${pad2(now.getDate())}`;
  const ft = /^\d{2}:\d{2}$/.test(time) ? time : "12:00";
  return `${fd}T${ft}`;
}

const timeFieldClass =
  "w-full min-w-[8.5rem] rounded-2xl border-0 bg-surface-container-lowest px-4 py-3.5 text-sm text-on-surface shadow-(--shadow-ambient) ring-1 ring-outline-variant/10 outline-none transition focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60";

type AppDateTimePickerProps = {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  className?: string;
};

export function AppDateTimePicker({
  id,
  value,
  onChange,
  disabled,
  className = "",
}: AppDateTimePickerProps) {
  const { date, time } = splitLocalDateTime(value);

  return (
    <div
      className={["flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end", className].join(
        " ",
      )}
    >
      <div className="min-w-0 flex-1 sm:max-w-[min(100%,20rem)]">
        <AppDatePicker
          id={id ? `${id}-date` : undefined}
          value={date}
          onChange={(d) => onChange(mergeLocalDateTime(d, time))}
          disabled={disabled}
          placeholder="Date"
        />
      </div>
      <div className="min-w-0 sm:w-40">
        <label htmlFor={id ? `${id}-time` : undefined} className="sr-only">
          Time
        </label>
        <input
          id={id ? `${id}-time` : undefined}
          type="time"
          value={time}
          disabled={disabled}
          onChange={(e) => onChange(mergeLocalDateTime(date, e.target.value))}
          className={timeFieldClass}
        />
      </div>
    </div>
  );
}
