import type { PlantReferenceSnapshot } from "@/lib/integrations/trefle/types";

type PlantReferencePanelProps = {
  reference: PlantReferenceSnapshot | null;
};

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-high/35 p-4 ring-1 ring-outline-variant/10">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
        {label}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-on-surface">
        {value ?? "Not provided"}
      </p>
    </div>
  );
}

export function PlantReferencePanel({ reference }: PlantReferencePanelProps) {
  if (!reference) return null;

  return (
    <section className="rounded-3xl bg-surface-container-lowest p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-primary/90">
            Plant reference
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight text-on-surface">
            {reference.commonName ?? reference.scientificName ?? "Plant reference"}
          </h3>
          {reference.scientificName ? (
            <p className="mt-1 text-sm italic text-on-surface-variant">
              {reference.scientificName}
            </p>
          ) : null}
          <p className="mt-3 text-xs text-on-surface-variant">
            Saved snapshot from Trefle. This stays separate from your notes,
            reminders, and household-specific care choices.
          </p>
        </div>

        {reference.imageUrl ? (
          <div className="overflow-hidden rounded-3xl bg-surface-container-high/30 ring-1 ring-outline-variant/10">
            {/* eslint-disable-next-line @next/next/no-img-element -- provider host is dynamic */}
            <img
              src={reference.imageUrl}
              alt=""
              className="aspect-square w-28 object-cover"
            />
          </div>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {reference.family ? (
          <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant ring-1 ring-outline-variant/10">
            {reference.family}
          </span>
        ) : null}
        {reference.genus ? (
          <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant ring-1 ring-outline-variant/10">
            {reference.genus}
          </span>
        ) : null}
        {reference.edible === true ? (
          <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant ring-1 ring-outline-variant/10">
            Edible
          </span>
        ) : null}
        {reference.toxicityLabel ? (
          <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-medium text-on-surface-variant ring-1 ring-outline-variant/10">
            {reference.toxicityLabel}
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <InfoCard label="Light" value={reference.lightLabel} />
        <InfoCard label="Soil moisture" value={reference.soilMoistureLabel} />
        <InfoCard label="Humidity" value={reference.humidityLabel} />
        <InfoCard label="Temperature" value={reference.temperatureLabel} />
        <InfoCard label="Growth rate" value={reference.growthRate} />
        <InfoCard label="Duration" value={reference.duration} />
        <InfoCard
          label="Size"
          value={
            reference.averageHeightValue != null
              ? `Average ${reference.averageHeightValue}${reference.averageHeightUnit ?? ""}${reference.maximumHeightValue != null ? ` • max ${reference.maximumHeightValue}${reference.maximumHeightUnit ?? ""}` : ""}`
              : reference.maximumHeightValue != null
                ? `Max ${reference.maximumHeightValue}${reference.maximumHeightUnit ?? ""}`
                : null
          }
        />
        <InfoCard
          label="Spread"
          value={
            reference.plantingSpreadValue != null
              ? `${reference.plantingSpreadValue}${reference.plantingSpreadUnit ?? ""}`
              : null
          }
        />
      </div>

      {reference.observations ? (
        <div className="mt-6 rounded-2xl bg-surface-container-high/35 p-4 ring-1 ring-outline-variant/10">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
            Observations
          </p>
          <p className="mt-2 text-sm leading-relaxed text-on-surface">
            {reference.observations}
          </p>
        </div>
      ) : null}
    </section>
  );
}
