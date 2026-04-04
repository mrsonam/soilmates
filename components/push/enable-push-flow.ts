"use client";

import {
  registerPushSubscription,
  updateNotificationPreferences,
} from "@/app/actions/notifications";
import { urlBase64ToUint8Array } from "@/lib/push/subscription-client";

export async function subscribeDeviceAndEnablePush(): Promise<
  { ok: true } | { ok: false; error: string }
> {
  if (typeof window === "undefined") {
    return { ok: false, error: "Not in browser" };
  }
  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return { ok: false, error: "Notifications are not supported here." };
  }

  const vapid = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapid) {
    return { ok: false, error: "Push is not configured." };
  }

  const perm = await Notification.requestPermission();
  if (perm !== "granted") {
    return { ok: false, error: "Permission was not granted." };
  }

  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(vapid) as BufferSource,
  });
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
