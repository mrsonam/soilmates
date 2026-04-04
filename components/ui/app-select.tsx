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
import { ChevronDown, Check } from "lucide-react";
import { computeFloatingDropdownPosition } from "@/components/ui/floating-dropdown-position";

export type AppSelectOption = { value: string; label: string };

type AppSelectProps = {
  id?: string;
  name?: string;
  /** For uncontrolled form posts when `name` is set */
  form?: string;
  options: AppSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** Compact toolbar style (search filters) */
  variant?: "default" | "toolbar";
  className?: string;
  "aria-label"?: string;
};

const triggerBase =
  "flex w-full min-w-0 items-center justify-between gap-2 text-left text-sm text-on-surface shadow-(--shadow-ambient) ring-1 ring-outline-variant/10 outline-none transition focus-visible:ring-2 focus-visible:ring-primary/35 disabled:cursor-not-allowed disabled:opacity-60";

const triggerDefault =
  "rounded-2xl bg-surface-container-lowest px-4 py-3.5";
const triggerToolbar =
  "h-10 rounded-2xl bg-surface-container-high py-2 pl-3 pr-3";

export function AppSelect({
  id: idProp,
  name,
  form,
  options,
  value,
  onChange,
  placeholder = "Choose…",
  disabled,
  required,
  variant = "default",
  className = "",
  "aria-label": ariaLabel,
}: AppSelectProps) {
  const autoId = useId();
  const id = idProp ?? `app-select-${autoId}`;
  const listboxId = `${id}-listbox`;
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);

  const selected = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const updatePos = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const maxCap = Math.min(18 * 16, window.innerHeight * 0.7);
    setPanelPos(
      computeFloatingDropdownPosition(r, {
        width: r.width,
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

  useEffect(() => {
    if (!open) return;
    const idx = Math.max(
      0,
      options.findIndex((o) => o.value === value),
    );
    setHighlight(idx);
  }, [open, options, value]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;
      if (e.key === "Escape") {
        setOpen(false);
        return;
      }
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (!open) {
          setOpen(true);
          return;
        }
        const opt = options[highlight];
        if (opt) onChange(opt.value);
        setOpen(false);
        return;
      }
      if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        e.preventDefault();
        setOpen(true);
        return;
      }
      if (open && e.key === "ArrowDown") {
        e.preventDefault();
        setHighlight((h) => Math.min(options.length - 1, h + 1));
      }
      if (open && e.key === "ArrowUp") {
        e.preventDefault();
        setHighlight((h) => Math.max(0, h - 1));
      }
    },
    [disabled, highlight, onChange, open, options],
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

  const list =
    open && panelPos && typeof document !== "undefined"
      ? createPortal(
        <div
          ref={panelRef}
          id={listboxId}
          role="listbox"
          popover="manual"
          className="overflow-y-auto rounded-2xl bg-surface-container-lowest p-1.5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/15"
          style={{
            position: "fixed",
            top: panelPos.top,
            left: panelPos.left,
            width: panelPos.width,
            maxHeight: panelPos.maxHeight,
            boxSizing: "border-box",
          }}
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isHi = i === highlight;
            return (
              <button
                key={opt.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                className={[
                  "flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left text-sm transition",
                  isHi
                    ? "bg-primary-fixed/35 text-on-surface"
                    : "text-on-surface hover:bg-surface-container-high",
                  isSelected ? "font-medium text-primary" : "",
                ].join(" ")}
                onMouseEnter={() => setHighlight(i)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span className="min-w-0 truncate">{opt.label}</span>
                {isSelected ? (
                  <Check className="size-4 shrink-0 text-primary" strokeWidth={2} aria-hidden />
                ) : null}
              </button>
            );
          })}
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
        aria-controls={listboxId}
        aria-haspopup="listbox"
        aria-label={ariaLabel}
        aria-required={required}
        role="combobox"
        onKeyDown={onKeyDown}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={[
          triggerBase,
          variant === "toolbar" ? triggerToolbar : triggerDefault,
        ].join(" ")}
      >
        <span className="min-w-0 flex-1 truncate text-on-surface">
          {selected ? selected.label : <span className="text-on-surface-variant/80">{placeholder}</span>}
        </span>
        <ChevronDown
          className={[
            "size-4 shrink-0 text-on-surface-variant transition",
            open ? "rotate-180" : "",
          ].join(" ")}
          strokeWidth={2}
          aria-hidden
        />
      </button>
      {list}
    </div>
  );
}
