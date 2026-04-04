import type { ReactNode } from "react";

type RouteLoadingShellProps = {
  children: ReactNode;
  narrow?: boolean;
  wide?: boolean;
  className?: string;
};

/**
 * Mirrors {@link PageContainer} padding and max-width so route transitions
 * keep layout continuity while the shell (sidebar, header, bottom nav) stays fixed.
 */
export function RouteLoadingShell({
  children,
  narrow = false,
  wide = false,
  className = "",
}: RouteLoadingShellProps) {
  const max = narrow
    ? "max-w-lg"
    : wide
      ? "max-w-[min(100%,1400px)]"
      : "max-w-6xl";
  return (
    <div
      className={[
        "animate-page-enter mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        max,
        className,
      ].join(" ")}
      aria-busy
      aria-label="Loading"
    >
      {children}
    </div>
  );
}
