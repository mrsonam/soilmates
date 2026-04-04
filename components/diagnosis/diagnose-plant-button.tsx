import Link from "next/link";
import { Stethoscope } from "lucide-react";

export function DiagnosePlantButton({
  collectionSlug,
  plantSlug,
  className = "",
}: {
  collectionSlug: string;
  plantSlug: string;
  className?: string;
}) {
  const href = `/collections/${collectionSlug}/plants/${plantSlug}?tab=assistant#plant-check-in`;
  return (
    <Link
      href={href}
      className={[
        "inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-4 py-2.5 text-sm font-semibold text-primary transition hover:bg-primary/10",
        className,
      ].join(" ")}
    >
      <Stethoscope className="size-4" strokeWidth={1.75} aria-hidden />
      Diagnose plant
    </Link>
  );
}
