import { AssistantChat } from "./assistant-chat";
import type { PlantGalleryImage } from "@/lib/plants/plant-images";
import type { DiagnosisHistoryItem } from "@/lib/diagnosis/queries";

export function PlantAssistantPanel({
  threadId,
  plantNickname,
  initialMessages,
  collectionSlug,
  plantSlug,
  galleryImages,
  uploadsEnabled,
  diagnosisActive,
  diagnosisHistory,
}: {
  threadId: string;
  plantNickname: string;
  collectionSlug: string;
  plantSlug: string;
  galleryImages: PlantGalleryImage[];
  uploadsEnabled: boolean;
  diagnosisActive: DiagnosisHistoryItem | null;
  diagnosisHistory: DiagnosisHistoryItem[];
  initialMessages: Array<{
    id: string;
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    createdAt: string;
  }>;
}) {
  return (
    <div
      id="plant-check-in"
      className="scroll-mt-24 rounded-2xl bg-surface-container-lowest/40 p-4 ring-1 ring-outline-variant/[0.08] sm:p-6"
    >
      <div className="mb-6 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
          Plant assistant
        </p>
        <h2 className="font-display text-lg font-semibold text-on-surface">
          Chat &amp; check-in for {plantNickname}
        </h2>
        <p className="max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          Chat about care here; use the{" "}
          <span className="font-medium text-on-surface">images</span> button in the
          message bar when you want a structured photo review.
        </p>
      </div>

      <AssistantChat
        mode="plant"
        threadId={threadId}
        initialMessages={initialMessages}
        plantNickname={plantNickname}
        collectionSlug={collectionSlug}
        plantSlug={plantSlug}
        galleryImages={galleryImages}
        uploadsEnabled={uploadsEnabled}
        diagnosisActive={diagnosisActive}
        diagnosisHistory={diagnosisHistory}
      />
    </div>
  );
}
