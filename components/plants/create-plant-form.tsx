"use client";

import {
  useActionState,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Camera,
  ChevronRight,
  Heart,
  ImagePlus,
  Leaf,
  MapPin,
  Meh,
  Sparkles,
} from "lucide-react";
import { CollectionSectionTabs } from "@/components/collections/collection-section-tabs";
import { AppDatePicker } from "@/components/ui/app-date-picker";
import { AppSelect } from "@/components/ui/app-select";
import { PlantReferencePicker } from "@/components/plants/plant-reference-picker";
import { createPlantAction } from "@/app/(app)/collections/[collectionSlug]/plants/actions";
import { createPlantFormInitialState } from "@/app/(app)/collections/[collectionSlug]/plants/plant-form-state";
import type { PlantCreateAreaOption } from "@/lib/plants/queries";

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

export type CreatePlantFormProps =
  | {
      mode?: "collection";
      collectionSlug: string;
      collectionName: string;
      areas: PlantCreateAreaOption[];
      uploadsEnabled: boolean;
      /**
       * When set (e.g. from `/collections/.../plants/new`), show collection + area
       * dropdowns so the plant can be placed in another collection.
       */
      placementCollections?: { slug: string; name: string }[];
      placementAreasByCollectionSlug?: Record<string, PlantCreateAreaOption[]>;
    }
  | {
      mode: "global";
      collections: { slug: string; name: string }[];
      areasByCollectionSlug: Record<string, PlantCreateAreaOption[]>;
      uploadsEnabled: boolean;
    };

const inputClass =
  "w-full rounded-2xl border-0 bg-surface-container-lowest px-4 py-3.5 text-sm text-on-surface shadow-(--shadow-ambient) ring-1 ring-outline-variant/10 outline-none transition placeholder:text-on-surface-variant/60 focus-visible:ring-2 focus-visible:ring-primary/35";

const labelClass = "mb-2 block text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-on-surface-variant";

function FieldGroup({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-surface-container-lowest/50 p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-7">
      <div className="flex gap-3 border-b border-outline-variant/10 pb-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-lg font-semibold tracking-tight text-on-surface">
            {title}
          </h3>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-6 space-y-5">{children}</div>
    </section>
  );
}

