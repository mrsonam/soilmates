"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  subscribeDeviceAndEnablePush,
  unsubscribeDeviceAndDisablePush,
} from "./enable-push-flow";
import {
  NotificationPermissionState,
  useNotificationPermission,
} from "./notification-permission-state";
import { TestNotificationButton } from "./test-notification-button";

type Props = {
  pushEnabledInDb: boolean;
  vapidConfigured: boolean;
  hasActiveSubscription: boolean;
};

export function PushNotificationSettingsCard({
  pushEnabledInDb,
  vapidConfigured,
  hasActiveSubscription,
}: Props) {
  const router = useRouter();
  const permission = useNotificationPermission();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientPushOk, setClientPushOk] = useState(false);
  useEffect(() => {
    setClientPushOk(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window,
    );
  }, []);

  const canUsePush =
    vapidConfigured &&
    permission !== "unsupported" &&
    clientPushOk;

  async function handleToggle(next: boolean) {
    setBusy(true);
    setError(null);
    try {
      if (next) {
        if (!canUsePush) {
          setError(
            "Push is not available here. Reminders still work inside the app.",
          );
          return;
        }
        const r = await subscribeDeviceAndEnablePush();
        if (!r.ok) {
          setError(r.error);
          return;
        }
      } else {
        const r = await unsubscribeDeviceAndDisablePush();
        if (!r.ok) {
          setError(r.error);
          return;
        }
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border border-outline-variant/40 bg-surface-container-low/80 p-5">
      <h3 className="font-display text-base font-semibold text-on-surface">
        Push notifications
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
        Get calm, grouped reminders when plants need care—even if Soil Mates is
        closed. We batch updates so you are not overwhelmed.
      </p>

      <div className="mt-4">
        <NotificationPermissionState permission={permission} />
      </div>

      {!vapidConfigured ? (
        <p className="mt-3 text-xs text-on-surface-variant">
          Push delivery is not configured on this server yet. In-app reminders
          continue to work.
        </p>
      ) : null}

      {vapidConfigured && permission !== "unsupported" && !canUsePush ? (
        <p className="mt-3 text-xs text-on-surface-variant">
          Web Push needs a supported browser. On iPhone, add Soil Mates to your Home
          Screen and open that app (iOS 16.4+), not a regular Safari tab.
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => handleToggle(!pushEnabledInDb)}
          className={`relative inline-flex h-8 w-14 shrink-0 rounded-full transition-colors ${
            pushEnabledInDb ? "bg-primary" : "bg-outline-variant/60"
          } ${busy ? "opacity-50" : ""}`}
          aria-pressed={pushEnabledInDb}
          aria-label="Toggle push notifications"
        >
          <span
            className={`absolute top-1 left-1 h-6 w-6 rounded-full bg-surface shadow transition-transform ${
              pushEnabledInDb ? "translate-x-6" : ""
            }`}
          />
        </button>
        <span className="text-sm text-on-surface">
          {pushEnabledInDb ? "On" : "Off"}
        </span>
      </div>

      {pushEnabledInDb && hasActiveSubscription ? (
        <p className="mt-3 text-xs text-on-surface-variant">
          This account has at least one device registered for background
          reminders.
        </p>
      ) : null}

      {pushEnabledInDb && !hasActiveSubscription && canUsePush ? (
        <p className="mt-3 text-xs text-on-surface-variant">
          Turn the toggle off and on again to register this browser if you do
          not receive reminders.
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-xs text-red-700 dark:text-red-300">{error}</p>
      ) : null}

      <TestNotificationButton
        disabled={
          !pushEnabledInDb || !hasActiveSubscription || !vapidConfigured || busy
        }
      />
    </section>
  );
}
