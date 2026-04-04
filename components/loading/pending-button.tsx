import type { ButtonHTMLAttributes, ReactNode } from "react";

type PendingButtonProps = {
  pending?: boolean;
  pendingLabel?: ReactNode;
  children: ReactNode;
} & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children">;

/**
 * Primary action pattern: disables the control and surfaces `aria-busy` while work runs.
 */
export function PendingButton({
  pending = false,
  pendingLabel = "Saving…",
  children,
  disabled,
  className = "",
  ...rest
}: PendingButtonProps) {
  return (
    <button
      type="button"
      disabled={Boolean(disabled) || pending}
      aria-busy={pending}
      className={className}
      {...rest}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
