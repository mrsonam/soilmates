"use client";

import { AppSegmentLoadingFallback } from "@/components/loading/route-skeletons";

/** @deprecated Prefer importing {@link AppSegmentLoadingFallback} from `@/components/loading`. */
export function AppRouteLoader() {
  return <AppSegmentLoadingFallback />;
}
