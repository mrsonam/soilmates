import type { LucideIcon } from "lucide-react";

type QuickCareActionButtonProps = {
  label: string;
  Icon: LucideIcon;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
};

export function QuickCareActionButton({
  label,
  Icon,
  active,
  disabled,
  onClick,
}: QuickCareActionButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={[
        "flex min-w-[5.5rem] flex-1 flex-col items-center gap-2 rounded-2xl px-3 py-3.5 text-center transition sm:min-w-0 sm:flex-none sm:px-5 sm:py-4",
        active
          ? "bg-primary text-on-primary shadow-sm ring-1 ring-primary/20"
          : "bg-surface-container-high/90 text-on-surface ring-1 ring-outline-variant/10 hover:bg-surface-container-highest",
        disabled ? "cursor-not-allowed opacity-50" : "",
      ].join(" ")}
    >
      <Icon
        className={[
          "size-6 shrink-0",
          active ? "text-on-primary" : "text-primary/85",
        ].join(" ")}
        strokeWidth={1.75}
        aria-hidden
      />
      <span className="text-xs font-semibold leading-tight sm:text-[0.8125rem]">
        {label}
      </span>
    </button>
  );
}
