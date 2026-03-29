import type { CollectionCardModel } from "./collection-card";
import { CollectionCard } from "./collection-card";
import { FolderPlus } from "lucide-react";

type CollectionsGridProps = {
  collections: CollectionCardModel[];
  onAddCollection: () => void;
};

export function CollectionsGrid({
  collections,
  onAddCollection,
}: CollectionsGridProps) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {collections.map((c) => (
        <li key={c.id}>
          <CollectionCard collection={c} />
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={onAddCollection}
          className="flex h-full min-h-[280px] w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-outline-variant/35 bg-surface-container-low/30 px-6 py-10 text-center transition hover:border-primary/35 hover:bg-surface-container-low/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary/40"
        >
          <span className="flex size-14 items-center justify-center rounded-2xl bg-surface-container-high/80 text-on-surface-variant">
            <FolderPlus className="size-7" strokeWidth={1.5} aria-hidden />
          </span>
          <span className="font-display text-base font-semibold text-on-surface">
            Build your sanctuary
          </span>
          <span className="max-w-[14rem] text-sm text-on-surface-variant">
            Start a new group collection for another room or project.
          </span>
        </button>
      </li>
    </ul>
  );
}
