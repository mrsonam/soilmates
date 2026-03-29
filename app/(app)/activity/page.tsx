import { PageContainer } from "@/components/layout/page-container";

export default function ActivityPage() {
  return (
    <PageContainer>
      <p className="text-sm text-on-surface-variant">Recent updates</p>
      <h2 className="mt-1 font-display text-xl font-semibold text-on-surface">
        Activity
      </h2>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-on-surface-variant">
        Watering, notes, and invites will stream here. Placeholder until the
        activity feed ships.
      </p>
      <div className="mt-10 rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/50 px-6 py-16 text-center text-sm text-on-surface-variant">
        Nothing new yet.
      </div>
    </PageContainer>
  );
}
