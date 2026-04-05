"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

export type PendingButtonProps = {
  pending?: boolean;
  pendingLabel?: ReactNode;
  /** Show spinner beside pending label (default true). */
  showSpinner?: boolean;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/**
 * Primary / destructive actions: disables while pending, sets `aria-busy`, shows spinner + label.
 */
export function PendingButton({
  pending = false,
  pendingLabel = "Saving…",
  showSpinner = true,
  children,
  className = "",
  disabled,
  ...rest
}: PendingButtonProps) {
  return (
    <button
      {...rest}
      disabled={Boolean(disabled) || pending}
      aria-busy={pending}
      className={className}
    >
      {pending ? (
        <span className="inline-flex items-center justify-center gap-2">
          {showSpinner ? (
            <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
          ) : null}
          <span>{pendingLabel}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/** Icon-only submit (e.g. assistant send): swaps icon for spinner while pending. */
export function PendingIconButton({
  pending,
  icon,
  pendingLabel = "Sending…",
  className = "",
  disabled,
  "aria-label": ariaLabel = "Submit",
  type = "submit",
  ...rest
}: Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  pending: boolean;
  icon: ReactNode;
  pendingLabel?: string;
}) {
  return (
    <button
      {...rest}
      type={type}
      disabled={Boolean(disabled) || pending}
      aria-busy={pending}
      aria-label={pending ? pendingLabel : ariaLabel}
      className={className}
    >
      {pending ? (
        <Loader2 className="size-5 shrink-0 animate-spin" aria-hidden />
      ) : (
        icon
      )}
    </button>
  );
}

type ActionSectionStatusProps = {
  /** When true, shows a compact status strip above children. */
  busy: boolean;
  label?: string;
  children?: ReactNode;
  className?: string;
};

/** Non-blocking section feedback while an async action runs (no optimistic data). */
export function ActionSectionStatus({
  busy,
  label = "Processing…",
  children,
  className = "",
}: ActionSectionStatusProps) {
  if (!busy) return children ?? null;
  return (
    <div className={className}>
      <p
        className="mb-3 flex items-center gap-2 rounded-2xl bg-primary/8 px-3 py-2 text-sm font-medium text-primary ring-1 ring-primary/15"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
        {label}
      </p>
      {children}
    </div>
  );
}
