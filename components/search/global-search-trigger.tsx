"use client";

import { useCallback, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function GlobalSearchTrigger({
  variant = "icon",
}: {
  variant?: "icon" | "pill";
}) {
  const router = useRouter();
  const [, startNav] = useTransition();

  const goSearch = useCallback(() => {
    startNav(() => {
      router.push("/search");
    });
  }, [router]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const el = e.target as HTMLElement | null;
      const isTypingTarget =
        el &&
        (el.tagName === "INPUT" ||
          el.tagName === "TEXTAREA" ||
          el.getAttribute("contenteditable") === "true");
      if (isTypingTarget) return;

      const isCmdK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k";
      if (isCmdK) {
        e.preventDefault();
        goSearch();
      }
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        goSearch();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goSearch]);

  if (variant === "pill") {
    return (
      <button
        type="button"
        onClick={goSearch}
        className="hidden h-10 min-w-[14rem] items-center gap-2 rounded-full bg-surface-container-high/80 px-4 text-left text-sm text-on-surface-variant ring-1 ring-outline-variant/15 transition hover:bg-surface-container-highest hover:text-on-surface md:inline-flex"
        aria-label="Search"
      >
        <Search className="size-4 text-on-surface-variant/70" strokeWidth={2} aria-hidden />
        <span className="min-w-0 flex-1 truncate">Search…</span>
        <span className="ml-2 rounded-md bg-surface-container-highest px-2 py-0.5 text-[0.7rem] font-medium text-on-surface-variant ring-1 ring-outline-variant/15">
          ⌘K
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={goSearch}
      className="flex size-10 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-low hover:text-on-surface"
      aria-label="Search"
      title="Search (⌘K / /)"
    >
      <Search className="size-[1.35rem]" strokeWidth={1.5} aria-hidden />
    </button>
  );
}

