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
        <div className="rounded-[1.25rem] bg-[#e6f4ef] px-4 py-4 ring-1 ring-primary/10 transition-all hover:bg-[#d8efe8] dark:bg-primary/15 dark:ring-primary/20 dark:hover:bg-primary/20">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-primary dark:text-primary-fixed">
            {data.healthy}
          </p>
          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-primary">
            Healthy
          </p>
        </div>
        <div className="rounded-[1.25rem] bg-[#fdf2ef] px-4 py-4 ring-1 ring-terracotta/10 transition-all hover:bg-[#fce5df] dark:bg-terracotta/15 dark:ring-terracotta/20 dark:hover:bg-terracotta/20">
          <p className="text-2xl font-bold tabular-nums tracking-tight text-terracotta">
            {data.thirsty}
          </p>
          <p className="text-[0.65rem] font-bold uppercase tracking-wide text-terracotta">
            Thirsty
          </p>
        </div>
        <div className="rounded-[1.25rem] bg-surface-container-highest px-4 py-4 shadow-sm ring-1 ring-outline-variant/10 transition-all hover:bg-surface-container-high">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-bold tabular-nums tracking-tight text-on-surface">
                {data.totalPlants}
              </p>
              <p className="text-[0.65rem] font-bold uppercase tracking-wider text-on-surface-variant">
                Total plants
              </p>
            </div>
            <span className="flex size-11 items-center justify-center rounded-xl bg-surface text-on-surface-variant shadow-sm ring-1 ring-outline-variant/10">
              <LayoutGrid className="size-5" strokeWidth={1.75} aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
