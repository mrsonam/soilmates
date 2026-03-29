import { careLogActionIcon, careLogActionLabel } from "./care-log-ui";

type CareLogActionBadgeProps = {
  actionType: string;
  className?: string;
};

export function CareLogActionBadge({
  actionType,
  className = "",
}: CareLogActionBadgeProps) {
  const Icon = careLogActionIcon(actionType);
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full bg-primary-fixed/35 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-primary",
        className,
      ].join(" ")}
    >
      <Icon className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
      {careLogActionLabel(actionType)}
    </span>
  );
}
