"use client";

import { SessionProvider } from "next-auth/react";
import { OfflineProviders } from "@/components/offline/sync-engine-provider";
import { PwaRegister } from "@/components/pwa-register";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <PwaRegister />
      <OfflineProviders>{children}</OfflineProviders>
    </SessionProvider>
  );
}
