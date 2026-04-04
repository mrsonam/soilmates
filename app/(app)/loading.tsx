import { AppSegmentLoadingFallback } from "@/components/loading/route-skeletons";

/** Instant fallback for navigations under the authenticated shell (layout stays mounted). */
export default function AppSegmentLoading() {
  return <AppSegmentLoadingFallback />;
}
