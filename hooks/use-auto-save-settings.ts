"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { updateUserSettings } from "@/app/actions/settings";

export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

export function useAutoSaveSettings() {
  const router = useRouter();
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = useCallback(
    async (partial: Record<string, unknown>) => {
      if (clearTimer.current) {
        clearTimeout(clearTimer.current);
        clearTimer.current = null;
      }
      setStatus("saving");
      setError(null);
      const r = await updateUserSettings(partial);
      if (!r.ok) {
        setStatus("error");
        setError(r.error);
        return;
      }
      setStatus("saved");
      router.refresh();
      clearTimer.current = setTimeout(() => {
        setStatus("idle");
        clearTimer.current = null;
      }, 1800);
    },
    [router],
  );

  return { save, status, error };
}
