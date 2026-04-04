"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
import { logoutAction } from "@/app/(app)/logout-action";

type Props = {
  name?: string | null;
  email: string;
  image?: string | null;
};

export function AccountCard({ name, email, image }: Props) {
  const initial = (name?.trim() || email || "?").slice(0, 1).toUpperCase();

  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-4">
        <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-surface-container-high ring-1 ring-outline-variant/15">
          {image ? (
            <Image
              src={image}
              alt=""
              width={56}
              height={56}
              className="size-full object-cover"
              unoptimized
            />
          ) : (
            <span className="flex size-full items-center justify-center font-display text-lg font-semibold text-primary">
              {initial}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium text-on-surface">
            {name?.trim() || "Google account"}
          </p>
          <p className="truncate text-sm text-on-surface-variant">{email}</p>
          <p className="mt-2 text-xs text-on-surface-variant/90">
            Sign-in is managed through Google. Profile details come from your
            Google account.
          </p>
        </div>
      </div>
      <form action={logoutAction}>
        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-outline-variant/25 bg-surface-container-lowest px-5 py-2.5 text-sm font-medium text-on-surface shadow-sm transition hover:bg-surface-container-high sm:w-auto"
        >
          <LogOut className="size-4" strokeWidth={1.75} />
          Sign out
        </button>
      </form>
    </div>
  );
}
