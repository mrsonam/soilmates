import { LayoutGrid, Sprout, Users } from "lucide-react";

type CollectionStatsCardsProps = {
  areaCount: number;
  plantCount: number;
  memberCount: number;
};

export function CollectionStatsCards({
  areaCount,
  plantCount,
  memberCount,
}: CollectionStatsCardsProps) {
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      <li className="rounded-3xl bg-surface-container-lowest p-6 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <LayoutGrid className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
              Areas
            </p>
            <p className="font-display text-2xl font-semibold tabular-nums text-on-surface">
              {areaCount}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          Rooms and spots in this collection
        </p>
      </li>
      <li className="rounded-3xl bg-surface-container-lowest p-6 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-primary-fixed/50 text-primary">
            <Sprout className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
              Plants
            </p>
            <p className="font-display text-2xl font-semibold tabular-nums text-on-surface">
              {plantCount}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          Across all areas
        </p>
      </li>
      <li className="rounded-3xl bg-surface-container-lowest p-6 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08]">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-2xl bg-[#f0d4dc]/40 text-[#6b5348]">
            <Users className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
              Members
            </p>
            <p className="font-display text-2xl font-semibold tabular-nums text-on-surface">
              {memberCount}
            </p>
          </div>
        </div>
        <p className="mt-3 text-xs text-on-surface-variant">
          Active collaborators
        </p>
      </li>
    </ul>
  );
}
