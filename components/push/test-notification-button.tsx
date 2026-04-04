"use client";

import { useState } from "react";
import { sendTestPushNotification } from "@/app/actions/notifications";

export function TestNotificationButton({
  disabled,
}: {
  disabled?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setMessage(null);
    try {
      const r = await sendTestPushNotification();
      if (r.ok) {
        setMessage("Sent. Check your system tray or notification shade.");
      } else {
        setMessage(r.error);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        disabled={disabled || pending}
        onClick={onClick}
        className="rounded-xl border border-outline-variant/60 bg-surface-container-low px-4 py-2 text-sm text-on-surface transition hover:bg-surface-container disabled:opacity-50"
      >
        {pending ? "Sending…" : "Send test notification"}
      </button>
      {message ? (
        <p className="mt-2 text-xs text-on-surface-variant">{message}</p>
      ) : null}
    </div>
  );
}
