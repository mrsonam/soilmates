"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import type { UserTheme } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateUserSettings } from "@/app/actions/settings";
import { useThemePreference } from "@/components/theme/theme-provider";
import { AutoSaveStatus } from "./auto-save-status";

const OPTIONS: { value: UserTheme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export function ThemeSelector() {
  const { theme: currentTheme, setTheme: setContextTheme } =
    useThemePreference();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">(
    "idle",
  );
  const [err, setErr] = useState<string | null>(null);

  async function choose(next: UserTheme) {
    setStatus("saving");
    setErr(null);
    setContextTheme(next);
    const r = await updateUserSettings({ theme: next });
    if (!r.ok) {
      setStatus("error");
      setErr(r.error);
      return;
    }
    setStatus("saved");
    router.refresh();
    setTimeout(() => setStatus("idle"), 1600);
  }

  return (
    <div>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
        Color theme
      </p>
      <div
        className="mt-3 flex flex-wrap gap-2"
        role="radiogroup"
        aria-label="Theme"
        aria-busy={status === "saving"}
      >
        {OPTIONS.map((o) => {
          const Icon = o.icon;
          const active = currentTheme === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={status === "saving"}
              onClick={() => choose(o.value)}
              className={`inline-flex min-w-[6.5rem] flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition ring-1 sm:flex-none ${
                active
                  ? "bg-primary text-on-primary ring-primary shadow-sm"
                  : "bg-surface-container-high/90 text-on-surface-variant ring-outline-variant/12 hover:bg-surface-container-high"
              }`}
            >
              <Icon className="size-4 shrink-0 opacity-90" strokeWidth={1.75} />
              {o.label}
            </button>
          );
        })}
      </div>
      <div className="mt-3">
        <AutoSaveStatus status={status} error={err} />
      </div>
    </div>
  );
}
