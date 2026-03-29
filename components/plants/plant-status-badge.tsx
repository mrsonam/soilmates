type PlantStatusBadgeProps = {
  status: string;
};

export function PlantStatusBadge({ status }: PlantStatusBadgeProps) {
  const thriving = status === "thriving";
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold",
        thriving
          ? "bg-primary-fixed/45 text-primary"
          : "bg-surface-container-high text-on-surface-variant",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          thriving ? "bg-primary" : "bg-amber-600/70",
        ].join(" ")}
        aria-hidden
      />
      {thriving ? "Healthy" : "Needs attention"}
    </span>
  );
}
