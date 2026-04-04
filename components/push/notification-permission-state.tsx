"use client";

import { useEffect, useState } from "react";

export function useNotificationPermission(): NotificationPermission | "unsupported" {
  const [perm, setPerm] = useState<NotificationPermission | "unsupported">(
    "default",
  );

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setPerm("unsupported");
      return;
    }
    setPerm(Notification.permission);
  }, []);

  return perm;
}

export function NotificationPermissionState({
  permission,
}: {
  permission: NotificationPermission | "unsupported";
}) {
  if (permission === "unsupported") {
    return (
      <p className="text-xs text-on-surface-variant">
        This browser does not support notifications. Reminders still appear in
        the app.
      </p>
    );
  }
  if (permission === "denied") {
    return (
      <p className="text-xs text-amber-800/90 dark:text-amber-200/90">
        Notifications are blocked for this site. You can allow them in your
        browser settings if you change your mind.
      </p>
    );
  }
  if (permission === "default") {
    return (
      <p className="text-xs text-on-surface-variant">
        You have not allowed notifications yet. Use the toggle below when you
        are ready.
      </p>
    );
  }
  return (
    <p className="text-xs text-on-surface-variant">
      Notifications are allowed for Soil Mates on this device.
    </p>
  );
}
