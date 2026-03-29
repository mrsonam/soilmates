import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-on-surface">
        Terms of Service
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
        Placeholder. Legal terms will be published before launch.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-block text-sm font-medium text-primary hover:underline"
      >
        Back to sign in
      </Link>
    </main>
  );
}
