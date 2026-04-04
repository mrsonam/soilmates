import type { ReactNode } from "react";

export function SettingsSection({
  icon,
  title,
  description,
  children,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-surface-container-lowest/60 p-6 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-8">
      <div className="flex gap-3 border-b border-outline-variant/10 pb-5">
        {icon ? (
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            {icon}
          </span>
        ) : null}
        <div className="min-w-0">
          <h2 className="font-display text-lg font-semibold tracking-tight text-on-surface">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 text-sm leading-relaxed text-on-surface-variant">
              {description}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}
