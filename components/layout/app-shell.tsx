"use client";

import type { ReactNode } from "react";
import { Sidebar } from "./sidebar";
import { BottomNav } from "./bottom-nav";
import { AppHeader } from "./app-header";
import { AssistantFab } from "./assistant-fab";
import type { CollectionOption } from "./collection-switcher";
import { CollectionsCreateProvider } from "./collections-create-provider";
import { CollectionHeaderProvider } from "./collection-header-context";
import { CollectionPageActionsProvider } from "./collection-page-actions";
import { AppRealtimeSync } from "./app-realtime-sync";

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
};

export function AppShell({ children, collections, uploadsEnabled, user }: AppShellProps) {
  return (
    <CollectionsCreateProvider uploadsEnabled={uploadsEnabled}>
      <CollectionHeaderProvider>
        <CollectionPageActionsProvider>
        <div className="min-h-dvh bg-surface text-on-surface">
          <AppRealtimeSync />
          <div className="flex min-h-dvh items-stretch">
            <Sidebar collections={collections} user={user} />
            <div className="flex min-w-0 flex-1 flex-col lg:min-h-dvh">
              <AppHeader collections={collections} user={user} />
              <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))] lg:pb-8">
                {children}
              </div>
            </div>
          </div>
          <BottomNav />
          <AssistantFab />
        </div>
        </CollectionPageActionsProvider>
      </CollectionHeaderProvider>
    </CollectionsCreateProvider>
  );
}
