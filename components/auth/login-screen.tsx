"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Camera, Droplets, KeyRound, Mail } from "lucide-react";
import { useState } from "react";
import { signIn } from "next-auth/react";
import {
  getPublicDemoLoginDefaults,
  isPortfolioDemoLink,
} from "@/lib/demo/portfolio-login";
import { AuthPageShell } from "./auth-page-shell";

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

function messageForAuthError(code: string | undefined): string | null {
  if (!code) return null;
  if (code === "CredentialsSignin") {
    return "Invalid email or password.";
  }
  return "Something went wrong signing in. Try again.";
}

type LoginScreenProps = {
  authError?: string;
  registered?: boolean;
};

export function LoginScreen({ authError, registered }: LoginScreenProps) {
  const searchParams = useSearchParams();
  const queryError = searchParams.get("error") ?? undefined;
  const registeredParam = searchParams.get("registered");
  const highlightPortfolioDemo = isPortfolioDemoLink(searchParams);
  const demoLogin = getPublicDemoLoginDefaults();

  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleSignInError, setGoogleSignInError] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const urlError = messageForAuthError(queryError ?? authError);
  const showRegistered =
    registered ||
    registeredParam === "1" ||
    registeredParam === "true";

  async function signInWithGoogle() {
    setGoogleSignInError(false);
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (e) {
      console.error(e);
      setGoogleLoading(false);
      setGoogleSignInError(true);
    }
  }

  async function signInWithEmail(e: React.FormEvent) {
    e.preventDefault();
    setGoogleSignInError(false);
    setEmailLoading(true);
    try {
      await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        callbackUrl: "/",
      });
    } catch (err) {
      console.error(err);
      setEmailLoading(false);
    }
  }

  return (
    <AuthPageShell>
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

        {showRegistered && (
          <p
            className="rounded-2xl bg-primary-container/40 px-4 py-3 text-sm text-on-surface"
            role="status"
          >
            Account created. Sign in with your email and password below.
          </p>
        )}

        {(urlError || googleSignInError) && (
          <p
            className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant"
            role="alert"
          >
            {urlError ??
              "Something went wrong signing in. Try again."}
          </p>
        )}

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              setEmail(demoLogin.email);
              setPassword(demoLogin.password);
            }}
            aria-pressed={highlightPortfolioDemo}
            className={[
              "flex w-full items-center justify-center gap-2.5 rounded-2xl border px-4 py-3.5 text-sm font-semibold shadow-(--shadow-ambient) transition",
              highlightPortfolioDemo
                ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-surface hover:bg-primary/[0.14]"
                : "border-outline-variant/25 bg-surface-container-low text-on-surface hover:bg-surface-container-high",
            ].join(" ")}
          >
            <KeyRound className="size-4 shrink-0 opacity-90" strokeWidth={2} />
            Use demo account
          </button>
        </div>

        <form onSubmit={(e) => void signInWithEmail(e)} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-on-surface"
            >
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 w-full rounded-2xl border border-outline-variant/25 bg-surface-container-lowest px-4 text-on-surface shadow-(--shadow-ambient) outline-none placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:bg-surface-container-high"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-on-surface"
            >
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-12 w-full rounded-2xl border border-outline-variant/25 bg-surface-container-lowest px-4 text-on-surface shadow-(--shadow-ambient) outline-none placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:bg-surface-container-high"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={emailLoading}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-on-surface text-[0.9375rem] font-medium text-surface shadow-(--shadow-ambient) transition hover:bg-on-surface/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail className="size-5 shrink-0 opacity-90" strokeWidth={1.75} />
            {emailLoading ? "Signing in…" : "Sign in with email"}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          New here?{" "}
          <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </p>

        <div className="space-y-5">
          <div className="flex items-center gap-4 py-1">
            <span className="h-px flex-1 bg-outline-variant/15" />
            <span className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-on-surface-variant">
              or
            </span>
            <span className="h-px flex-1 bg-outline-variant/15" />
          </div>

          <button
            type="button"
            onClick={() => void signInWithGoogle()}
            disabled={googleLoading}
            className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl bg-surface-container-lowest text-[0.9375rem] font-medium text-on-surface shadow-(--shadow-ambient) transition hover:bg-surface-container-high disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleIcon className="size-5 shrink-0" />
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </button>

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
    </AuthPageShell>
  );
}
