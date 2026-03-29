import { Leaf, Sprout } from "lucide-react";

type PlantImagePlaceholderProps = {
  className?: string;
};

export function PlantImagePlaceholder({
  className = "",
}: PlantImagePlaceholderProps) {
  return (
    <div
      className={[
        "relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary-fixed/50 via-surface-container-low to-primary-fixed-dim/40",
        className,
      ].join(" ")}
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_30%,rgba(81,100,71,0.08),transparent_55%)]" />
      <Sprout
        className="relative z-[1] size-16 text-primary/30"
        strokeWidth={1}
      />
      <Leaf
        className="absolute right-[18%] top-[22%] size-8 text-primary/20"
        strokeWidth={1}
      />
    </div>
  );
}
