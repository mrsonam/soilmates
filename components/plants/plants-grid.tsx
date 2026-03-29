import type { PlantListItem } from "@/lib/plants/queries";
import { PlantCard } from "./plant-card";

type PlantsGridProps = {
  plants: PlantListItem[];
  showCollectionLabel?: boolean;
};

export function PlantsGrid({ plants, showCollectionLabel }: PlantsGridProps) {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {plants.map((plant) => (
        <li key={plant.id}>
          <PlantCard
            plant={plant}
            showCollectionLabel={showCollectionLabel}
          />
        </li>
      ))}
    </ul>
  );
}
