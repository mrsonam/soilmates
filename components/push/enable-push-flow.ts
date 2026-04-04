"use client";

import {
  registerPushSubscription,
  updateNotificationPreferences,
} from "@/app/actions/notifications";
import { urlBase64ToUint8Array } from "@/lib/push/subscription-client";

const SW_PATH = "/sw.js";

/**
 * Ensures our SW is active, then subscribes for push.
 * iOS 16.4+ (installed PWA) is picky: use the registration returned from `register()`,
 * wait for `ready`, and reuse an existing PushSubscription when present.
 */
export async function subscribeDeviceAndEnablePush(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (typeof window === "undefined") {
    return { ok: false, error: "Not in browser" };
  }
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return { ok: false, error: "Notifications are not supported here." };
  }
  if (!("PushManager" in window)) {
    return {
      ok: false,
      error:
        "Push is not available in this browser. On iPhone, add Soil Mates to your Home Screen and open that app (not Safari tabs).",
    };
  }

  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
  if (!vapid) {
    return { ok: false, error: "Push is not configured on this server." };
  }

  const perm = await Notification.requestPermission();
  if (perm !== "granted") {
    return { ok: false, error: "Permission was not granted." };
  }

  let registration: ServiceWorkerRegistration;
  try {
    registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: "/",
      updateViaCache: "none",
    });
  } catch {
    return {
      ok: false,
      error:
        "Could not register the app worker. Check that you are on HTTPS and try again.",
    };
  }

  try {
    await navigator.serviceWorker.ready;
  } catch {
    return { ok: false, error: "The app worker did not become ready in time." };
  }

  let sub: PushSubscription | null = null;
  try {
    sub = await registration.pushManager.getSubscription();
    if (!sub) {
      const key = urlBase64ToUint8Array(vapid);
      sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: key as BufferSource,
      });
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (/not supported|denied|InvalidState/i.test(msg)) {
      return {
        ok: false,
        error:
          "Could not enable push on this device. On iPhone, use the Home Screen app and iOS 16.4 or later.",
      };
    }
    return {
      ok: false,
      error: "Could not subscribe to push. Try again in a moment.",
    };
  }

  const json = sub.toJSON();
  const saved = await registerPushSubscription(json);
  if (!saved.ok) {
    return { ok: false, error: saved.error };
  }

  const prefs = await updateNotificationPreferences({
    pushNotificationsEnabled: true,
  });
  if (!prefs.ok) {
    return { ok: false, error: prefs.error };
  }

  return { ok: true };
}

export async function unsubscribeDeviceAndDisablePush(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready;
      const existing = await reg.pushManager.getSubscription();
      await existing?.unsubscribe();
    } catch {
      /* ignore */
    }
  }

  return await updateNotificationPreferences({
    pushNotificationsEnabled: false,
  });
}
