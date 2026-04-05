"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Droplets,
  Eye,
  Leaf,
  PackageOpen,
  Scissors,
} from "lucide-react";
import type { QuickCareAction } from "@/lib/validations/care-log";
import { careLogCreatorFromProfile } from "@/lib/optimistic/user-creator";
import { useQuickCareLogMutation } from "@/hooks/mutations/plant-care-mutations";
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
  disabled?: boolean;
  creator: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
};

export function QuickCareActions({
  collectionSlug,
  plantSlug,
  disabled = false,
  creator,
}: QuickCareActionsProps) {
  const creatorSnapshot = careLogCreatorFromProfile(creator);
  const quickCare = useQuickCareLogMutation(
    collectionSlug,
    plantSlug,
    creatorSnapshot,
  );
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
      if (disabled) return;
      quickCare.mutate(
        { actionType },
        {
          onSuccess: (data) => {
            setLastAction(actionType);
            const queued = "queued" in data && data.queued === true;
            setFlash(
              queued
                ? "Queued — will sync when you’re online"
                : "Saved",
            );
            if (clearTimer.current) clearTimeout(clearTimer.current);
            clearTimer.current = setTimeout(() => {
              setFlash(null);
              setLastAction(null);
              clearTimer.current = null;
            }, 2200);
          },
          onError: (err) => {
            setFlash(err instanceof Error ? err.message : "Could not save");
            if (clearTimer.current) clearTimeout(clearTimer.current);
            clearTimer.current = setTimeout(() => {
              setFlash(null);
              clearTimer.current = null;
            }, 4000);
          },
        },
      );
    },
    [disabled, quickCare],
  );

  const pending = quickCare.isPending;

  return (
    <section className="rounded-3xl bg-surface-container-lowest/80 p-5 shadow-(--shadow-ambient) ring-1 ring-outline-variant/[0.08] sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
            Quick care log
          </p>
          <p className="mt-1 text-sm text-on-surface-variant">
            {disabled
              ? "Unavailable while this plant or collection is archived."
              : "Tap to record what you did — timestamp saved automatically."}
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
            disabled={pending || disabled}
            onClick={() => logAction(type)}
          />
        ))}
      </div>
    </section>
  );
}
