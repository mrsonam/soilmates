import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveMembershipsForUser } from "@/lib/collections/memberships";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { prisma } from "@/lib/prisma";
import { getPushPrerequisites } from "@/lib/push/eligibility";
import { isWebPushConfigured } from "@/lib/push/configure";
import { getPendingInviteCountForUser } from "@/lib/collections/invites-queries";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [memberships, prerequisites, profile, pendingInviteCount] =
    await Promise.all([
      getActiveMembershipsForUser(session.user.id),
      getPushPrerequisites(session.user.id),
      prisma.profile.findUnique({
        where: { id: session.user.id },
        select: { pushNotificationsEnabled: true, theme: true },
      }),
      getPendingInviteCountForUser(session.user.email),
    ]);

  const collections = memberships.map((m) => ({
    id: m.collection.id,
    name: m.collection.name,
    slug: m.collection.slug,
  }));

  return (
    <ThemeProvider initialTheme={profile?.theme ?? "system"}>
      <AppShell
        collections={collections}
        uploadsEnabled={isSupabaseStorageConfigured()}
        user={{
          name: session.user.name,
          email: session.user.email ?? "",
          image: session.user.image,
        }}
        pushPrompt={{
          eligible: prerequisites.eligibleForPrompt,
          vapidConfigured: isWebPushConfigured(),
          pushEnabledInDb: profile?.pushNotificationsEnabled ?? false,
        }}
        pendingInviteCount={pendingInviteCount}
      >
        {children}
      </AppShell>
    </ThemeProvider>
  );
}
