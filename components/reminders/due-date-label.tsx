"use client";

import { useEffect, useState } from "react";
import { formatNextDueLabel } from "@/lib/reminders/format-next-due";

type DueDateLabelProps = {
  iso: string;
  className?: string;
};

/**
 * Renders next-due text only after mount so SSR and hydration match.
 * Locale/timezone formatting otherwise differs between Node and the browser.
 */
export function DueDateLabel({ iso, className }: DueDateLabelProps) {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    setLabel(formatNextDueLabel(iso));
  }, [iso]);

  return (
    <span className={className}>
      {label === null ? "\u00a0" : label}
    </span>
  );
}
