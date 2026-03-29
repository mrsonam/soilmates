import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import { userHasActiveCollection } from "@/lib/collections/memberships";
import { CollectionSetupForm } from "@/components/onboarding/collection-setup-form";

export default async function OnboardingCollectionsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const hasCollection = await userHasActiveCollection(session.user.id);
  if (hasCollection) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-surface px-6 py-12 sm:px-10 sm:py-16">
      <div className="mx-auto max-w-lg">
        <header className="mb-10 text-center">
          <p className="font-display text-sm font-semibold tracking-tight text-primary">
            Soil Mates
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">
            Set up where you&apos;ll track plants together
          </p>
        </header>
        <CollectionSetupForm />
        <form
          className="mt-12 text-center"
          action={async () => {
            "use server";
            await signOut({ redirectTo: "/login" });
          }}
        >
          <button
            type="submit"
            className="text-xs text-on-surface-variant underline-offset-4 hover:text-on-surface hover:underline"
          >
            Sign out
          </button>
        </form>
      </div>
    </div>
  );
}
