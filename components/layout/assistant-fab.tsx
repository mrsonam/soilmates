"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";
import { isNavActive } from "@/lib/layout/nav-config";

/**
 * Floating entry to the assistant — sits above mobile bottom nav, subtle on desktop.
 */
export function AssistantFab() {
  const pathname = usePathname();
  const onAssistant = isNavActive(pathname, "/assistant");

  if (onAssistant) return null;

  return (
    <Link
      href="/assistant"
      className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-40 flex size-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-(--shadow-ambient) ring-4 ring-surface/80 transition hover:bg-primary/92 hover:ring-surface active:scale-[0.98] lg:bottom-8 lg:right-8 lg:size-12 lg:ring-2"
      aria-label="Open plant assistant"
    >
      <Sparkles className="size-6 lg:size-5" strokeWidth={1.75} aria-hidden />
    </Link>
  );
}
