import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  /** Narrow reading width for forms / copy */
  narrow?: boolean;
  /** Wider max width for dashboard-style layouts */
  wide?: boolean;
};

export function PageContainer({
  children,
  className = "",
  narrow = false,
  wide = false,
}: PageContainerProps) {
  const max =
    narrow ? "max-w-lg" : wide ? "max-w-[min(100%,1400px)]" : "max-w-6xl";
  return (
    <div
      className={[
        "animate-page-enter mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        max,
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
