import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getActiveMembershipsForUser } from "@/lib/collections/memberships";
import { isSupabaseStorageConfigured } from "@/lib/supabase/admin";
import { AppShell } from "@/components/layout/app-shell";

export default async function AuthenticatedAppLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const memberships = await getActiveMembershipsForUser(session.user.id);

  const collections = memberships.map((m) => ({
    id: m.collection.id,
    name: m.collection.name,
    slug: m.collection.slug,
  }));

  return (
    <AppShell
      collections={collections}
      uploadsEnabled={isSupabaseStorageConfigured()}
      user={{
        name: session.user.name,
        email: session.user.email ?? "",
        image: session.user.image,
      }}
    >
      {children}
    </AppShell>
  );
}
