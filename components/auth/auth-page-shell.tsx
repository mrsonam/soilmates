import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { Leaf } from "lucide-react";
import { LoginThemeGate } from "./login-theme-gate";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1525498128493-380d1990a112?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

type AuthPageShellProps = {
  children: ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen flex-1 pt-[env(safe-area-inset-top)]">
      <LoginThemeGate />
      <div className="relative hidden w-1/2 overflow-hidden rounded-r-4xl lg:block">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          className="object-cover"
          sizes="50vw"
          priority
        />
        <div
          className="absolute inset-0 bg-linear-to-br from-primary/75 via-primary/40 to-primary-container/50"
          aria-hidden
        />
        <div className="absolute inset-0 flex flex-col justify-between p-8 md:p-11">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-on-primary drop-shadow-sm"
          >
            <span className="flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-xl ring-1 ring-white/20">
              <Leaf className="size-6 text-on-primary" strokeWidth={1.75} />
            </span>
            <span className="font-display text-xl font-semibold tracking-tight">
              Soil Mates
            </span>
          </Link>
          <figure
            className="max-w-md rounded-[1.25rem] p-5 shadow-(--shadow-ambient) ring-1 ring-white/25 backdrop-blur-[20px]"
            style={{ background: "rgba(251, 249, 246, 0.82)" }}
          >
            <blockquote className="font-display text-lg font-semibold leading-snug tracking-tight text-on-surface">
              “The most mindful way to keep my urban jungle thriving.”
            </blockquote>
            <figcaption className="mt-4 flex items-center gap-3">
              <div
                className="size-11 shrink-0 rounded-full bg-primary-fixed ring-2 ring-white/60"
                aria-hidden
              />
              <div>
                <p className="text-sm font-medium text-on-surface">
                  Elena Green
                </p>
                <p className="text-xs text-on-surface-variant">
                  Plant parent since 2021
                </p>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>

      <div className="flex w-full flex-1 flex-col justify-center bg-surface px-6 py-12 sm:px-10 lg:w-1/2 lg:px-14 xl:px-20">
        {children}
      </div>
    </div>
  );
}
