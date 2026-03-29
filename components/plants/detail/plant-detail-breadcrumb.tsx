import Link from "next/link";
import { ChevronRight } from "lucide-react";

type PlantDetailBreadcrumbProps = {
  collectionSlug: string;
  collectionName: string;
  plantNickname: string;
};

export function PlantDetailBreadcrumb({
  collectionSlug,
  collectionName,
  plantNickname,
}: PlantDetailBreadcrumbProps) {
  return (
    <nav
      className="flex flex-wrap items-center gap-1 text-sm text-on-surface-variant"
      aria-label="Breadcrumb"
    >
      <Link
        href="/collections"
        className="font-medium text-primary transition hover:underline"
      >
        Collections
      </Link>
      <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
      <Link
        href={`/collections/${collectionSlug}`}
        className="max-w-[10rem] truncate font-medium text-primary transition hover:underline sm:max-w-xs"
      >
        {collectionName}
      </Link>
      <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
      <Link
        href={`/collections/${collectionSlug}/plants`}
        className="font-medium text-primary transition hover:underline"
      >
        Plants
      </Link>
      <ChevronRight className="size-3.5 shrink-0 opacity-50" aria-hidden />
      <span className="max-w-[12rem] truncate font-medium text-on-surface sm:max-w-md">
        {plantNickname}
      </span>
    </nav>
  );
}
