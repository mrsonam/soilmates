"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import {
  Droplets,
  Eye,
  Leaf,
  PackageOpen,
  Scissors,
} from "lucide-react";
import { createQuickCareLogAction } from "@/app/(app)/collections/[collectionSlug]/plants/care-log-actions";
import type { QuickCareAction } from "@/lib/validations/care-log";
import { QuickCareActionButton } from "./quick-care-action-button";

const ACTIONS: {
  type: QuickCareAction;
  label: string;
  Icon: typeof Droplets;
}[] = [
  { type: "watered", label: "Watered", Icon: Droplets },
  { type: "fertilized", label: "Fertilized", Icon: Leaf },
  { type: "repotted", label: "Repotted", Icon: PackageOpen },
  { type: "pruned", label: "Pruned", Icon: Scissors },
  { type: "observation", label: "Observation", Icon: Eye },
];

type QuickCareActionsProps = {
  collectionSlug: string;
  plantSlug: string;
};

export function QuickCareActions({
  collectionSlug,
  plantSlug,
}: QuickCareActionsProps) {
  const [pending, startTransition] = useTransition();
  const [flash, setFlash] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<QuickCareAction | null>(null);
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (clearTimer.current) clearTimeout(clearTimer.current);
    };
  }, []);

  const logAction = useCallback(
    (actionType: QuickCareAction) => {
      startTransition(async () => {
        const res = await createQuickCareLogAction({
          collectionSlug,
          plantSlug,
          actionType,
        });
        if (res.ok) {
          setLastAction(actionType);
          setFlash("Saved");
          if (clearTimer.current) clearTimeout(clearTimer.current);
          clearTimer.current = setTimeout(() => {
            setFlash(null);
            setLastAction(null);
            clearTimer.current = null;
          }, 2200);
        } else {
          setFlash(res.error);
          if (clearTimer.current) clearTimeout(clearTimer.current);
          clearTimer.current = setTimeout(() => {
            setFlash(null);
            clearTimer.current = null;
          }, 4000);
        }
      });
    },
    [collectionSlug, plantSlug],
  );

  return (
    <section className="rounded-3xl bg-surface-container-lowest/80 p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            Quick care log
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            Tap to record what you did — timestamp saved automatically.
          </p>
        </div>
        {flash ? (
          <p
            className="text-xs font-medium text-primary sm:text-sm"
            role="status"
            aria-live="polite"
          >
            {flash}
          </p>
        ) : null}
      </div>
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:flex-wrap sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
        {ACTIONS.map(({ type, label, Icon }) => (
          <QuickCareActionButton
            key={type}
            label={label}
            Icon={Icon}
            active={lastAction === type && flash === "Saved"}
            disabled={pending}
            onClick={() => logAction(type)}
          />
        ))}
      </div>
    </section>
  );
}
