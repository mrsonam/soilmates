import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getMyPendingInvites } from "@/lib/collections/invites-queries";
import { PageContainer } from "@/components/layout/page-container";
import { InvitationCard } from "@/components/invitations/invitation-card";

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

      {invites.length === 0 ? (
        <div className="mt-12 rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/40 px-8 py-14 text-center">
          <p className="font-display text-lg font-medium text-on-surface">
            No pending invites right now
          </p>
          <p className="mt-2 text-sm text-on-surface-variant">
            When someone invites you by email, it will show up here after you
            sign in.
          </p>
        </div>
      ) : (
        <ul className="mt-10 space-y-6">
          {invites.map((item) => (
            <InvitationCard key={item.id} item={item} />
          ))}
        </ul>
      )}
    </PageContainer>
  );
}
