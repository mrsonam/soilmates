"use client";

import { useState } from "react";
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
import { PlantAssistantPanel } from "@/components/assistant/plant-assistant-panel";

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
  }>;
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
}: PlantDetailViewProps) {
  const [tab, setTab] = useState<PlantDetailTabId>(initialTab ?? "overview");

  return (
    <div className="space-y-8 lg:space-y-10">
      <CollectionSectionTabs collectionSlug={collectionSlug} />

      <PlantHeroSummary plant={plant} />

      <QuickCareActions
        collectionSlug={collectionSlug}
        plantSlug={plant.slug}
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
        <PlantSectionTabs active={tab} onChange={setTab} />

        <div className="mt-6 min-h-[12rem]" role="tabpanel">
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
              uploadsEnabled={uploadsEnabled}
            />
          )}
          {tab === "reminders" && (
            <PlantRemindersSection
              collectionSlug={collectionSlug}
              plantSlug={plant.slug}
              reminders={reminders}
            />
          )}
          {tab === "diagnosis" && (
            <PlantSectionPlaceholder
              title="Diagnosis"
              description="Spot something off? Future versions will help you log symptoms and track recovery."
            />
          )}
          {tab === "assistant" &&
            (assistantThreadId ? (
              <PlantAssistantPanel
                threadId={assistantThreadId}
                plantNickname={plant.nickname}
                initialMessages={assistantMessages}
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
  );
}
