const LABELS: Record<string, string> = {
  sprout: "Young",
  juvenile: "Growing",
  mature: "Mature",
};

type PlantLifeStageBadgeProps = {
  stage: string;
  className?: string;
};

export function PlantLifeStageBadge({
  stage,
  className = "",
}: PlantLifeStageBadgeProps) {
  const label = LABELS[stage] ?? stage;
  return (
    <span
      className={[
        "rounded-full bg-surface/85 px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wide text-on-surface shadow-sm ring-1 ring-outline-variant/10 backdrop-blur-sm",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
