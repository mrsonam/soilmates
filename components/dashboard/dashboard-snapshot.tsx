import { LayoutGrid } from "lucide-react";
import type { DashboardSnapshot as Snapshot } from "@/lib/dashboard/queries";

type DashboardSnapshotProps = {
  data: Snapshot;
};

export function DashboardSnapshot({ data }: DashboardSnapshotProps) {
  return (
    <section>
      <h3 className="font-display text-lg font-semibold text-on-surface">
        Snapshot
      </h3>
      <div className="mt-4 space-y-3">
        {/* Healthy Card */}
        <div className="rounded-[1.25rem] bg-[#e6f4ef] px-4 py-4 ring-1 ring-primary/10 transition-all hover:bg-[#d8efe8] dark:border-0 dark:bg-primary/10 dark:ring-1 dark:ring-primary/20 dark:hover:bg-primary/20">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-primary dark:text-primary-fixed">
            {data.healthy}
          </p>
          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-primary">
            Healthy
          </p>
        </div>

        {/* Thirsty Card */}
        <div className="rounded-[1.25rem] bg-[#fdf2ef] px-4 py-4 ring-1 ring-terracotta/10 transition-all hover:bg-[#fce5df] dark:border-0 dark:bg-terracotta/10 dark:ring-1 dark:ring-terracotta/20 dark:hover:bg-terracotta/20">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-terracotta">
            {data.thirsty}
          </p>
          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-terracotta">
            Thirsty
          </p>
        </div>

        {/* Total Plants Card */}
        <div className="rounded-[1.25rem] bg-surface-container-lowest px-4 py-4 shadow-sm ring-1 ring-outline-variant/20 transition-all hover:bg-surface dark:border-0 dark:bg-surface-container-highest dark:ring-1 dark:ring-outline-variant/10 dark:hover:bg-surface-container-high">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold tabular-nums tracking-tight text-on-surface">
                {data.totalPlants}
              </p>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-on-surface-variant">
                Total plants
              </p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-xl bg-surface text-on-surface-variant shadow-sm ring-1 ring-outline-variant/10 dark:bg-surface-container-high dark:ring-0">
              <LayoutGrid className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