export function CreatePlantForm(props: CreatePlantFormProps) {
  const isGlobal = props.mode === "global";
  const uploadsEnabled = props.uploadsEnabled;

  const showPlacementPicker =
    (isGlobal && props.mode === "global") ||
    (!isGlobal &&
      Boolean(props.placementCollections?.length) &&
      Boolean(props.placementAreasByCollectionSlug));

  const placementCollectionOptions =
    isGlobal && props.mode === "global"
      ? props.collections
      : !isGlobal && props.placementCollections
        ? props.placementCollections
        : [];

  const [selectedCollectionSlug, setSelectedCollectionSlug] = useState(() => {
    if (props.mode === "global") {
      if (props.collections.length === 1) return props.collections[0].slug;
      return "";
    }
    if (props.placementCollections?.length) {
      return props.collectionSlug;
    }
    return "";
  });

  const [selectedAreaId, setSelectedAreaId] = useState("");
  const [acquisitionType, setAcquisitionType] = useState("purchased");
  const [acquiredAt, setAcquiredAt] = useState("");

  const resolvedAreas =
    isGlobal && props.mode === "global"
      ? props.areasByCollectionSlug[selectedCollectionSlug] ?? []
      : !isGlobal && props.placementAreasByCollectionSlug
        ? props.placementAreasByCollectionSlug[selectedCollectionSlug] ?? []
        : [];

  const router = useRouter();
  const [state, formAction, pending] = useActionState(
    createPlantAction,
    createPlantFormInitialState,
  );
  const coverInputRef = useRef<HTMLInputElement>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  useEffect(() => {
    if (props.mode === "global") {
      const areas =
        props.areasByCollectionSlug[selectedCollectionSlug] ?? [];
      if (areas.length === 1) setSelectedAreaId(areas[0].id);
      else setSelectedAreaId("");
      return;
    }
    if (props.placementAreasByCollectionSlug) {
      const areas =
        props.placementAreasByCollectionSlug[selectedCollectionSlug] ?? [];
      if (areas.length === 1) setSelectedAreaId(areas[0].id);
      else setSelectedAreaId("");
    }
  }, [props, selectedCollectionSlug]);

  useEffect(() => {
    if (state.success && state.slug && state.collectionSlug) {
      router.push(
        `/collections/${state.collectionSlug}/plants/${state.slug}`,
      );
      router.refresh();
    }
  }, [state.success, state.slug, state.collectionSlug, router]);

  const plantsHref = isGlobal
    ? "/plants"
    : `/collections/${props.collectionSlug}/plants`;

  function clearCover() {
    setCoverPreview(null);
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  function openCamera() {
    const el = coverInputRef.current;
    if (!el) return;
    el.setAttribute("capture", "environment");
    el.click();
    queueMicrotask(() => el.removeAttribute("capture"));
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      {!isGlobal ? (
        <CollectionSectionTabs
          collectionSlug={props.collectionSlug}
          className="mb-6"
        />
      ) : null}
      {isGlobal ? (
        <nav
          className="mb-8 flex flex-wrap items-center gap-1 text-sm text-on-surface-variant"
          aria-label="Breadcrumb"
        >
          <Link
            href="/plants"
            className="font-medium text-primary transition hover:underline"
          >
            Plants
          </Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-45" aria-hidden />
          <span className="font-medium text-on-surface">New plant</span>
        </nav>
      ) : (
        <nav
          className="mb-8 flex flex-wrap items-center gap-1 text-sm text-on-surface-variant"
          aria-label="Breadcrumb"
        >
          <Link
            href="/collections"
            className="font-medium text-primary transition hover:underline"
          >
            Collections
          </Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-45" aria-hidden />
          <Link
            href={`/collections/${props.collectionSlug}`}
            className="max-w-[9rem] truncate font-medium text-primary transition hover:underline sm:max-w-xs"
          >
            {props.collectionName}
          </Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-45" aria-hidden />
          <Link
            href={plantsHref}
            className="font-medium text-primary transition hover:underline"
          >
            Plants
          </Link>
          <ChevronRight className="size-3.5 shrink-0 opacity-45" aria-hidden />
          <span className="font-medium text-on-surface">New plant</span>
        </nav>
      )}

      <header className="mb-10">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary/90">
          {isGlobal ? "Across your collections" : props.collectionName}
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-[2rem]">
          Add a plant
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-on-surface-variant">
          {isGlobal
            ? "Choose a collection and area, then add the basics. You can attach a cover photo and open the growth gallery from the plant profile."
            : "A few details are enough to get started. You can add photos and a growth gallery anytime from the plant's page."}
        </p>
      </header>

      <form
        action={formAction}
        method="POST"
        encType="multipart/form-data"
        className="space-y-8 pb-24 sm:pb-8"
      >
        {!isGlobal && !showPlacementPicker ? (
          <input
            type="hidden"
            name="collectionSlug"
            value={props.collectionSlug}
          />
        ) : null}

        {state.error ? (
          <div
            className="rounded-2xl border border-red-500/25 bg-red-500/8 px-4 py-3 text-sm text-red-900 dark:text-red-200/95"
            role="alert"
          >
            {state.error}
          </div>
        ) : null}

        {showPlacementPicker ? (
          <FieldGroup
            icon={<MapPin className="size-5" strokeWidth={1.75} aria-hidden />}
            title="Placement"
            description="Every plant belongs to one collection and area. Pick where this plant should live."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="global-collection-slug" className={labelClass}>
                  Collection <span className="text-primary">*</span>
                </label>
                <AppSelect
                  id="global-collection-slug"
                  name="collectionSlug"
                  options={placementCollectionOptions.map((c) => ({
                    value: c.slug,
                    label: c.name,
                  }))}
                  value={selectedCollectionSlug}
                  onChange={setSelectedCollectionSlug}
                  placeholder="Select a collection…"
                  required
                  disabled={pending}
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="global-area-id" className={labelClass}>
                  Area <span className="text-primary">*</span>
                </label>
                <AppSelect
                  id="global-area-id"
                  name="areaId"
                  key={selectedCollectionSlug || "none"}
                  options={resolvedAreas.map((a) => ({
                    value: a.id,
                    label: a.name,
                  }))}
                  value={selectedAreaId}
                  onChange={setSelectedAreaId}
                  placeholder="Select an area…"
                  required={resolvedAreas.length > 0}
                  disabled={
                    pending ||
                    !selectedCollectionSlug ||
                    resolvedAreas.length === 0
                  }
                />
              </div>
            </div>
          </FieldGroup>
        ) : null}

        <FieldGroup
          icon={<Leaf className="size-5" strokeWidth={1.75} aria-hidden />}
          title="Identity"
          description="Choose a plant reference when you can, then keep household-specific choices separate."
        >
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <div className="sm:col-span-2">
              <label htmlFor="plant-nickname" className={labelClass}>
                Nickname <span className="text-primary">*</span>
              </label>
              <input
                id="plant-nickname"
                name="nickname"
                required
                autoComplete="off"
                disabled={pending}
                placeholder="e.g. Sir Moss-a-lot"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <PlantReferencePicker
                pending={pending}
                inputClass={inputClass}
                labelClass={labelClass}
              />
            </div>
            <div>
              <label htmlFor="plant-type" className={labelClass}>
                Custom plant type
              </label>
              <input
                id="plant-type"
                name="plantType"
                type="text"
                disabled={pending}
                placeholder="Optional, e.g. Kitchen herb"
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <p className={labelClass}>Reference behavior</p>
              <AppSelect
                id="plant-reference-select"
                options={[
                  {
                    value: "soon",
                    label: "Searchable database — coming soon",
                  },
                ]}
                value="soon"
                onChange={() => {}}
                disabled
                aria-label="Species catalog (coming soon)"
              />
            </div>
          </div>
        </FieldGroup>

        <FieldGroup
          icon={<Sparkles className="size-5" strokeWidth={1.75} aria-hidden />}
          title="Home & health"
          description={
            isGlobal
              ? "Life stage and how it’s doing today."
              : "Where it lives in your space and how it’s doing today."
          }
        >
          {!isGlobal && !showPlacementPicker ? (
            <div>
              <span className={labelClass}>
                Area <span className="text-primary">*</span>
              </span>
              <div className="flex flex-wrap gap-2.5">
                {props.areas.map((a, i) => (
                  <label key={a.id} className="inline-flex cursor-pointer">
                    <input
                      type="radio"
                      name="areaId"
                      value={a.id}
                      defaultChecked={i === 0}
                      required
                      disabled={pending}
                      className="peer sr-only"
                    />
                    <span className="rounded-2xl bg-surface-container-high/90 px-4 py-2.5 text-sm font-medium text-on-surface-variant shadow-sm ring-1 ring-outline-variant/10 transition peer-checked:bg-primary peer-checked:text-on-primary peer-checked:ring-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
                      {a.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}

          <div>
            <span className={labelClass}>Life stage</span>
            <div className="flex flex-wrap gap-2.5">
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
                  <span className="rounded-2xl bg-surface-container-high/90 px-4 py-2.5 text-sm font-medium text-on-surface-variant shadow-sm ring-1 ring-outline-variant/10 transition peer-checked:bg-primary-fixed/50 peer-checked:text-primary peer-checked:ring-primary/25 peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
                    {s.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <span className={labelClass}>Initial health</span>
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
                <span className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-(--shadow-ambient) ring-1 ring-outline-variant/10 transition peer-checked:ring-2 peer-checked:ring-primary peer-checked:ring-offset-2 peer-checked:ring-offset-surface-container-lowest peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
                  <Heart
                    className="size-9 shrink-0 text-primary"
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
                <span className="flex items-center gap-3 rounded-2xl bg-surface-container-lowest p-4 shadow-(--shadow-ambient) ring-1 ring-outline-variant/10 transition peer-checked:ring-2 peer-checked:ring-outline-variant peer-checked:ring-offset-2 peer-checked:ring-offset-surface-container-lowest peer-focus-visible:ring-2 peer-focus-visible:ring-primary/30">
                  <Meh
                    className="size-9 shrink-0 text-on-surface-variant"
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

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            <div>
              <label htmlFor="acquisition-type" className={labelClass}>
                How you got it
              </label>
              <AppSelect
                id="acquisition-type"
                name="acquisitionType"
                options={ACQUISITION.map((o) => ({
                  value: o.value,
                  label: o.label,
                }))}
                value={acquisitionType}
                onChange={setAcquisitionType}
                disabled={pending}
              />
            </div>
            <div>
              <label htmlFor="acquired-at" className={labelClass}>
                Acquired or seeded date
              </label>
              <AppDatePicker
                id="acquired-at"
                name="acquiredAt"
                value={acquiredAt}
                onChange={setAcquiredAt}
                disabled={pending}
                placeholder="Optional"
                className="max-w-[min(100%,20rem)]"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="growth-pct" className={labelClass}>
                Growth progress (0–100%)
              </label>
              <input
                id="growth-pct"
                name="growthProgressPercent"
                type="number"
                min={0}
                max={100}
                disabled={pending}
                placeholder="Optional"
                className={`${inputClass} max-w-[11rem]`}
              />
            </div>
          </div>
        </FieldGroup>

        <FieldGroup
          icon={<ImagePlus className="size-5" strokeWidth={1.75} aria-hidden />}
          title="Notes & cover image"
          description="Add a cover from your library or camera, paste a URL, or leave blank and add photos later."
        >
          {uploadsEnabled ? (
            <div>
              <span className={labelClass}>Cover photo (optional)</span>
              <div className="overflow-hidden rounded-2xl border border-dashed border-primary/30 bg-primary-fixed/10 p-4 sm:p-5">
                {coverPreview ? (
                  <div className="mb-4 overflow-hidden rounded-xl bg-surface-container-low ring-1 ring-outline-variant/10">
                    {/* eslint-disable-next-line @next/next/no-img-element -- local preview blob */}
                    <img
                      src={coverPreview}
                      alt=""
                      className="mx-auto max-h-52 w-full object-contain"
                    />
                  </div>
                ) : null}
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <input
                    ref={coverInputRef}
                    name="coverImage"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    disabled={pending}
                    onChange={(e) => {
                      const f = e.currentTarget.files?.[0];
                      setCoverPreview(f ? URL.createObjectURL(f) : null);
                    }}
                    className="min-w-0 flex-1 text-sm text-on-surface file:mr-3 file:rounded-xl file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-primary/90"
                  />
                  <button
                    type="button"
                    disabled={pending}
                    onClick={openCamera}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/35 bg-surface-container-lowest px-4 py-2.5 text-xs font-semibold text-primary shadow-sm transition hover:bg-primary/5 disabled:opacity-50"
                  >
                    <Camera className="size-4" strokeWidth={1.75} aria-hidden />
                    Take photo
                  </button>
                  {coverPreview ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={clearCover}
                      className="text-xs font-medium text-on-surface-variant underline-offset-2 hover:text-on-surface hover:underline"
                    >
                      Remove image
                    </button>
                  ) : null}
                </div>
                <p className="mt-3 text-xs leading-relaxed text-on-surface-variant">
                  Stored privately in your collection. JPEG, PNG, WebP, or GIF
                  · up to 10 MB. If you add a file, any cover URL below is
                  ignored.
                </p>
              </div>
            </div>
          ) : (
            <p className="rounded-2xl bg-amber-500/10 px-4 py-3 text-sm text-amber-950/90 ring-1 ring-amber-500/20 dark:text-amber-100/90">
              Connect{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 text-xs">
                SUPABASE_URL
              </code>{" "}
              and{" "}
              <code className="rounded bg-black/5 px-1 py-0.5 text-xs">
                SUPABASE_SERVICE_ROLE_KEY
              </code>{" "}
              to upload a cover from this screen. You can still use an image
              URL or add photos after the plant is created.
            </p>
          )}

          <div>
            <label htmlFor="primary-image-url" className={labelClass}>
              Cover image URL{" "}
              <span className="font-normal normal-case text-on-surface-variant">
                (optional)
              </span>
            </label>
            <input
              id="primary-image-url"
              name="primaryImageUrl"
              type="url"
              disabled={pending}
              placeholder="https://…"
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="plant-notes" className={labelClass}>
              Notes
            </label>
            <textarea
              id="plant-notes"
              name="notes"
              rows={4}
              disabled={pending}
              placeholder="Watering quirks, light preferences, repotting reminders…"
              className={`${inputClass} resize-y min-h-[6rem]`}
            />
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-surface-container-high/40 px-4 py-3 ring-1 ring-outline-variant/10">
            <input
              type="checkbox"
              name="isFavorite"
              value="on"
              disabled={pending}
              className="mt-0.5 size-4 rounded border-outline-variant text-primary focus:ring-primary/30"
            />
            <span className="text-sm leading-snug text-on-surface">
              Mark as favorite — it’ll appear with a heart on your plant list.
            </span>
          </label>
        </FieldGroup>

        <div className="sticky bottom-0 z-10 -mx-1 flex flex-col gap-3 border-t border-outline-variant/15 bg-surface/90 px-1 py-4 backdrop-blur-md sm:static sm:z-0 sm:flex-row sm:items-center sm:justify-between sm:border-0 sm:bg-transparent sm:px-0 sm:py-0 sm:backdrop-blur-none">
          <Link
            href={plantsHref}
            className="order-2 text-center text-sm font-medium text-on-surface-variant transition hover:text-on-surface sm:order-1 sm:text-left"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={pending}
            className="order-1 h-12 w-full rounded-full bg-primary text-sm font-semibold text-on-primary shadow-(--shadow-ambient) transition hover:bg-primary/90 disabled:opacity-60 sm:order-2 sm:w-auto sm:min-w-[11rem]"
          >
            {pending ? "Creating…" : "Create plant"}
          </button>
        </div>
      </form>
    </div>
  );
}
