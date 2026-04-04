"use client";

import type { LengthUnit, WaterUnit } from "@prisma/client";
import { useState } from "react";
import { AppSelect } from "@/components/ui/app-select";
import { useAutoSaveSettings } from "@/hooks/use-auto-save-settings";
import { AutoSaveStatus } from "./auto-save-status";

type Props = {
  waterUnit: WaterUnit;
  lengthUnit: LengthUnit;
};

export function UnitsSelector({ waterUnit: w0, lengthUnit: l0 }: Props) {
  const { save, status, error } = useAutoSaveSettings();
  const [water, setWater] = useState(w0);
  const [length, setLength] = useState(l0);

  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <div>
        <label className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Water volume
        </label>
        <p className="mt-1 text-sm text-on-surface-variant">
          Milliliters for now; more units can follow later.
        </p>
        <div className="mt-3">
          <AppSelect
            options={[{ value: "ml", label: "Milliliters (ml)" }]}
            value={water}
            onChange={(v) => {
              const next = v as WaterUnit;
              setWater(next);
              void save({ waterUnit: next });
            }}
          />
        </div>
      </div>
      <div>
        <label className="text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant">
          Length
        </label>
        <p className="mt-1 text-sm text-on-surface-variant">
          Used for measurements and future size hints.
        </p>
        <div className="mt-3">
          <AppSelect
            options={[
              { value: "cm", label: "Centimeters (cm)" },
              { value: "in", label: "Inches (in)" },
            ]}
            value={length}
            onChange={(v) => {
              const next = v as LengthUnit;
              setLength(next);
              void save({ lengthUnit: next });
            }}
          />
        </div>
      </div>
      <div className="sm:col-span-2">
        <AutoSaveStatus status={status} error={error} />
      </div>
    </div>
  );
}
