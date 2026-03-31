"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

function setParam(params: URLSearchParams, key: string, value: string | null) {
  if (!value) {
    params.delete(key);
  } else {
    params.set(key, value);
  }
}

function useDebouncedValue<T>(value: T, delayMs: number) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(value), delayMs);
    return () => window.clearTimeout(t);
  }, [value, delayMs]);
  return debounced;
}

export function SearchInput({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [q, setQ] = useState(initialQuery);
  const debouncedQ = useDebouncedValue(q, 250);

  const nextHref = useMemo(() => {
    const params = new URLSearchParams(sp?.toString() ?? "");
    setParam(params, "q", debouncedQ.trim() ? debouncedQ.trim() : null);
    return `${pathname}?${params.toString()}`;
  }, [debouncedQ, pathname, sp]);

  useEffect(() => {
    router.replace(nextHref, { scroll: false });
  }, [nextHref, router]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function clear() {
    setQ("");
    inputRef.current?.focus();
  }

  return (
    <div className="flex items-center gap-2 rounded-3xl bg-surface-container-lowest/70 p-3 shadow-(--shadow-ambient) ring-1 ring-outline-variant/10 sm:p-3.5">
      <div className="flex flex-1 items-center gap-2 rounded-2xl bg-surface-container-high/80 px-4 py-3 ring-1 ring-outline-variant/15 focus-within:ring-2 focus-within:ring-primary/25">
        <Search
          className="size-4.5 shrink-0 text-on-surface-variant/70"
          strokeWidth={1.75}
          aria-hidden
        />
        <input
          ref={inputRef}
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search plants, care history, reminders, and more…"
          aria-label="Search"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/55 outline-none"
        />
        {q.trim() ? (
          <button
            type="button"
            onClick={clear}
            className="flex size-9 items-center justify-center rounded-xl text-on-surface-variant transition hover:bg-surface-container-highest hover:text-on-surface"
            aria-label="Clear search"
          >
            <X className="size-4" strokeWidth={2} aria-hidden />
          </button>
        ) : null}
      </div>

    </div>
  );
}

