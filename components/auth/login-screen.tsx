"use client";

import Image from "next/image";
import Link from "next/link";
import { Droplets, Leaf, Mail, Camera } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1525498128493-380d1990a112?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type LoginScreenProps = {
  authError?: boolean;
};

export function LoginScreen({ authError }: LoginScreenProps) {
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailHint, setEmailHint] = useState(false);

  async function signInWithGoogle() {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (e) {
      console.error(e);
      setGoogleLoading(false);
      setEmailHint(true);
    }
  }

  return (
    <div className="flex min-h-screen flex-1 pt-[env(safe-area-inset-top)]">
      {/* Left — hero (DESIGN: glass testimonial, gradient soul on imagery) */}
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

      {/* Right — auth panel (tonal layers, no hard borders) */}
      <div className="flex w-full flex-1 flex-col justify-center bg-surface px-6 py-12 sm:px-10 lg:w-1/2 lg:px-14 xl:px-20">
        <div className="mx-auto w-full max-w-md space-y-10">
          <header className="space-y-3">
            <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-on-surface sm:text-4xl">
              Start your mindful plant journey
            </h1>
            <p className="text-base leading-relaxed text-on-surface-variant">
              Join our community of plant lovers and watch your indoor garden
              flourish with ease.
            </p>
          </header>

          {(authError || emailHint) && (
            <p
              className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant"
              role="alert"
            >
              {authError
                ? "Something went wrong signing in. Try again."
                : "Check .env: NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, and GOOGLE_CLIENT_SECRET must be set for Google sign-in."}
            </p>
          )}

          <div className="space-y-5">
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              disabled={googleLoading}
              className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-surface-container-lowest text-[0.9375rem] font-medium text-on-surface shadow-(--shadow-ambient) transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleIcon className="size-5 shrink-0" />
              {googleLoading ? "Connecting…" : "Continue with Google"}
            </button>

            <div className="flex items-center gap-4 py-1">
              <span className="h-px flex-1 bg-outline-variant/15" />
              <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-on-surface-variant">
                or
              </span>
              <span className="h-px flex-1 bg-outline-variant/15" />
            </div>

            <button
              type="button"
              onClick={() => setEmailHint(true)}
              className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-on-surface text-[0.9375rem] font-medium text-surface transition hover:bg-on-surface/90"
            >
              <Mail className="size-5 shrink-0 opacity-90" strokeWidth={1.75} />
              Sign up with Email
            </button>

            <p className="text-center text-xs text-on-surface-variant">
              Email sign-in isn’t available yet — use Google to continue.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-surface-container-low p-5">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-primary-fixed/80 text-primary">
                  <Droplets className="size-5" strokeWidth={1.75} />
                </div>
                <h2 className="font-display text-sm font-semibold text-on-surface">
                  Smart Reminders
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
                  Never miss a watering again with custom schedules.
                </p>
              </div>
              <div className="rounded-2xl bg-surface-container-low p-5">
                <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-orange-100/90 text-orange-700">
                  <Camera className="size-5" strokeWidth={1.75} />
                </div>
                <h2 className="font-display text-sm font-semibold text-on-surface">
                  Health ID
                </h2>
                <p className="mt-1.5 text-xs leading-relaxed text-on-surface-variant">
                  Diagnose plant issues instantly with AI scanning.
                </p>
              </div>
            </div>
          </div>

          <nav
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-on-surface-variant"
            aria-label="Legal"
          >
            <Link href="/privacy" className="hover:text-on-surface">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-on-surface">
              Terms of Service
            </Link>
            <Link href="/help" className="hover:text-on-surface">
              Help Center
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
