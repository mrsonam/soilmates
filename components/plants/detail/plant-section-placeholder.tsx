import { Sparkles } from "lucide-react";

type PlantSectionPlaceholderProps = {
  title: string;
  description: string;
};

export function PlantSectionPlaceholder({
  title,
  description,
}: PlantSectionPlaceholderProps) {
  return (
    <div className="rounded-3xl bg-surface-container-low/50 px-6 py-14 text-center ring-1 ring-outline-variant/10 sm:px-10">
      <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary-fixed/35 text-primary">
        <Sparkles className="size-6" strokeWidth={1.5} aria-hidden />
      </span>
      <h3 className="mt-5 font-display text-lg font-semibold text-on-surface">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
        {description}
      </p>
    </div>
  );
}
