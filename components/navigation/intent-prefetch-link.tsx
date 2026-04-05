"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useCallback } from "react";
import { useRouter } from "next/navigation";

type IntentPrefetchLinkProps = ComponentProps<typeof Link>;

/**
 * Next.js already prefetches visible links; this adds **intent** prefetch on
 * hover/focus so likely-next routes warm sooner (especially below the fold).
 */
export function IntentPrefetchLink({
  href,
  onMouseEnter,
  onFocus,
  prefetch = true,
  ...rest
}: IntentPrefetchLinkProps) {
  const router = useRouter();

  const warm = useCallback(() => {
    if (typeof href === "string") {
      router.prefetch(href);
    }
  }, [router, href]);

  return (
    <Link
      {...rest}
      href={href}
      prefetch={prefetch}
      onMouseEnter={(e) => {
        warm();
        onMouseEnter?.(e);
      }}
      onFocus={(e) => {
        warm();
        onFocus?.(e);
      }}
    />
  );
}
