import { RouteLoadingShell } from "./route-loading-shell";
import { SkeletonBlock, SkeletonLine } from "./skeleton-primitives";

/** Default segment fallback — balanced blocks, works for most routes. */
export function AppSegmentLoadingFallback() {
  return (
    <RouteLoadingShell>
      <div className="space-y-8">
        <div className="space-y-3">
          <SkeletonBlock className="h-7 w-52 max-w-[85%]" />
          <SkeletonLine className="h-3.5 w-72 max-w-full" />
        </div>
        <SkeletonBlock className="h-44 w-full rounded-3xl sm:h-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <SkeletonBlock className="h-36" />
          <SkeletonBlock className="h-36" />
          <SkeletonBlock className="h-36 sm:col-span-2 lg:col-span-1" />
        </div>
      </div>
    </RouteLoadingShell>
  );
}

export function DashboardLoading() {
  return (
    <RouteLoadingShell wide>
      <div className="space-y-10">
        <div className="space-y-3">
          <SkeletonBlock className="h-9 w-64 max-w-[90%]" />
          <SkeletonLine className="h-4 w-96 max-w-full" />
        </div>
        <div className="grid gap-4 lg:grid-cols-3">
          <SkeletonBlock className="h-28 lg:col-span-2" />
          <SkeletonBlock className="h-28" />
        </div>
        <SkeletonBlock className="h-48 w-full rounded-3xl" />
        <div className="grid gap-4 md:grid-cols-2">
          <SkeletonBlock className="min-h-[14rem]" />
          <SkeletonBlock className="min-h-[14rem]" />
        </div>
      </div>
    </RouteLoadingShell>
  );
}

export function ListPageLoading() {
  return (
    <RouteLoadingShell>
      <div className="space-y-6">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-48" />
          <SkeletonLine className="h-3.5 w-full max-w-md" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[4.5rem] w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </RouteLoadingShell>
  );
}

export function CollectionDetailLoading() {
  return (
    <RouteLoadingShell>
      <div className="space-y-8">
        <div className="flex gap-2 overflow-hidden border-b border-outline-variant/10 pb-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-12 w-24 shrink-0 rounded-t-xl" />
          ))}
        </div>
        <SkeletonBlock className="h-56 w-full rounded-3xl sm:h-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-24" />
          ))}
        </div>
        <SkeletonBlock className="min-h-[12rem] w-full rounded-3xl" />
      </div>
    </RouteLoadingShell>
  );
}

export function PlantDetailLoading() {
  return (
    <RouteLoadingShell>
      <div className="space-y-8">
        <div className="flex gap-2 overflow-hidden border-b border-outline-variant/10 pb-px">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-12 w-20 shrink-0 rounded-t-xl sm:w-24" />
          ))}
        </div>
        <SkeletonBlock className="h-48 w-full rounded-3xl sm:h-56" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-11 w-28 rounded-2xl" />
          ))}
        </div>
        <div className="rounded-3xl bg-surface-container-lowest/40 p-4 ring-1 ring-outline-variant/[0.08] sm:p-6">
          <div className="flex gap-1 overflow-x-auto border-b border-outline-variant/10 pb-px">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-12 w-[5.5rem] shrink-0 rounded-t-xl" />
            ))}
          </div>
          <div className="mt-6 space-y-4">
            <SkeletonLine className="h-4 max-w-md w-[72%]" />
            <SkeletonLine className="h-4 w-full" />
            <SkeletonLine className="h-4 max-w-lg w-[84%]" />
            <SkeletonBlock className="mt-6 h-40 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </RouteLoadingShell>
  );
}

export function SettingsLoading() {
  return (
    <RouteLoadingShell narrow>
      <div className="space-y-8">
        <div className="space-y-2">
          <SkeletonBlock className="h-8 w-40" />
          <SkeletonLine className="h-3.5 w-full max-w-sm" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </RouteLoadingShell>
  );
}

export function AssistantPageLoading() {
  return (
    <RouteLoadingShell>
      <div className="flex min-h-[min(70vh,36rem)] flex-col">
        <div className="mb-4 space-y-2">
          <SkeletonBlock className="h-8 w-56" />
          <SkeletonLine className="h-3.5 w-80 max-w-full" />
        </div>
        <div className="flex flex-1 flex-col justify-end space-y-3 rounded-3xl bg-surface-container-low/50 p-4 ring-1 ring-outline-variant/[0.08]">
          <SkeletonBlock className="ml-0 mr-auto h-16 w-[88%] max-w-xl rounded-2xl rounded-bl-md" />
          <SkeletonBlock className="ml-auto mr-0 h-24 w-[82%] max-w-xl rounded-2xl rounded-br-md" />
          <SkeletonBlock className="ml-0 mr-auto h-20 w-[80%] max-w-lg rounded-2xl rounded-bl-md" />
        </div>
        <SkeletonBlock className="mt-4 h-14 w-full rounded-2xl" />
      </div>
    </RouteLoadingShell>
  );
}

export function ArchivePageLoading() {
  return (
    <RouteLoadingShell>
      <div className="space-y-6">
        <SkeletonBlock className="h-8 w-44" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="h-[4.25rem] rounded-2xl" />
          ))}
        </div>
      </div>
    </RouteLoadingShell>
  );
}
