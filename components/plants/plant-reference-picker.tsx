"use client";

import {
  useDeferredValue,
  useEffect,
  useId,
  useState,
  type ReactNode,
} from "react";
import { LoaderCircle, Search, Sprout, X } from "lucide-react";
import type {
  NormalizedPlantReference,
  TreflePlantSearchItem,
} from "@/lib/integrations/trefle/types";
import { createReferenceIdentifier } from "@/lib/integrations/trefle/types";

type PlantReferencePickerProps = {
  pending: boolean;
  inputClass: string;
  labelClass: string;
};

type SearchResponse = {
  items?: TreflePlantSearchItem[];
  error?: string;
};

type SelectionResponse = {
  reference?: NormalizedPlantReference;
  error?: string;
};

function MetadataPill({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-full bg-surface-container-high px-2.5 py-1 text-[0.68rem] font-medium text-on-surface-variant ring-1 ring-outline-variant/10">
      {children}
    </span>
  );
}

export function PlantReferencePicker({
  pending,
  inputClass,
  labelClass,
}: PlantReferencePickerProps) {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [manualReferenceName, setManualReferenceName] = useState("");
  const [items, setItems] = useState<TreflePlantSearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [selectedReference, setSelectedReference] =
    useState<NormalizedPlantReference | null>(null);
  const [isLoadingReference, setIsLoadingReference] = useState(false);
  const [referenceError, setReferenceError] = useState<string | null>(null);

  const deferredQuery = useDeferredValue(query.trim());

  useEffect(() => {
    if (selectedReference) return;
    if (deferredQuery.length < 2) {
      setItems([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await fetch(
          `/api/plant-references/search?q=${encodeURIComponent(deferredQuery)}`,
          { signal: controller.signal },
        );
        const payload = (await response.json()) as SearchResponse;
        if (!response.ok) {
          throw new Error(payload.error ?? "Unable to load plant references.");
        }
        setItems(payload.items ?? []);
      } catch (error) {
        if (controller.signal.aborted) return;
        setItems([]);
        setSearchError(
          error instanceof Error
            ? error.message
            : "Unable to load plant references.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [deferredQuery, selectedReference]);

  async function selectReference(item: TreflePlantSearchItem) {
    const identifier = createReferenceIdentifier(item);
    setReferenceError(null);
    setIsLoadingReference(true);

    try {
      const response = await fetch(
        `/api/plant-references/${encodeURIComponent(identifier)}`,
      );
      const payload = (await response.json()) as SelectionResponse;
      if (!response.ok || !payload.reference) {
        throw new Error(
          payload.error ?? "Unable to load plant reference right now.",
        );
      }

      setSelectedReference(payload.reference);
      setManualReferenceName("");
      setQuery(
        payload.reference.commonName ?? payload.reference.scientificName ?? "",
      );
      setItems([]);
    } catch (error) {
      setReferenceError(
        error instanceof Error
          ? error.message
          : "Unable to load plant reference right now.",
      );
    } finally {
      setIsLoadingReference(false);
    }
  }

  function clearReference() {
    setSelectedReference(null);
    setReferenceError(null);
    setItems([]);
    setQuery("");
  }

  const selectedName =
    selectedReference?.commonName ?? selectedReference?.scientificName ?? "";

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor={searchId} className={labelClass}>
          Plant reference search
        </label>
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-on-surface-variant/70"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            id={searchId}
            type="text"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              if (selectedReference) {
                setSelectedReference(null);
              }
            }}
            disabled={pending || isLoadingReference}
            autoComplete="off"
            placeholder="Search plants, e.g. Monstera deliciosa"
            className={`${inputClass} pl-11 pr-11`}
            aria-describedby={`${searchId}-hint`}
          />
          {isSearching || isLoadingReference ? (
            <LoaderCircle
              className="absolute right-4 top-1/2 size-4 -translate-y-1/2 animate-spin text-on-surface-variant"
              strokeWidth={1.75}
              aria-hidden
            />
          ) : null}
        </div>
        <p
          id={`${searchId}-hint`}
          className="mt-2 text-xs text-on-surface-variant"
        >
          Search stays server-side. Select a reference to save a stable local
          snapshot, or continue with manual entry.
        </p>
      </div>

      {!selectedReference && deferredQuery.length >= 2 ? (
        <div className="overflow-hidden rounded-3xl bg-surface-container-lowest ring-1 ring-outline-variant/10">
          {searchError ? (
            <p className="px-4 py-4 text-sm text-on-surface-variant">
              {searchError}
            </p>
          ) : items.length === 0 && !isSearching ? (
            <p className="px-4 py-4 text-sm text-on-surface-variant">
              No plants found. You can still continue with manual entry.
            </p>
          ) : (
            <ul className="divide-y divide-outline-variant/8">
              {items.map((item) => {
                const title =
                  item.commonName ?? item.scientificName ?? "Unknown plant";
                return (
                  <li key={item.providerPlantId}>
                    <button
                      type="button"
                      onClick={() => void selectReference(item)}
                      disabled={pending || isLoadingReference}
                      className="flex w-full items-start gap-3 px-4 py-4 text-left transition hover:bg-surface-container-low/60 disabled:cursor-not-allowed"
                    >
                      <div className="mt-0.5 flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-fixed/20">
                        {item.imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element -- provider host is dynamic
                          <img
                            src={item.imageUrl}
                            alt=""
                            className="size-full object-cover"
                          />
                        ) : (
                          <Sprout
                            className="size-5 text-primary"
                            strokeWidth={1.75}
                            aria-hidden
                          />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-on-surface">
                          {title}
                        </p>
                        {item.scientificName ? (
                          <p className="mt-1 truncate text-sm italic text-on-surface-variant">
                            {item.scientificName}
                          </p>
                        ) : null}
                        <div className="mt-2 flex flex-wrap gap-2">
                          {item.family ? <MetadataPill>{item.family}</MetadataPill> : null}
                          {item.status ? <MetadataPill>{item.status}</MetadataPill> : null}
                          {item.rank ? <MetadataPill>{item.rank}</MetadataPill> : null}
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      ) : null}

      {selectedReference ? (
        <div className="rounded-3xl bg-surface-container-low/60 p-5 ring-1 ring-outline-variant/10 sm:p-6">
          <input
            type="hidden"
            name="referenceIdentifier"
            value={createReferenceIdentifier(selectedReference)}
          />
          <input
            type="hidden"
            name="referenceCommonName"
            value={selectedName}
          />

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-primary/90">
                Plant reference
              </p>
              <h4 className="mt-2 font-display text-xl font-semibold text-on-surface">
                {selectedName}
              </h4>
              {selectedReference.scientificName ? (
                <p className="mt-1 text-sm italic text-on-surface-variant">
                  {selectedReference.scientificName}
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={clearReference}
              disabled={pending}
              className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-2 text-xs font-semibold text-on-surface transition hover:bg-surface-container-highest"
            >
              <X className="size-3.5" strokeWidth={2} aria-hidden />
              Clear
            </button>
          </div>

          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_10rem]">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {selectedReference.family ? (
                  <MetadataPill>{selectedReference.family}</MetadataPill>
                ) : null}
                {selectedReference.genus ? (
                  <MetadataPill>{selectedReference.genus}</MetadataPill>
                ) : null}
                {selectedReference.edible === true ? (
                  <MetadataPill>Edible</MetadataPill>
                ) : null}
                {selectedReference.toxicityLabel ? (
                  <MetadataPill>{selectedReference.toxicityLabel}</MetadataPill>
                ) : null}
              </div>

              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                    Light
                  </dt>
                  <dd className="mt-1 text-sm text-on-surface">
                    {selectedReference.lightLabel ?? "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                    Soil moisture
                  </dt>
                  <dd className="mt-1 text-sm text-on-surface">
                    {selectedReference.soilMoistureLabel ?? "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                    Humidity
                  </dt>
                  <dd className="mt-1 text-sm text-on-surface">
                    {selectedReference.humidityLabel ?? "Not provided"}
                  </dd>
                </div>
                <div>
                  <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                    Temperature
                  </dt>
                  <dd className="mt-1 text-sm text-on-surface">
                    {selectedReference.temperatureLabel ?? "Not provided"}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="overflow-hidden rounded-3xl bg-surface-container-lowest ring-1 ring-outline-variant/10">
              {selectedReference.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- provider host is dynamic
                <img
                  src={selectedReference.imageUrl}
                  alt=""
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square items-center justify-center bg-primary-fixed/15">
                  <Sprout
                    className="size-8 text-primary"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <label htmlFor={`${searchId}-manual`} className={labelClass}>
            Manual reference label
          </label>
          <input
            id={`${searchId}-manual`}
            name="referenceCommonName"
            type="text"
            value={manualReferenceName}
            onChange={(event) => setManualReferenceName(event.target.value)}
            disabled={pending}
            placeholder="Optional fallback, e.g. Monstera deliciosa"
            className={inputClass}
          />
          {referenceError ? (
            <p className="mt-2 text-sm text-on-surface-variant">
              {referenceError}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
