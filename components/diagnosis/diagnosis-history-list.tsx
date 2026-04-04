"use client";

import type { DiagnosisHistoryItem } from "@/lib/diagnosis/queries";
import { DiagnosisResultCard } from "./diagnosis-result-card";

export function DiagnosisHistoryList({
  items,
}: {
  items: DiagnosisHistoryItem[];
}) {
  if (items.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="font-display text-lg font-semibold text-on-surface">
        Earlier reviews
      </h3>
      <ul className="space-y-6">
        {items.map((item) => (
          <li key={item.id}>
            <DiagnosisResultCard item={item} variant="compact" />
          </li>
        ))}
      </ul>
    </div>
  );
}
