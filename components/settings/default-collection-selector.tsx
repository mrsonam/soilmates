"use client";

import { useState } from "react";
import { AppSelect } from "@/components/ui/app-select";
import type { DefaultCollectionOption } from "@/lib/settings/queries";
import { useAutoSaveSettings } from "@/hooks/use-auto-save-settings";
import { AutoSaveStatus } from "./auto-save-status";

type Props = {
  collections: DefaultCollectionOption[];
  defaultCollectionId: string | null;
};

export function DefaultCollectionSelector({
  collections,
  defaultCollectionId: initialId,
}: Props) {
  const { save, status, error } = useAutoSaveSettings();
  const [value, setValue] = useState<string | "">(initialId ?? "");

  const options = [
    { value: "", label: "Last visited (no default)" },
    ...collections.map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <div>
      <p className="text-sm text-on-surface-variant">
        Choose which collection opens first when you land in the app. You can
        still switch anytime.
      </p>
      <div className="mt-3 max-w-md">
        <AppSelect
          options={options}
          value={value}
          disabled={status === "saving"}
          onChange={(v) => {
            setValue(v);
            void save({
              defaultCollectionId: v === "" ? null : v,
            });
          }}
          placeholder="Select a default…"
        />
      </div>
      <div className="mt-3">
        <AutoSaveStatus status={status} error={error} />
      </div>
    </div>
  );
}
