import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";

export default function CollectionNotFound() {
  return (
    <PageContainer narrow>
      <h1 className="font-display text-xl font-semibold text-on-surface">
        Collection not found
      </h1>
      <p className="mt-2 text-sm text-on-surface-variant">
        You may not have access, or the link is outdated.
      </p>
      <Link
        href="/collections"
        className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
      >
        Back to collections
      </Link>
    </PageContainer>
  );
}
