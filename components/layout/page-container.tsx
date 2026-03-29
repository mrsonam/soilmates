import type { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
  /** Narrow reading width for forms / copy */
  narrow?: boolean;
};

export function PageContainer({
  children,
  className = "",
  narrow = false,
}: PageContainerProps) {
  return (
    <div
      className={[
        "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-8",
        narrow ? "max-w-lg" : "max-w-6xl",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
