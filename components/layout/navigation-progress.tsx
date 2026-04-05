"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Thin top bar while the route segment is swapping — immediate feedback on
 * link navigations without blocking the stable app shell.
 */
export function NavigationProgress() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const prevPath = useRef<string | null>(null);

  useEffect(() => {
    if (prevPath.current === null) {
      prevPath.current = pathname;
      return;
    }
    if (pathname === prevPath.current) return;
    prevPath.current = pathname;
    setVisible(true);
    const id = window.setTimeout(() => setVisible(false), 380);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return (
    <div
      className={[
        "pointer-events-none fixed inset-x-0 top-0 z-[90] h-[3px] overflow-hidden transition-opacity duration-150",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      aria-hidden
    >
      <div
        className={[
          "h-full w-[38%] max-w-md bg-primary shadow-[0_0_14px_rgba(81,100,71,0.35)] dark:shadow-[0_0_14px_rgba(184,207,159,0.25)]",
          visible ? "animate-nav-progress" : "",
        ].join(" ")}
      />
    </div>
  );
}
