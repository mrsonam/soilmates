"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail } from "lucide-react";
import { AuthPageShell } from "./auth-page-shell";
import { PasswordRequirementsChecklist } from "./password-requirements-checklist";
import { passwordMeetsAllRequirements } from "@/lib/password-policy";

export function SignupScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwdFocused, setPwdFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!fullName.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!passwordMeetsAllRequirements(password)) {
      setError("Your password must satisfy every requirement in the list.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName: fullName.trim(),
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        code?: string;
      };

      if (!res.ok) {
        setError(
          typeof data.error === "string"
            ? data.error
            : "Could not create your account.",
        );
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.replace("/login?registered=1");
        return;
      }

      router.replace("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  const showChecklist = pwdFocused || password.length > 0;

  return (
    <AuthPageShell>
      <div className="mx-auto w-full max-w-md space-y-10">
        <header className="space-y-3">
          <h1 className="font-display text-3xl font-semibold tracking-[-0.02em] text-on-surface sm:text-4xl">
            Create your account
          </h1>
          <p className="text-base leading-relaxed text-on-surface-variant">
            Set up your Soil Mates profile
          </p>
        </header>

        {error && (
          <p
            className="rounded-2xl bg-surface-container-low px-4 py-3 text-sm text-on-surface-variant"
            role="alert"
          >
            {error}
          </p>
        )}

        <form onSubmit={(e) => void onSubmit(e)} className="space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="signup-name"
              className="block text-sm font-medium text-on-surface"
            >
              Name
            </label>
            <input
              id="signup-name"
              name="fullName"
              type="text"
              autoComplete="name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12 w-full rounded-2xl border border-outline-variant/25 bg-surface-container-lowest px-4 text-on-surface shadow-(--shadow-ambient) outline-none ring-0 transition placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:bg-surface-container-high"
              placeholder="Alex Plantperson"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="signup-email"
              className="block text-sm font-medium text-on-surface"
            >
              Email
            </label>
            <input
              id="signup-email"
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
              htmlFor="signup-password"
              className="block text-sm font-medium text-on-surface"
            >
              Password
            </label>
            <input
              id="signup-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPwdFocused(true)}
              className="h-12 w-full rounded-2xl border border-outline-variant/25 bg-surface-container-lowest px-4 text-on-surface shadow-(--shadow-ambient) outline-none placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:bg-surface-container-high"
              placeholder="••••••••"
            />
            {showChecklist && (
              <div className="rounded-2xl border border-outline-variant/15 bg-surface-container-low/80 px-4 py-3">
                <PasswordRequirementsChecklist password={password} />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="signup-confirm"
              className="block text-sm font-medium text-on-surface"
            >
              Confirm password
            </label>
            <input
              id="signup-confirm"
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="h-12 w-full rounded-2xl border border-outline-variant/25 bg-surface-container-lowest px-4 text-on-surface shadow-(--shadow-ambient) outline-none placeholder:text-on-surface-variant/60 focus:border-primary/40 focus:bg-surface-container-high"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2.5 rounded-2xl bg-primary text-[0.9375rem] font-medium text-on-primary shadow-(--shadow-ambient) transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Mail className="size-5 shrink-0 opacity-95" strokeWidth={1.75} />
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-on-surface-variant">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </p>

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
