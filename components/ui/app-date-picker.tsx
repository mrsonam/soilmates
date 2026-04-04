"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { computeFloatingDropdownPosition } from "@/components/ui/floating-dropdown-position";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function parseYmd(s: string): { y: number; m: number; d: number } | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (mo < 1 || mo > 12 || d < 1 || d > 31) return null;
  const dt = new Date(y, mo - 1, d);
  if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d)
    return null;
  return { y, m: mo, d };
}

function toYmd(y: number, m: number, d: number) {
  return `${y}-${pad2(m)}-${pad2(d)}`;
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

/** Sunday = 0 */
function firstWeekdayOfMonth(y: number, m: number) {
  return new Date(y, m - 1, 1).getDay();
}

function isBeforeYmd(
  a: { y: number; m: number; d: number },
  b: { y: number; m: number; d: number },
) {
  if (a.y !== b.y) return a.y < b.y;
  if (a.m !== b.m) return a.m < b.m;
  return a.d < b.d;
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

type AppDatePickerProps = {
  id?: string;
  name?: string;
  form?: string;
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
};

const triggerClass =
  "flex w-full min-w-0 items-center justify-between gap-2 rounded-2xl bg-surface-container-lowest px-4 py-3.5 text-left text-sm text-on-surface shadow-(--shadow-ambient) ring-1 ring-outline-variant/10 outline-none transition focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60";

export function AppDatePicker({
  id: idProp,
  name,
  form,
  value,
  onChange,
  min,
  max,
  disabled,
  placeholder = "Pick a date",
  className = "",
}: AppDatePickerProps) {
  const autoId = useId();
  const id = idProp ?? `app-date-${autoId}`;
  const panelId = `${id}-panel`;
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const parsed = value ? parseYmd(value) : null;
  const minP = min ? parseYmd(min) : null;
  const maxP = max ? parseYmd(max) : null;

  const today = useMemo(() => {
    const n = new Date();
    return { y: n.getFullYear(), m: n.getMonth() + 1, d: n.getDate() };
  }, []);

  const initialView = parsed ?? today;
  const [viewY, setViewY] = useState(initialView.y);
  const [viewM, setViewM] = useState(initialView.m);

  useEffect(() => {
    if (parsed) {
      setViewY(parsed.y);
      setViewM(parsed.m);
    }
  }, [parsed?.y, parsed?.m, parsed]);

  const label = useMemo(() => {
    if (!parsed) return null;
    const dt = new Date(parsed.y, parsed.m - 1, parsed.d);
    return dt.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }, [parsed]);

  const updatePos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const width = Math.max(r.width, 280);
    const maxCap = Math.min(22 * 16, window.innerHeight * 0.85);
    setPanelPos(
      computeFloatingDropdownPosition(r, {
        width,
        maxPanelHeightCapPx: maxCap,
      }),
    );
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      setPanelPos(null);
      return;
    }
    updatePos();
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => updatePos();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    };
  }, [open, updatePos]);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  function dayDisabled(y: number, m: number, d: number): boolean {
    const cur = { y, m, d };
    if (minP && isBeforeYmd(cur, minP)) return true;
    if (maxP && isBeforeYmd(maxP, cur)) return true;
    return false;
  }

  const grid = useMemo(() => {
    const dim = daysInMonth(viewY, viewM);
    const first = firstWeekdayOfMonth(viewY, viewM);
    const cells: ({ y: number; m: number; d: number } | null)[] = [];
    for (let i = 0; i < first; i++) cells.push(null);
    for (let d = 1; d <= dim; d++) cells.push({ y: viewY, m: viewM, d });
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewY, viewM]);

  function prevMonth() {
    setViewM((m) => {
      if (m <= 1) {
        setViewY((y) => y - 1);
        return 12;
      }
      return m - 1;
    });
  }

  function nextMonth() {
    setViewM((m) => {
      if (m >= 12) {
        setViewY((y) => y + 1);
        return 1;
      }
      return m + 1;
    });
  }

  const monthTitle = useMemo(
    () =>
      new Date(viewY, viewM - 1, 1).toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [viewY, viewM],
  );

  useLayoutEffect(() => {
    if (!open || !panelPos) return;
    const el = panelRef.current;
    if (!el || typeof el.showPopover !== "function") return;
    el.showPopover();
    return () => {
      try {
        el.hidePopover();
      } catch {
        /* already hidden */
      }
    };
  }, [open, panelPos]);

  const portal =
    open && panelPos && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            id={panelId}
            role="group"
            aria-label="Choose date"
            popover="manual"
            className="overflow-y-auto rounded-2xl bg-surface-container-lowest p-3 shadow-(--shadow-ambient) ring-1 ring-outline-variant/15"
            style={{
              position: "fixed",
              top: panelPos.top,
              left: panelPos.left,
              width: panelPos.width,
              maxHeight: panelPos.maxHeight,
              boxSizing: "border-box",
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                onClick={prevMonth}
                aria-label="Previous month"
              >
                <ChevronLeft className="size-5" strokeWidth={1.75} aria-hidden />
              </button>
              <p className="min-w-0 flex-1 text-center font-display text-sm font-semibold text-on-surface">
                {monthTitle}
              </p>
              <button
                type="button"
                className="flex size-9 shrink-0 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-high hover:text-on-surface"
                onClick={nextMonth}
                aria-label="Next month"
              >
                <ChevronRight className="size-5" strokeWidth={1.75} aria-hidden />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-0.5 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
              {WEEKDAYS.map((w) => (
                <div key={w} className="py-1">
                  {w}
                </div>
              ))}
            </div>
            <div className="mt-1 grid grid-cols-7 gap-0.5">
              {grid.map((cell, i) => {
                if (!cell) {
                  return <div key={`e-${i}`} className="aspect-square" />;
                }
                const { y, m, d } = cell;
                const sel =
                  parsed &&
                  parsed.y === y &&
                  parsed.m === m &&
                  parsed.d === d;
                const isToday =
                  today.y === y && today.m === m && today.d === d;
                const dis = dayDisabled(y, m, d);
                return (
                  <button
                    key={`${y}-${m}-${d}`}
                    type="button"
                    disabled={dis}
                    onClick={() => {
                      onChange(toYmd(y, m, d));
                      setOpen(false);
                    }}
                    className={[
                      "flex aspect-square items-center justify-center rounded-xl text-sm font-medium transition",
                      dis
                        ? "cursor-not-allowed text-on-surface-variant/35"
                        : "text-on-surface hover:bg-primary-fixed/40",
                      sel
                        ? "bg-primary text-on-primary hover:bg-primary hover:text-on-primary"
                        : "",
                      !sel && isToday ? "ring-1 ring-primary/30" : "",
                    ].join(" ")}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
            <div className="mt-3 flex justify-end border-t border-outline-variant/10 pt-2">
              <button
                type="button"
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => {
                  onChange(toYmd(today.y, today.m, today.d));
                  setOpen(false);
                }}
              >
                Today
              </button>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div className={["relative min-w-0", className].join(" ")}>
      {name ? (
        <input type="hidden" name={name} form={form} value={value} readOnly />
      ) : null}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className={triggerClass}
      >
        <span className="min-w-0 flex-1 truncate">
          {label ? (
            label
          ) : (
            <span className="text-on-surface-variant/80">{placeholder}</span>
          )}
        </span>
        <Calendar
          className="size-4 shrink-0 text-primary"
          strokeWidth={1.75}
          aria-hidden
        />
      </button>
      {portal}
    </div>
  );
}
