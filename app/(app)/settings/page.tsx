import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PageContainer } from "@/components/layout/page-container";
import { prisma } from "@/lib/prisma";
import { isWebPushConfigured } from "@/lib/push/configure";
import {
  getDefaultCollectionOptions,
  getUserSettingsBundle,
} from "@/lib/settings/queries";
import { AccountCard } from "@/components/settings/account-card";
import { AiToneSelector } from "@/components/settings/ai-tone-selector";
import { CareRemindersSettings } from "@/components/settings/care-reminders-settings";
import { DefaultCollectionSelector } from "@/components/settings/default-collection-selector";
import { NotificationsSettings } from "@/components/settings/notifications-settings";
import { SettingsSection } from "@/components/settings/settings-section";
import { ThemeSelector } from "@/components/settings/theme-selector";
import { UnitsSelector } from "@/components/settings/units-selector";
import {
  Bell,
  Droplets,
  Leaf,
  Palette,
  Sparkles,
  UserRound,
  Workflow,
} from "lucide-react";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const [settings, collectionOptions, activeSubscriptionCount] =
    await Promise.all([
      getUserSettingsBundle(userId),
      getDefaultCollectionOptions(userId),
      prisma.pushSubscription.count({
        where: { userId, revokedAt: null },
      }),
    ]);

  if (!settings) {
    redirect("/login");
  }

  const vapidConfigured = isWebPushConfigured();

  return (
    <PageContainer>
      <header className="mx-auto max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/90">
          Account & app
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-[2rem]">
          Settings
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-on-surface-variant">
          Personalize how Soil Mates works for you — calm, private, and in your
          control.
        </p>
      </header>

      <div className="mx-auto mt-10 flex max-w-2xl flex-col gap-8 pb-16">
        <SettingsSection
          icon={<Palette className="size-5" strokeWidth={1.75} />}
          title="Appearance"
          description="Choose how the app looks on this device. Your choice syncs to your account."
        >
          <ThemeSelector />
        </SettingsSection>

        <SettingsSection
          icon={<Leaf className="size-5" strokeWidth={1.75} />}
          title="Care & reminders"
          description="Shape when we reach out and how careful we should be with care guidance."
        >
          <CareRemindersSettings
            preferredNotificationWindow={settings.preferredNotificationWindow}
            notificationQuietStartMinute={settings.notificationQuietStartMinute}
            notificationQuietEndMinute={settings.notificationQuietEndMinute}
            careSensitivity={settings.careSensitivity}
          />
        </SettingsSection>

        <SettingsSection
          icon={<Bell className="size-5" strokeWidth={1.75} />}
          title="Notifications"
          description="Stay informed without noise. Push uses your browser; in-app notices are for future highlights."
        >
          <NotificationsSettings
            pushEnabledInDb={settings.pushNotificationsEnabled}
            vapidConfigured={vapidConfigured}
            hasActiveSubscription={activeSubscriptionCount > 0}
            inAppNotificationsEnabled={settings.inAppNotificationsEnabled}
          />
        </SettingsSection>

        <SettingsSection
          icon={<Droplets className="size-5" strokeWidth={1.75} />}
          title="Units"
          description="Display preferences for measurements across the app."
        >
          <UnitsSelector
            waterUnit={settings.waterUnit}
            lengthUnit={settings.lengthUnit}
          />
        </SettingsSection>

        <SettingsSection
          icon={<Sparkles className="size-5" strokeWidth={1.75} />}
          title="AI assistant"
          description="Tune how the assistant speaks to you. It never replaces expert plant care."
        >
          <AiToneSelector aiPersonalityLevel={settings.aiPersonalityLevel} />
        </SettingsSection>

        <SettingsSection
          icon={<Workflow className="size-5" strokeWidth={1.75} />}
          title="App behavior"
          description="Optional default collection when you open Soil Mates."
        >
          {collectionOptions.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              Join or create a collection first — then you can pick a default
              space here.
            </p>
          ) : (
            <DefaultCollectionSelector
              collections={collectionOptions}
              defaultCollectionId={settings.defaultCollectionId}
            />
          )}
        </SettingsSection>

        <SettingsSection
          icon={<UserRound className="size-5" strokeWidth={1.75} />}
          title="Account"
          description="You’re signed in with Google."
        >
          <AccountCard
            name={session.user.name}
            email={session.user.email ?? ""}
            image={session.user.image}
          />
        </SettingsSection>
      </div>
    </PageContainer>
  );
}
