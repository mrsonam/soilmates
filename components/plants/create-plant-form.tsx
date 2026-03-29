"use client";

import { useActionState, type ReactNode } from "react";
import Link from "next/link";
import { Camera, Heart, Meh } from "lucide-react";
import { createPlantAction } from "@/app/(app)/collections/[collectionSlug]/plants/actions";
import { createPlantFormInitialState } from "@/app/(app)/collections/[collectionSlug]/plants/plant-form-state";
import type { PlantCreateAreaOption } from "@/lib/plants/queries";
import { PlantsScreenHeader } from "./plants-screen-header";

const LIFE_STAGES = [
  { value: "sprout", label: "Sprout" },
  { value: "juvenile", label: "Juvenile" },
  { value: "mature", label: "Mature" },
] as const;

const ACQUISITION = [
  { value: "purchased", label: "Purchased" },
  { value: "propagated", label: "Propagated" },
  { value: "gift", label: "Gift" },
  { value: "seed", label: "From seed" },
  { value: "other", label: "Other" },
] as const;

type CreatePlantFormProps = {
  collectionSlug: string;
  collectionName: string;
  areas: PlantCreateAreaOption[];
};

function SectionShell({
  n,
  title,
  children,
}: {
  n: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-surface-container-low/60 p-6 ring-1 ring-outline-variant/[0.08] sm:p-8">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
        Section {n}
      </p>
      <h3 className="mt-1 font-display text-lg font-semibold text-on-surface">
        {title}
      </h3>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export function CreatePlantForm({
  collectionSlug,
  collectionName,
  areas,
}: CreatePlantFormProps) {
  const [state, formAction, pending] = useActionState(
    createPlantAction,
    createPlantFormInitialState,
  );

  return (
    <div className="lg:grid lg:grid-cols-[1fr,min(18rem,28%)] lg:gap-10 lg:items-start">
      <div>
        <PlantsScreenHeader
          eyebrow="Add plant"
          title="Add new plant"
          description={
            <>
              Welcome a new member to your botanical family in{" "}
              <span className="font-medium text-on-surface">{collectionName}</span>
              . Provide the basics to start tracking growth and health.
            </>
          }
        />

        <form action={formAction} className="mt-8 space-y-8">
          <input type="hidden" name="collectionSlug" value={collectionSlug} />

          {state.error && (
            <p
              className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant"
              role="alert"
            >
              {state.error}
            </p>
          )}

          <SectionShell n={1} title="Basic identity">
            <div>
              <label
                htmlFor="plant-nickname"
                className="mb-2 block text-sm font-medium text-on-surface"
              >
                Plant nickname <span className="text-primary">*</span>
              </label>
              <input
                id="plant-nickname"
                name="nickname"
                required
                autoComplete="off"
                disabled={pending}
                placeholder="e.g. Sir Moss-a-lot"
                className="w-full rounded-2xl border border-transparent bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15 transition focus-visible:ring-2 focus-visible:ring-primary/25"
              />
            </div>
            <div>
              <label
                htmlFor="plant-reference-select"
                className="mb-2 block text-sm font-medium text-on-surface"
              >
                Species / reference
              </label>
              <select
                id="plant-reference-select"
                disabled
                className="w-full cursor-not-allowed rounded-2xl border border-transparent bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface-variant outline-none ring-1 ring-outline-variant/15"
                aria-label="Species catalog (coming soon)"
              >
                <option>Select species…</option>
              </select>
              <p className="mt-1.5 text-xs text-on-surface-variant">
                Searchable plant database will connect here. For now, add a
                common name below if you like.
              </p>
            </div>
            <div>
              <label
                htmlFor="reference-common"
                className="mb-2 block text-sm font-medium text-on-surface"
              >
                Common / scientific name{" "}
                <span className="font-normal text-on-surface-variant">
                  (optional)
                </span>
              </label>
              <input
                id="reference-common"
                name="referenceCommonName"
                type="text"
                disabled={pending}
                placeholder="e.g. Monstera deliciosa"
                className="w-full rounded-2xl border border-transparent bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15 transition focus-visible:ring-2 focus-visible:ring-primary/25"
              />
            </div>
            <div>
              <label
                htmlFor="plant-type"
                className="mb-2 block text-sm font-medium text-on-surface"
              >
                Plant type{" "}
                <span className="font-normal text-on-surface-variant">
                  (optional)
                </span>
              </label>
              <input
                id="plant-type"
                name="plantType"
                type="text"
                disabled={pending}
                placeholder="e.g. Tropical foliage"
                className="w-full rounded-2xl border border-transparent bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15 transition focus-visible:ring-2 focus-visible:ring-primary/25"
              />
            </div>
          </SectionShell>

          <SectionShell n={2} title="Location & lifecycle">
            <div>
              <span className="mb-2 block text-sm font-medium text-on-surface">
                Placement area <span className="text-primary">*</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {areas.map((a, i) => (
                  <label
                    key={a.id}
                    className="inline-flex cursor-pointer items-center"
                  >
                    <input
                      type="radio"
                      name="areaId"
                      value={a.id}
                      defaultChecked={i === 0}
                      required
                      disabled={pending}
                      className="peer sr-only"
                    />
                    <span className="rounded-full border border-transparent bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant transition peer-checked:border-primary/30 peer-checked:bg-surface-container-lowest peer-checked:text-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
                      {a.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium text-on-surface">
                Life stage
              </span>
              <div className="flex flex-wrap gap-2">
                {LIFE_STAGES.map((s) => (
                  <label key={s.value} className="inline-flex cursor-pointer">
                    <input
                      type="radio"
                      name="lifeStage"
                      value={s.value}
                      defaultChecked={s.value === "sprout"}
                      disabled={pending}
                      className="peer sr-only"
                    />
                    <span className="rounded-full bg-surface-container-high px-4 py-2 text-sm font-medium text-on-surface-variant transition peer-checked:bg-primary peer-checked:text-on-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
                      {s.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <span className="mb-2 block text-sm font-medium text-on-surface">
                Initial health
              </span>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name="healthStatus"
                    value="thriving"
                    defaultChecked
                    disabled={pending}
                    className="peer sr-only"
                  />
                  <span className="flex items-center gap-3 rounded-2xl border-2 border-transparent bg-surface-container-lowest p-4 ring-1 ring-outline-variant/15 transition peer-checked:border-primary peer-checked:bg-primary-fixed/25 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
                    <Heart
                      className="size-8 text-primary"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <span>
                      <span className="block font-medium text-on-surface">
                        Thriving
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Settling in well
                      </span>
                    </span>
                  </span>
                </label>
                <label className="relative block cursor-pointer">
                  <input
                    type="radio"
                    name="healthStatus"
                    value="needs_attention"
                    disabled={pending}
                    className="peer sr-only"
                  />
                  <span className="flex items-center gap-3 rounded-2xl border-2 border-transparent bg-surface-container-lowest p-4 ring-1 ring-outline-variant/15 transition peer-checked:border-outline-variant peer-checked:bg-surface-container-high/80 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
                    <Meh
                      className="size-8 text-on-surface-variant"
                      strokeWidth={1.5}
                      aria-hidden
                    />
                    <span>
                      <span className="block font-medium text-on-surface">
                        Needs attention
                      </span>
                      <span className="text-xs text-on-surface-variant">
                        Extra care for now
                      </span>
                    </span>
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="acquisition-type"
                className="mb-2 block text-sm font-medium text-on-surface"
              >
                How you got it
              </label>
              <select
                id="acquisition-type"
                name="acquisitionType"
                disabled={pending}
                defaultValue="purchased"
                className="w-full rounded-2xl border border-transparent bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
              >
                {ACQUISITION.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="acquired-at"
                className="mb-2 block text-sm font-medium text-on-surface"
              >
                Acquired or seeded date{" "}
                <span className="font-normal text-on-surface-variant">
                  (optional)
                </span>
              </label>
              <input
                id="acquired-at"
                name="acquiredAt"
                type="date"
                disabled={pending}
                className="w-full rounded-2xl border border-transparent bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
              />
            </div>
            <div>
              <label
                htmlFor="growth-pct"
                className="mb-2 block text-sm font-medium text-on-surface"
              >
                Growth progress %{" "}
                <span className="font-normal text-on-surface-variant">
                  (optional)
                </span>
              </label>
              <input
                id="growth-pct"
                name="growthProgressPercent"
                type="number"
                min={0}
                max={100}
                disabled={pending}
                placeholder="0–100"
                className="w-full max-w-[12rem] rounded-2xl border border-transparent bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
              />
            </div>
          </SectionShell>

          <SectionShell n={3} title="Notes & media">
            <div>
              <label
                htmlFor="plant-notes"
                className="mb-2 block text-sm font-medium text-on-surface"
              >
                Notes & care instructions
              </label>
              <textarea
                id="plant-notes"
                name="notes"
                rows={4}
                disabled={pending}
                placeholder="Mention any special quirks or watering schedules…"
                className="w-full resize-none rounded-2xl border border-transparent bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
              />
            </div>
            <div>
              <label
                htmlFor="primary-image-url"
                className="mb-2 block text-sm font-medium text-on-surface"
              >
                Image URL{" "}
                <span className="font-normal text-on-surface-variant">
                  (optional)
                </span>
              </label>
              <input
                id="primary-image-url"
                name="primaryImageUrl"
                type="url"
                disabled={pending}
                placeholder="https://…"
                className="w-full rounded-2xl border border-transparent bg-surface-container-lowest px-4 py-3 text-sm text-on-surface outline-none ring-1 ring-outline-variant/15"
              />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-on-surface">
                Photo upload
              </p>
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/35 bg-surface-container-low/40 px-6 py-12 text-center">
                <Camera
                  className="size-10 text-on-surface-variant/40"
                  strokeWidth={1.25}
                  aria-hidden
                />
                <p className="mt-3 text-sm text-on-surface-variant">
                  Upload from device — coming soon
                </p>
                <input type="file" accept="image/*" disabled className="sr-only" />
              </div>
            </div>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                name="isFavorite"
                value="on"
                disabled={pending}
                className="size-4 rounded border-outline-variant text-primary focus:ring-primary/30"
              />
              <span className="text-sm text-on-surface">Mark as favorite</span>
            </label>
          </SectionShell>

          <div className="flex flex-col-reverse gap-3 border-t border-outline-variant/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href={`/collections/${collectionSlug}/plants`}
              className="text-center text-sm font-medium text-on-surface-variant transition hover:text-on-surface sm:text-left"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={pending}
              className="h-12 rounded-full bg-primary px-8 text-sm font-medium text-on-primary transition hover:bg-primary/90 disabled:opacity-60"
            >
              {pending ? "Creating…" : "Create plant"}
            </button>
          </div>
        </form>
      </div>

      <aside className="mt-10 hidden lg:sticky lg:top-28 lg:mt-0 lg:block">
        <div className="rotate-2 overflow-hidden rounded-3xl bg-on-surface shadow-(--shadow-ambient) ring-1 ring-outline-variant/20">
          <div className="aspect-[3/4] bg-gradient-to-br from-neutral-200 to-neutral-400" />
          <div className="bg-surface-container-lowest px-5 py-4">
            <p className="text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              Inspiration
            </p>
            <p className="mt-2 font-display text-sm italic leading-relaxed text-on-surface">
              &ldquo;To plant a garden is to believe in tomorrow.&rdquo;
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}
