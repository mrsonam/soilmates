type CareLogMetaSummaryProps = {
  metadata: Record<string, unknown>;
};

export function CareLogMetaSummary({ metadata }: CareLogMetaSummaryProps) {
  const chips: string[] = [];

  const ml = metadata.waterAmountMl;
  if (typeof ml === "number" && ml > 0) {
    chips.push(`${ml} ml`);
  }
  const ft = metadata.fertilizerType;
  if (typeof ft === "string" && ft.trim()) {
    chips.push(ft.trim());
  }
  const soil = metadata.soilMix;
  if (typeof soil === "string" && soil.trim()) {
    chips.push(soil.trim());
  }
  const harvest = metadata.harvestAmount;
  if (typeof harvest === "string" && harvest.trim()) {
    chips.push(harvest.trim());
  }
  const moved = metadata.movedReason;
  if (typeof moved === "string" && moved.trim()) {
    chips.push(moved.trim());
  }
  const custom = metadata.custom;
  if (typeof custom === "string" && custom.trim() && chips.length === 0) {
    chips.push(custom.trim().slice(0, 80) + (custom.length > 80 ? "…" : ""));
  }

  if (chips.length === 0) return null;

  return (
    <ul className="mt-2 flex flex-wrap gap-1.5">
      {chips.map((c) => (
        <li
          key={c}
          className="rounded-full bg-surface-container-high px-2 py-0.5 text-[0.65rem] font-medium text-on-surface-variant ring-1 ring-outline-variant/10"
        >
          {c}
        </li>
      ))}
    </ul>
  );
}
