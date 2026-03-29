import { PageContainer } from "@/components/layout/page-container";

export default function PlantsPage() {
  return (
    <PageContainer>
      <p className="text-sm text-on-surface-variant">All plants</p>
      <h2 className="mt-1 font-display text-xl font-semibold text-on-surface">
        Plants
      </h2>
      <p className="mt-4 max-w-lg text-sm leading-relaxed text-on-surface-variant">
        Your plants across collections will appear here. This screen is a
        placeholder for the full catalog and filters.
      </p>
      <div className="mt-10 rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/50 px-6 py-16 text-center text-sm text-on-surface-variant">
        No plants yet — add some from a collection soon.
      </div>
    </PageContainer>
  );
}
