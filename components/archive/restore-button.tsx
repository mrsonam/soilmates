"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RotateCcw } from "lucide-react";

type RestoreButtonProps = {
  label?: string;
  onRestore: () => Promise<{ ok: boolean; error?: string }>;
  className?: string;
};

export function RestoreButton({
  label = "Restore",
  onRestore,
  className = "",
}: RestoreButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function click() {
    setError(null);
    startTransition(async () => {
      const r = await onRestore();
      if (!r.ok) {
        setError(r.error ?? "Could not restore.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={click}
        aria-busy={pending}
        className={[
          "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-primary ring-1 ring-primary/25 transition hover:bg-primary/10 disabled:opacity-50",
          className,
        ].join(" ")}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : (
          <RotateCcw className="size-3.5" strokeWidth={1.75} aria-hidden />
        )}
        {pending ? "Restoring…" : label}
      </button>
      {error ? (
        <span className="max-w-[14rem] text-right text-xs text-amber-800 dark:text-amber-200">
          {error}
        </span>
      ) : null}
    </div>
  );
}
