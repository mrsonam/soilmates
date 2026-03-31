import Link from "next/link";
import { Image as ImageIcon, Leaf, MapPin, Bell, NotebookText, Sparkles } from "lucide-react";
import type { GlobalSearchResults } from "@/lib/search/types";
import { formatCareLogWhen, formatShortDate } from "@/lib/format";
import type { ReactNode } from "react";

function compactStrings(values: Array<string | null>) {
  return values.filter((value): value is string => Boolean(value));
}

export function SearchResults({ results }: { results: GlobalSearchResults }) {
  const { groups } = results;

  return (
    <div className="space-y-10">
      <SearchResultsGroup
        title="Plants"
        count={groups.plants.length}
        emptyHint="Try a nickname, common name, or area."
      >
        <div className="space-y-3">
          {groups.plants.map((p) => (
            <ResultRow
              key={p.id}
              href={`/collections/${p.collection.slug}/plants/${p.slug}`}
              icon={<Leaf className="size-4" strokeWidth={2} aria-hidden />}
              title={p.nickname}
              meta={compactStrings([
                p.referenceCommonName ? p.referenceCommonName : null,
                `${p.collection.name} · ${p.area.name}`,
                p.healthStatus === "needs_attention" ? "Needs attention" : "Thriving",
              ])}
            />
          ))}
        </div>
      </SearchResultsGroup>

      <SearchResultsGroup
        title="Collections"
        count={groups.collections.length}
        emptyHint="Try a space name."
      >
        <div className="space-y-3">
          {groups.collections.map((c) => (
            <ResultRow
              key={c.id}
              href={`/collections/${c.slug}`}
              icon={<Sparkles className="size-4" strokeWidth={2} aria-hidden />}
              title={c.name}
              meta={compactStrings([
                c.description ? c.description : null,
                `${c.stats.plantCount} plants · ${c.stats.areaCount} areas`,
              ])}
            />
          ))}
        </div>
      </SearchResultsGroup>

      <SearchResultsGroup
        title="Areas"
        count={groups.areas.length}
        emptyHint="Try a room or location."
      >
        <div className="space-y-3">
          {groups.areas.map((a) => (
            <ResultRow
              key={a.id}
              href={`/collections/${a.collection.slug}/areas/${a.slug}`}
              icon={<MapPin className="size-4" strokeWidth={2} aria-hidden />}
              title={a.name}
              meta={compactStrings([
                a.collection.name,
                `${a.plantCount} plants`,
                a.description ? a.description : null,
              ])}
            />
          ))}
        </div>
      </SearchResultsGroup>

      <SearchResultsGroup
        title="Reminders"
        count={groups.reminders.length}
        emptyHint="Try a reminder title or plant name."
      >
        <div className="space-y-3">
          {groups.reminders.map((r) => (
            <ResultRow
              key={r.id}
              href={`/collections/${r.collection.slug}/plants/${r.plant.slug}/reminders`}
              icon={<Bell className="size-4" strokeWidth={2} aria-hidden />}
              title={r.title}
              meta={compactStrings([
                r.collection.name,
                r.plant.nickname,
                r.isPaused ? "Paused" : `Next due ${formatShortDate(r.nextDueAt)}`,
              ])}
            />
          ))}
        </div>
      </SearchResultsGroup>

      <SearchResultsGroup
        title="Care logs"
        count={groups.careLogs.length}
        emptyHint="Try an action like “watered” or a note keyword."
      >
        <div className="space-y-3">
          {groups.careLogs.map((l) => (
            <ResultRow
              key={l.id}
              href={`/collections/${l.collection.slug}/plants/${l.plant.slug}/history`}
              icon={<NotebookText className="size-4" strokeWidth={2} aria-hidden />}
              title={humanizeEnum(String(l.actionType))}
              meta={compactStrings([
                l.collection.name,
                l.plant.nickname,
                formatCareLogWhen(l.actionAt.toISOString()),
                l.notes ? preview(l.notes, 80) : null,
              ])}
            />
          ))}
        </div>
      </SearchResultsGroup>

      <SearchResultsGroup
        title="Photos"
        count={groups.photos.length}
        emptyHint="Try a plant name."
      >
        <div className="space-y-3">
          {groups.photos.map((p) => (
            <ResultRow
              key={p.id}
              href={`/collections/${p.collection.slug}/plants/${p.plant.slug}/photos`}
              icon={<ImageIcon className="size-4" strokeWidth={2} aria-hidden />}
              title={p.plant.nickname}
              meta={compactStrings([
                p.collection.name,
                humanizeEnum(p.imageType),
                formatShortDate(p.capturedAt ?? p.createdAt),
              ])}
            />
          ))}
        </div>
      </SearchResultsGroup>

      <SearchResultsGroup
        title="Activity"
        count={groups.activity.length}
        emptyHint="Try an event summary keyword."
      >
        <div className="space-y-3">
          {groups.activity.map((a) => (
            <ResultRow
              key={a.id}
              href={
                a.plant
                  ? `/collections/${a.collection.slug}/plants/${a.plant.slug}`
                  : `/activity?collection=${encodeURIComponent(a.collection.slug)}`
              }
              icon={<Sparkles className="size-4" strokeWidth={2} aria-hidden />}
              title={a.summary}
              meta={compactStrings([
                a.collection.name,
                a.plant ? a.plant.nickname : null,
                formatCareLogWhen(a.createdAt.toISOString()),
              ])}
            />
          ))}
        </div>
      </SearchResultsGroup>
    </div>
  );
}

function SearchResultsGroup({
  title,
  count,
  emptyHint,
  children,
}: {
  title: string;
  count: number;
  emptyHint: string;
  children: ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section>
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-lg font-semibold text-on-surface">
          {title}
        </h2>
        <p className="text-xs font-medium text-on-surface-variant">{count}</p>
      </div>
      <div className="mt-4">{children}</div>
      <p className="mt-4 text-xs text-on-surface-variant">{emptyHint}</p>
    </section>
  );
}

function ResultRow({
  href,
  icon,
  title,
  meta,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  meta: string[];
}) {
  return (
    <Link
      href={href}
      className="group flex gap-4 rounded-2xl bg-surface-container-lowest/80 p-4 shadow-(--shadow-ambient) ring-1 ring-outline-variant/8 transition ring-inset hover:ring-outline-variant/15 sm:gap-5 sm:p-5"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/10">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-semibold tracking-tight text-on-surface">
          {title}
        </p>
        {meta.length > 0 ? (
          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
            {meta.join(" · ")}
          </p>
        ) : null}
      </div>
      <div className="hidden shrink-0 self-center rounded-full bg-surface-container-high/80 px-3 py-1 text-xs font-medium text-on-surface-variant ring-1 ring-outline-variant/12 transition group-hover:bg-surface-container-high group-hover:text-on-surface sm:inline-flex">
        Open
      </div>
    </Link>
  );
}

function humanizeEnum(value: string) {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function preview(value: string, max: number) {
  const s = value.trim().replace(/\s+/g, " ");
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

