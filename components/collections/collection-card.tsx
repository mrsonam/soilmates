import { IntentPrefetchLink } from "@/components/navigation/intent-prefetch-link";
import { LayoutGrid, Sprout, Users } from "lucide-react";
import { formatShortDate } from "@/lib/format";

export type CollectionCardModel = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  createdAt: string;
  memberCount: number;
  plantCount: number;
  areaCount: number;
  coverImageSignedUrl: string | null;
};

type CollectionCardProps = {
  collection: CollectionCardModel;
};

export function CollectionCard({ collection }: CollectionCardProps) {
  const {
    name,
    slug,
    description,
    createdAt,
    memberCount,
    plantCount,
    areaCount,
    coverImageSignedUrl,
  } = collection;

  const privacyLabel = memberCount > 1 ? "Shared" : "Private";

  return (
    <IntentPrefetchLink
      href={`/collections/${slug}`}
      className="card-lift group block overflow-hidden rounded-3xl bg-surface-container-lowest ring-1 ring-outline-variant/[0.07] transition-[transform,box-shadow] duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-gradient-to-br from-primary-fixed/35 via-surface-container-low to-primary-fixed-dim/40">
        {coverImageSignedUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- signed URL from private bucket */}
            <img
              src={coverImageSignedUrl}
              alt=""
              className="absolute inset-0 size-full object-cover transition duration-200 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-on-surface/55 via-on-surface/10 to-transparent" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(81,100,71,0.12),transparent_55%)]" />
            <Sprout
              className="absolute left-1/2 top-1/2 size-14 -translate-x-1/2 -translate-y-1/2 text-primary/35 transition group-hover:scale-105 group-hover:text-primary/45"
              strokeWidth={1.25}
              aria-hidden
            />
          </>
        )}
        <span className="absolute bottom-3 left-3 rounded-full bg-on-surface/55 px-2.5 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-surface backdrop-blur-sm">
          {privacyLabel}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <h3 className="font-display text-lg font-semibold tracking-tight text-on-surface group-hover:text-primary">
          {name}
        </h3>
        {description ? (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-on-surface-variant">
            {description}
          </p>
        ) : (
          <p className="mt-2 text-sm italic text-on-surface-variant/70">
            Shared space for your household plants
          </p>
        )}

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-on-surface-variant">
          <span className="inline-flex items-center gap-1.5 font-medium text-on-surface">
            <Sprout className="size-4 text-primary/80" strokeWidth={1.75} aria-hidden />
            <span className="tabular-nums">{plantCount}</span>
            <span className="font-normal text-on-surface-variant">Plants</span>
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium text-on-surface">
            <Users className="size-4 text-primary/80" strokeWidth={1.75} aria-hidden />
            <span className="tabular-nums">{memberCount}</span>
            <span className="font-normal text-on-surface-variant">Members</span>
          </span>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-outline-variant/10 pt-4 text-xs text-on-surface-variant/85">
          <span className="inline-flex items-center gap-1">
            <LayoutGrid className="size-3.5" strokeWidth={1.75} aria-hidden />
            <span className="tabular-nums">{areaCount}</span> areas
          </span>
          <span aria-hidden className="text-on-surface-variant/40">
            ·
          </span>
          <span>Created {formatShortDate(createdAt)}</span>
        </div>
      </div>
    </IntentPrefetchLink>
  );
}
