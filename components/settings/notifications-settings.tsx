"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateUserSettings } from "@/app/actions/settings";
import { PushNotificationSettingsCard } from "@/components/push/push-notification-settings-card";
import { AutoSaveStatus } from "./auto-save-status";

type Props = {
  pushEnabledInDb: boolean;
  vapidConfigured: boolean;
  hasActiveSubscription: boolean;
  inAppNotificationsEnabled: boolean;
};

export function NotificationsSettings({
  pushEnabledInDb,
  vapidConfigured,
  hasActiveSubscription,
  inAppNotificationsEnabled: initialInApp,
}: Props) {
  const router = useRouter();
  const [inApp, setInApp] = useState(initialInApp);
  const [status, setStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [err, setErr] = useState<string | null>(null);

  async function saveInApp(next: boolean) {
    setStatus("saving");
    setErr(null);
    const r = await updateUserSettings({ inAppNotificationsEnabled: next });
    if (!r.ok) {
      setStatus("error");
      setErr(r.error);
      return;
    }
    setInApp(next);
    setStatus("saved");
    router.refresh();
    setTimeout(() => setStatus("idle"), 1600);
  }

  return (
    <div className="space-y-6">
      <PushNotificationSettingsCard
        pushEnabledInDb={pushEnabledInDb}
        vapidConfigured={vapidConfigured}
        hasActiveSubscription={hasActiveSubscription}
      />

      <div className="rounded-2xl bg-surface-container-low/80 p-5 ring-1 ring-outline-variant/15">
        <h3 className="font-display text-base font-semibold text-on-surface">
          In-app notices
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          Reserved for gentle highlights inside Soil Mates. Your reminders and
          dashboard still show what needs care.
        </p>
        <label className="mt-5 flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            className="mt-1 size-4 rounded border-outline-variant"
            checked={inApp}
            onChange={(e) => saveInApp(e.target.checked)}
          />
          <span className="text-sm text-on-surface">
            Enable in-app notifications when we add them
          </span>
        </label>
        <div className="mt-2">
          <AutoSaveStatus status={status} error={err} />
        </div>
      </div>
    </div>
  );
}
