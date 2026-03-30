"use client";

import type { ReactNode } from "react";
import { Camera } from "lucide-react";

type PhotoEmptyStateProps = {
  plantNickname: string;
  /** Upload controls (file picker, cover/progress, submit). */
  children?: ReactNode;
};

export function PhotoEmptyState({
  plantNickname,
  children,
}: PhotoEmptyStateProps) {
  return (
    <div className="rounded-3xl border border-dashed border-primary/25 bg-primary-fixed/15 px-6 py-10 text-center shadow-(--shadow-ambient) sm:px-10 sm:py-12">
      <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Camera className="size-7" strokeWidth={1.5} aria-hidden />
      </div>
      <h3 className="mt-5 font-display text-lg font-semibold text-on-surface">
        Start {plantNickname}&apos;s growth journal
      </h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-on-surface-variant">
        Photos help you spot changes over time, compare leaf growth, and track
        health privately in your collection.
      </p>
      {children ? (
        <div className="mt-8 w-full border-t border-primary/15 pt-8 text-left">
          <p className="mb-4 text-center text-[0.65rem] font-semibold uppercase tracking-wide text-on-surface-variant">
            Upload your first photo
          </p>
          {children}
        </div>
      ) : null}
    </div>
  );
}
