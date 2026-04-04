"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getFeatureFlags } from "@/lib/feature-flags";
import { subscribeDeviceAndEnablePush } from "./enable-push-flow";

const DISMISS_KEY = "soilmates-push-prompt-dismissed-v1";

type Props = {
  eligible: boolean;
  vapidConfigured: boolean;
  pushEnabledInDb: boolean;
};

export function EnablePushPrompt({
  eligible,
  vapidConfigured,
  pushEnabledInDb,
}: Props) {
  const router = useRouter();
  const [dismissed, setDismissed] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("unsupported");

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  const [pushApisOk, setPushApisOk] = useState(false);
  useEffect(() => {
    setPushApisOk(
      typeof window !== "undefined" &&
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window,
    );
  }, []);

  const visible =
    getFeatureFlags().pushNotifications &&
    pushApisOk &&
    dismissed === false &&
    eligible &&
    !pushEnabledInDb &&
    vapidConfigured &&
    permission !== "denied" &&
    permission !== "unsupported";

  if (dismissed === null || !visible) {
    return null;
  }

  async function onEnable() {
    setBusy(true);
    setError(null);
    try {
      const r = await subscribeDeviceAndEnablePush();
      if (!r.ok) {
        setError(r.error);
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  function onDismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setDismissed(true);
  }

  return (
    <div
      className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-40 max-w-lg rounded-2xl border border-outline-variant/50 bg-surface-container-high p-4 shadow-lg lg:left-auto lg:right-8 lg:bottom-8"
      role="dialog"
      aria-label="Enable push notifications"
    >
      <p className="font-display text-sm font-semibold text-on-surface">
        Stay ahead of plant care
      </p>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
        Get gentle, grouped reminders when your plants need attention—even when
        the app is closed.
      </p>
      {error ? (
        <p className="mt-2 text-xs text-red-700 dark:text-red-300">{error}</p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={onEnable}
          className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-on-primary disabled:opacity-50"
        >
          {busy ? "Enabling…" : "Turn on reminders"}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-xl px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low"
        >
          Not now
        </button>
      </div>
    </div>
  );
}
