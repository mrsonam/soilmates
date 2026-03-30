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
        <div className="rounded-2xl bg-[#e8f0e4] px-4 py-3 ring-1 ring-[#d4e4cc]/80">
          <p className="text-2xl font-semibold tabular-nums text-[#3d5238]">
            {data.healthy}
          </p>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[#5a6b54]">
            Healthy
          </p>
        </div>
        <div className="rounded-2xl bg-[#f8ece8] px-4 py-3 ring-1 ring-[#f0dcd4]/90">
          <p className="text-2xl font-semibold tabular-nums text-[#8b5d52]">
            {data.thirsty}
          </p>
          <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-[#a67c72]">
            Thirsty
          </p>
        </div>
        <div className="rounded-2xl bg-surface-container-lowest px-4 py-4 shadow-sm ring-1 ring-outline-variant/[0.08]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-2xl font-semibold tabular-nums text-on-surface">
                {data.totalPlants}
              </p>
              <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
                Total plants
              </p>
            </div>
            <span className="flex size-10 items-center justify-center rounded-xl bg-surface-container-high text-on-surface-variant">
              <LayoutGrid className="size-5" strokeWidth={1.5} aria-hidden />
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
