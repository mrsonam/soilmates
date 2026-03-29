import type { ReactNode } from "react";

type PlantsScreenHeaderProps = {
  eyebrow: string;
  title: string;
  description: ReactNode;
  /** e.g. primary link button aligned to the end on larger screens */
  actions?: ReactNode;
};

/**
 * Shared page chrome for global `/plants`, collection plant list, and add-plant flow.
 * Matches: small eyebrow, `text-xl` title, relaxed body copy.
 */
export function PlantsScreenHeader({
  eyebrow,
  title,
  description,
  actions,
}: PlantsScreenHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 flex-1">
        <p className="text-sm text-on-surface-variant">{eyebrow}</p>
        <h2 className="mt-1 font-display text-xl font-semibold text-on-surface">
          {title}
        </h2>
        <div className="mt-4 max-w-lg text-sm leading-relaxed text-on-surface-variant">
          {description}
        </div>
      </div>
      {actions ? <div className="shrink-0">{actions}</div> : null}
    </div>
  );
}
