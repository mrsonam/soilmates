"use client";

import dynamic from "next/dynamic";
import { useEffect, useState, useTransition } from "react";
import { InlineLoader } from "@/components/loading/inline-loader";
import type { PlantDetailModel } from "@/lib/plants/plant-detail";
import type { CareLogListItem } from "@/lib/plants/care-logs";
import type { PlantGalleryImage } from "@/lib/plants/plant-images";
import { PlantPhotoGallery } from "@/components/plants/photos/plant-photo-gallery";
import { CareHistorySection } from "@/components/plants/care-history/care-history-section";
import { CollectionSectionTabs } from "@/components/collections/collection-section-tabs";
import { PlantHeroSummary } from "./plant-hero-summary";
import { QuickCareActions } from "./quick-care-actions";
import {
  PlantSectionTabs,
  type PlantDetailTabId,
} from "./plant-section-tabs";
import { PlantOverviewPanel } from "./plant-overview-panel";
import { PlantSectionPlaceholder } from "./plant-section-placeholder";
import type { ReminderListItem } from "@/lib/reminders/queries";
import { PlantRemindersSection } from "@/components/reminders/plant-reminders-section";
import type { ActivityFeedItem } from "@/lib/activity/queries";
import { PlantActivityPreview } from "@/components/activity/plant-activity-preview";
import type { DiagnosisHistoryItem } from "@/lib/diagnosis/queries";
import { PlantCareStatusBanners } from "@/components/archive/plant-care-status-banners";
import { PlantArchiveSection } from "@/components/archive/plant-archive-section";

const PlantAssistantPanel = dynamic(
  () =>
    import("@/components/assistant/plant-assistant-panel").then((m) => ({
      default: m.PlantAssistantPanel,
    })),
  {
    loading: () => (
      <PlantSectionPlaceholder
        title="Assistant"
        description="Opening your plant assistant…"
      />
    ),
  },
);

type PlantDetailViewProps = {
  plant: PlantDetailModel;
  collectionSlug: string;
  careLogs: CareLogListItem[];
  currentUserId: string;
  initialTab?: PlantDetailTabId;
  galleryImages: PlantGalleryImage[];
  uploadsEnabled: boolean;
  reminders: ReminderListItem[];
  plantActivity: ActivityFeedItem[];
  assistantThreadId: string | null;
  assistantMessages: Array<{
    id: string;
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    createdAt: string;
    diagnosisImageThumbs?: Array<{ id: string; signedUrl: string | null }>;
  }>;
  diagnosisActive: DiagnosisHistoryItem | null;
  diagnosisHistory: DiagnosisHistoryItem[];
};

export function PlantDetailView({
  plant,
  collectionSlug,
  careLogs,
  currentUserId,
  initialTab,
  galleryImages,
  uploadsEnabled,
  reminders,
  plantActivity,
  assistantThreadId,
  assistantMessages,
  diagnosisActive,
  diagnosisHistory,
}: PlantDetailViewProps) {
  const [tab, setTab] = useState<PlantDetailTabId>(initialTab ?? "overview");
  const [tabTransitionPending, startTabTransition] = useTransition();

  useEffect(() => {
    setTab(initialTab ?? "overview");
  }, [initialTab]);

  const handleTabChange = (id: PlantDetailTabId) => {
    startTabTransition(() => {
      setTab(id);
    });
  };

  const careFrozen =
    plant.archivedAt != null || plant.collectionArchivedAt != null;
  const canArchivePlant =
    plant.archivedAt == null && plant.collectionArchivedAt == null;

  return (
    <div className="space-y-8 lg:space-y-10">
      <CollectionSectionTabs collectionSlug={collectionSlug} />

      <PlantCareStatusBanners
        collectionSlug={collectionSlug}
        plantSlug={plant.slug}
        nickname={plant.nickname}
        plantArchivedAt={plant.archivedAt}
        collectionArchivedAt={plant.collectionArchivedAt}
      />

      <PlantHeroSummary
        plant={plant}
        activeDiagnosisSummary={diagnosisActive?.summary ?? null}
        collectionSlug={collectionSlug}
        plantSlug={plant.slug}
        careFrozen={careFrozen}
      />

      <QuickCareActions
        collectionSlug={collectionSlug}
        plantSlug={plant.slug}
        disabled={careFrozen}
      />

      <section className="rounded-3xl bg-surface-container-lowest/60 p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-6">
        <h2 className="font-display text-lg font-semibold text-on-surface">
          Activity
        </h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Care logs show history; here are shared updates from your household.
        </p>
        <div className="mt-5">
          <PlantActivityPreview
            collectionSlug={collectionSlug}
            items={plantActivity}
          />
        </div>
      </section>

      <div className="rounded-3xl bg-surface-container-lowest/60 p-4 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-6">
        <PlantSectionTabs
          active={tab}
          onChange={handleTabChange}
          transitioning={tabTransitionPending}
        />

        <div className="relative mt-6 min-h-[12rem]" role="tabpanel">
          {tabTransitionPending ? (
            <div className="pointer-events-none absolute right-0 top-0 z-[1] flex items-center gap-2 rounded-full bg-surface-container-high/90 px-3 py-1.5 shadow-sm ring-1 ring-outline-variant/10">
              <InlineLoader label="Updating…" />
            </div>
          ) : null}
          <div
            className={[
              tabTransitionPending ? "opacity-[0.92]" : "",
              "transition-opacity duration-200",
            ].join(" ")}
          >
          {tab === "overview" && (
            <PlantOverviewPanel
              plant={plant}
              collectionSlug={collectionSlug}
            />
          )}
          {tab === "care_history" && (
            <CareHistorySection
              collectionSlug={collectionSlug}
              plantSlug={plant.slug}
              plantNickname={plant.nickname}
              logs={careLogs}
              currentUserId={currentUserId}
            />
          )}
          {tab === "photos" && (
            <PlantPhotoGallery
              variant="tab"
              collectionSlug={collectionSlug}
              plantSlug={plant.slug}
              plantNickname={plant.nickname}
              images={galleryImages}
              uploadsEnabled={uploadsEnabled && !careFrozen}
              diagnosisHref={`/collections/${collectionSlug}/plants/${plant.slug}?tab=assistant#plant-check-in`}
            />
          )}
          {tab === "reminders" && (
            <PlantRemindersSection
              collectionSlug={collectionSlug}
              plantSlug={plant.slug}
              reminders={reminders}
            />
          )}
          {tab === "assistant" &&
            (assistantThreadId ? (
              <PlantAssistantPanel
                threadId={assistantThreadId}
                plantNickname={plant.nickname}
                initialMessages={assistantMessages}
                collectionSlug={collectionSlug}
                plantSlug={plant.slug}
                galleryImages={galleryImages}
                uploadsEnabled={uploadsEnabled}
                diagnosisActive={diagnosisActive}
                diagnosisHistory={diagnosisHistory}
              />
            ) : (
              <PlantSectionPlaceholder
                title="Assistant"
                description="We couldn’t open a thread for this plant. Try refreshing the page."
              />
            ))}
          {tab === "activity" && (
            <PlantSectionPlaceholder
              title="Activity"
              description="Household updates and comments tied to this plant will show up here."
            />
          )}
          </div>
        </div>
      </div>

      {canArchivePlant ? (
        <PlantArchiveSection
          collectionSlug={collectionSlug}
          plantSlug={plant.slug}
          nickname={plant.nickname}
        />
      ) : null}
    </div>
  );
}
