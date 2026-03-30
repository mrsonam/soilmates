import Link from "next/link";
import { Heart } from "lucide-react";
import type { FavoritePlantCard } from "@/lib/dashboard/queries";

function moistureBar(percent: number | null) {
  const p = percent == null ? null : Math.max(0, Math.min(100, percent));
  const display = p ?? 50;
  const label = p == null ? "—" : `${p}%`;
  const color =
    p == null
      ? "bg-outline-variant/40"
      : p >= 60
        ? "bg-[#6b9b6e]"
        : p >= 35
          ? "bg-[#c9a227]"
          : "bg-[#c97b6b]";

  return (
    <div>
      <div className="flex items-center justify-between text-[0.65rem] text-on-surface-variant">
        <span>Soil moisture</span>
        <span className="font-medium tabular-nums text-on-surface">{label}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className={["h-full rounded-full transition-all", color].join(" ")}
          style={{ width: `${display}%` }}
        />
      </div>
    </div>
  );
}

type DashboardFavoritesProps = {
  plants: FavoritePlantCard[];
};

export function DashboardFavorites({ plants }: DashboardFavoritesProps) {
  return (
    <section className="mt-12">
      <h3 className="font-display text-xl font-semibold text-on-surface">
        Your favorites
      </h3>
      {plants.length === 0 ? (
        <p className="mt-3 max-w-lg text-sm text-on-surface-variant">
          Star plants from their profile to see them here for quick access.
        </p>
      ) : (
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4 [&::-webkit-scrollbar]:hidden">
          {plants.map((p) => (
            <Link
              key={p.id}
              href={`/collections/${p.collectionSlug}/plants/${p.slug}`}
              className="group w-[min(100%,240px)] shrink-0 overflow-hidden rounded-3xl bg-surface-container-lowest shadow-[0_8px_28px_-14px_rgba(35,40,35,0.15)] ring-1 ring-outline-variant/[0.08] transition hover:ring-primary/20 sm:w-auto"
            >
              <div className="relative aspect-[4/3] bg-surface-container-high">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={p.imageUrl}
                    alt=""
                    className="absolute inset-0 size-full object-cover transition group-hover:scale-[1.02]"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/30 to-surface-container-high" />
                )}
                <span className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-black/25 text-white backdrop-blur-sm">
                  <Heart
                    className="size-4 fill-white/90"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                </span>
              </div>
              <div className="p-4">
                <p className="font-display font-semibold text-on-surface">
                  {p.nickname}
                </p>
                {p.plantType ? (
                  <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant">
                    {p.plantType}
                  </p>
                ) : (
                  <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-wider text-on-surface-variant/80">
                    Plant
                  </p>
                )}
                <div className="mt-4">{moistureBar(p.growthProgressPercent)}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
