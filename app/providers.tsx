"use client";

import { SessionProvider } from "next-auth/react";
import { OfflineProviders } from "@/components/offline/sync-engine-provider";
import { PwaSplashLoader } from "@/components/pwa/pwa-splash-loader";
import { PwaRegister } from "@/components/pwa-register";
import { RestingState } from "@/components/offline/resting-state";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PwaRegister />
      <PwaSplashLoader />
      <OfflineProviders>
        {children}
        <RestingState />
      </OfflineProviders>
    </SessionProvider>
  );
}
