import { Leaf } from "lucide-react";

export function DiagnosisEmptyStateNoPhotos({
  plantNickname,
}: {
  plantNickname: string;
}) {
  return (
    <div className="rounded-3xl bg-gradient-to-br from-surface-container-lowest/80 to-primary/[0.03] px-6 py-10 text-center ring-1 ring-outline-variant/[0.08]">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Leaf className="size-7" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold text-on-surface">
        Add a photo first
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
        Upload a photo to help the assistant understand how {plantNickname} looks
        today. Natural light and a few angles work best.
      </p>
    </div>
  );
}

export function DiagnosisEmptyStateNoDiagnoses() {
  return (
    <div className="rounded-2xl bg-surface-container-high/30 px-5 py-6 text-center ring-1 ring-outline-variant/[0.06]">
      <p className="text-sm leading-relaxed text-on-surface-variant">
        Diagnoses will appear here when you ask the assistant to review this plant
        with photos.
      </p>
    </div>
  );
}
