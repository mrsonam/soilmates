import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPlantDetailBySlugs } from "@/lib/plants/plant-detail";
import { getPlantCareLogs } from "@/lib/plants/care-logs";
import { getPlantImagesForGallery } from "@/lib/plants/plant-images";
import { getPlantRemindersForMember } from "@/lib/reminders/queries";
import { getPlantActivityForMember } from "@/lib/activity/queries";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";
import { PageContainer } from "@/components/layout/page-container";
import { PlantDetailView } from "@/components/plants/detail/plant-detail-view";
import { getPlantAssistantThreadId, getThreadMessages } from "@/lib/ai/queries";
import {
  getDiagnosisImageThumbsBatch,
  getPlantDiagnosisHistoryForMember,
} from "@/lib/diagnosis/queries";

type Props = {
  params: Promise<{ collectionSlug: string; plantSlug: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function PlantDetailPage({ params, searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { collectionSlug, plantSlug } = await params;
  const sp = await searchParams;
  const initialTab =
    sp.tab === "reminders"
      ? ("reminders" as const)
      : sp.tab === "assistant" || sp.tab === "diagnosis"
        ? ("assistant" as const)
        : undefined;

  const [
    plant,
    careLogs,
    galleryImages,
    remindersPayload,
    plantActivity,
    diagnosisPayload,
  ] = await Promise.all([
    getPlantDetailBySlugs(session.user.id, collectionSlug, plantSlug),
    getPlantCareLogs(session.user.id, collectionSlug, plantSlug),
    getPlantImagesForGallery(session.user.id, collectionSlug, plantSlug),
    getPlantRemindersForMember(session.user.id, collectionSlug, plantSlug),
    getPlantActivityForMember(session.user.id, collectionSlug, plantSlug, 12),
    getPlantDiagnosisHistoryForMember(
      session.user.id,
      collectionSlug,
      plantSlug,
    ),
  ]);
  const reminders = remindersPayload ?? [];

  if (
    !plant ||
    careLogs === null ||
    galleryImages === null ||
    diagnosisPayload === null
  ) {
    notFound();
  }

  const diagnosis = diagnosisPayload;

  const assistantThreadId = await getPlantAssistantThreadId(
    session.user.id,
    collectionSlug,
    plantSlug,
  );

  let assistantMessages: Array<{
    id: string;
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    createdAt: string;
  }> = [];

  if (assistantThreadId) {
    const rows = await getThreadMessages(assistantThreadId);
    const diagnosisIds = rows
      .map((m) => m.relatedDiagnosisId)
      .filter((id): id is string => Boolean(id));
    const thumbsByDiagnosis = await getDiagnosisImageThumbsBatch(
      session.user.id,
      collectionSlug,
      plantSlug,
      diagnosisIds,
    );
    assistantMessages = rows.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt.toISOString(),
      diagnosisImageThumbs:
        m.relatedDiagnosisId != null
          ? thumbsByDiagnosis.get(m.relatedDiagnosisId)
          : undefined,
    }));
  }

  return (
    <PageContainer>
      <PlantDetailView
        key={`${collectionSlug}-${plantSlug}-${initialTab ?? "default"}`}
        plant={plant}
        collectionSlug={collectionSlug}
        careLogs={careLogs}
        currentUserId={session.user.id}
        initialTab={initialTab}
        galleryImages={galleryImages}
        uploadsEnabled={isSupabaseStorageConfigured()}
        reminders={reminders}
        plantActivity={plantActivity}
        assistantThreadId={assistantThreadId}
        assistantMessages={assistantMessages}
        diagnosisActive={diagnosis.active}
        diagnosisHistory={diagnosis.history}
      />
    </PageContainer>
  );
}
