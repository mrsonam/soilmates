"use client";

import type { AiPersonalityLevel } from "@prisma/client";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useAutoSaveSettings } from "@/hooks/use-auto-save-settings";
import { AutoSaveStatus } from "./auto-save-status";

const OPTIONS: {
  value: AiPersonalityLevel;
  title: string;
  body: string;
}[] = [
  {
    value: "factual",
    title: "Factual",
    body: "Straightforward answers with minimal flourish.",
  },
  {
    value: "balanced",
    title: "Balanced",
    body: "Warm and clear — the default Soil Mates voice.",
  },
  {
    value: "warm",
    title: "Warm",
    body: "Extra encouragement and gentler phrasing.",
  },
];

type Props = {
  aiPersonalityLevel: AiPersonalityLevel;
};

export function AiToneSelector({ aiPersonalityLevel: initial }: Props) {
  const { save, status, error } = useAutoSaveSettings();
  const [level, setLevel] = useState(initial);

  return (
    <div>
      <div
        className="grid gap-3 sm:grid-cols-3"
        role="radiogroup"
        aria-label="Assistant tone"
      >
        {OPTIONS.map((o) => {
          const active = level === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                setLevel(o.value);
                void save({ aiPersonalityLevel: o.value });
              }}
              className={`flex flex-col rounded-2xl p-4 text-left ring-1 transition ${
                active
                  ? "bg-primary/12 ring-primary/45 shadow-sm"
                  : "bg-surface-container-high/75 ring-outline-variant/10 hover:bg-surface-container-high"
              }`}
            >
              <span className="flex items-center gap-2 font-medium text-on-surface">
                <Sparkles
                  className={`size-4 ${active ? "text-primary" : "text-on-surface-variant"}`}
                  strokeWidth={1.75}
                />
                {o.title}
              </span>
              <span className="mt-2 text-xs leading-relaxed text-on-surface-variant">
                {o.body}
              </span>
            </button>
          );
        })}
      </div>
      <div className="mt-4">
        <AutoSaveStatus status={status} error={error} />
      </div>
    </div>
  );
}
