"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { AppHeader } from "./app-header";
import { AssistantFab } from "./assistant-fab";
import { NavigationProgress } from "./navigation-progress";
import type { CollectionOption } from "./collection-switcher";
import { CollectionsCreateProvider } from "./collections-create-provider";
import { CollectionHeaderProvider } from "./collection-header-context";
import { CollectionPageActionsProvider } from "./collection-page-actions";
import { AppRealtimeSync } from "./app-realtime-sync";
import { OfflineBanner } from "@/components/offline/offline-banner";
import { ConflictQueueStrip } from "@/components/offline/conflict-queue-strip";
import { DeadLetterStrip } from "@/components/offline/dead-letter-strip";
import { SyncQueueDebugPanel } from "@/components/offline/sync-queue-debug-panel";
import { EnablePushPrompt } from "@/components/push/enable-push-prompt";

type AppShellProps = {
  children: ReactNode;
  collections: CollectionOption[];
  /** True when server can upload to Supabase (collection cover required on create). */
  uploadsEnabled: boolean;
  user: {
    name?: string | null;
    email: string;
    image?: string | null;
  };
  pushPrompt?: {
    eligible: boolean;
    vapidConfigured: boolean;
    pushEnabledInDb: boolean;
  };
  pendingInviteCount?: number;
};

export function AppShell({
  children,
  collections,
  uploadsEnabled,
  user,
  pushPrompt,
  pendingInviteCount = 0,
}: AppShellProps) {
  return (
    <CollectionsCreateProvider uploadsEnabled={uploadsEnabled}>
      <CollectionHeaderProvider>
        <CollectionPageActionsProvider>
        <div className="min-h-dvh bg-surface text-on-surface">
          <NavigationProgress />
          <AppRealtimeSync />
          <div className="flex min-h-dvh items-stretch">
            <Sidebar
              collections={collections}
              user={user}
              pendingInviteCount={pendingInviteCount}
            />
            <div className="flex min-w-0 flex-1 flex-col lg:min-h-dvh">
              <AppHeader
                collections={collections}
                pendingInviteCount={pendingInviteCount}
              />
              <OfflineBanner />
              <div className="flex-1 pb-[calc(5.25rem+env(safe-area-inset-bottom))] lg:pb-8">
                <DeadLetterStrip />
                <ConflictQueueStrip />
                {children}
              </div>
              <SyncQueueDebugPanel />
            </div>
          </div>
          <BottomNav />
          <AssistantFab />
          {pushPrompt ? (
            <EnablePushPrompt
              eligible={pushPrompt.eligible}
              vapidConfigured={pushPrompt.vapidConfigured}
              pushEnabledInDb={pushPrompt.pushEnabledInDb}
            />
          ) : null}
        </div>
        </CollectionPageActionsProvider>
      </CollectionHeaderProvider>
    </CollectionsCreateProvider>
  );
}
