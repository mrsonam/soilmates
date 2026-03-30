import Link from "next/link";

type CollectionOption = { slug: string; name: string };

export function ActivityFilterChips({
  collections,
  activeSlug,
}: {
  collections: CollectionOption[];
  activeSlug: string | null;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <FilterChip
        href="/activity"
        label="All spaces"
        active={activeSlug === null}
      />
      {collections.map((c) => (
        <FilterChip
          key={c.slug}
          href={`/activity?collection=${encodeURIComponent(c.slug)}`}
          label={c.name}
          active={activeSlug === c.slug}
        />
      ))}
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition",
        active
          ? "bg-primary text-on-primary shadow-(--shadow-ambient)"
          : "bg-surface-container-high text-on-surface ring-1 ring-outline-variant/15 hover:bg-surface-container-highest",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}
