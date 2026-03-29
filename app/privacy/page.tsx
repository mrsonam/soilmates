import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-lg px-6 py-16">
      <h1 className="font-display text-2xl font-semibold text-on-surface">
        Privacy Policy
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
        Placeholder. Content will reflect Soil Mates data practices before
        launch.
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
