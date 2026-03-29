import { PageContainer } from "@/components/layout/page-container";

export default function AssistantPage() {
  return (
    <PageContainer narrow>
      <p className="text-sm text-on-surface-variant">Plant assistant</p>
      <h2 className="mt-1 font-display text-xl font-semibold text-on-surface">
        Assistant
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
        Chat, diagnosis, and care suggestions will open here. For now, use this
        space as the full-screen assistant entry from the shell.
      </p>
      <div className="mt-8 rounded-3xl bg-surface-container-low p-6">
        <p className="text-center text-sm text-on-surface-variant">
          Conversation UI coming in a later milestone.
        </p>
      </div>
    </PageContainer>
  );
}
