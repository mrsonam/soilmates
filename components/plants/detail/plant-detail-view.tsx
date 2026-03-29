"use client";

import { useState } from "react";
import type { PlantDetailModel } from "@/lib/plants/plant-detail";
import type { CareLogListItem } from "@/lib/plants/care-logs";
import { CareHistorySection } from "@/components/plants/care-history/care-history-section";
import { PlantDetailBreadcrumb } from "./plant-detail-breadcrumb";
import { PlantHeroSummary } from "./plant-hero-summary";
import { QuickCareActions } from "./quick-care-actions";
import {
  PlantSectionTabs,
  type PlantDetailTabId,
} from "./plant-section-tabs";
import { PlantOverviewPanel } from "./plant-overview-panel";
import { PlantSectionPlaceholder } from "./plant-section-placeholder";

type PlantDetailViewProps = {
  plant: PlantDetailModel;
  collectionSlug: string;
  careLogs: CareLogListItem[];
  currentUserId: string;
  initialTab?: PlantDetailTabId;
};

export function PlantDetailView({
  plant,
  collectionSlug,
  careLogs,
  currentUserId,
  initialTab,
}: PlantDetailViewProps) {
  const [tab, setTab] = useState<PlantDetailTabId>(initialTab ?? "overview");

  return (
    <div className="space-y-8 lg:space-y-10">
      <PlantDetailBreadcrumb
        collectionSlug={collectionSlug}
        collectionName={plant.collection.name}
        plantNickname={plant.nickname}
      />

      <PlantHeroSummary plant={plant} />

      <QuickCareActions
        collectionSlug={collectionSlug}
        plantSlug={plant.slug}
      />

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
            <PlantSectionPlaceholder
              title="Photos"
              description="Growth albums and seasonal snapshots will live here so you can compare how your plant changes over time."
            />
          )}
          {tab === "reminders" && (
            <PlantSectionPlaceholder
              title="Reminders"
              description="Set watering and care nudges per plant. We’ll surface due dates alongside your collection calendar."
            />
          )}
          {tab === "diagnosis" && (
            <PlantSectionPlaceholder
              title="Diagnosis"
              description="Spot something off? Future versions will help you log symptoms and track recovery."
            />
          )}
          {tab === "assistant" && (
            <PlantSectionPlaceholder
              title="Assistant"
              description="Ask questions in context of this plant — care tips and identification help are on the roadmap."
            />
          )}
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
