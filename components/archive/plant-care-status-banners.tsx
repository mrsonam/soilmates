"use client";

import Link from "next/link";
import { restorePlantAction } from "@/lib/archive/actions";
import { RestoreButton } from "@/components/archive/restore-button";

type Props = {
  collectionSlug: string;
  plantSlug: string;
  nickname: string;
  plantArchivedAt: string | null;
  collectionArchivedAt: string | null;
};

export function PlantCareStatusBanners({
  collectionSlug,
  plantSlug,
  nickname,
  plantArchivedAt,
  collectionArchivedAt,
}: Props) {
  if (collectionArchivedAt) {
    return (
      <div className="rounded-2xl bg-surface-container-high/80 px-4 py-3 ring-1 ring-outline-variant/15">
        <p className="text-sm leading-relaxed text-on-surface">
          This collection is archived. Restore it from{" "}
          <Link
            href="/settings"
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Settings → Data &amp; privacy
          </Link>{" "}
          to edit plants and reminders again.
        </p>
      </div>
    );
  }

  if (plantArchivedAt) {
    return (
      <div className="flex flex-col gap-3 rounded-2xl bg-primary-fixed/15 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ring-1 ring-primary/15">
        <p className="text-sm leading-relaxed text-on-surface">
          <span className="font-medium">{nickname}</span> is archived — hidden
          from lists and reminders. History and photos are still here.
        </p>
        <RestoreButton
          label="Restore plant"
          onRestore={() =>
            restorePlantAction({ collectionSlug, plantSlug })
          }
        />
      </div>
    );
  }

  return null;
}
