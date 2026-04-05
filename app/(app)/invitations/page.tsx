import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyPendingInvites } from "@/lib/collections/invites-queries";
import { PageContainer } from "@/components/layout/page-container";
import { InvitationsListClient } from "@/components/invitations/invitations-list-client";

export default async function InvitationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const invites = await getMyPendingInvites(session.user.email);

  return (
    <PageContainer narrow>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-on-surface">
        Invitations
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
        Private invites to share a plant collection. Accept when you&apos;re
        ready—everything stays in Soil Mates.
      </p>

      <InvitationsListClient initialInvites={invites} />
    </PageContainer>
  );
}
