import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getActiveMembershipsForUser } from "@/lib/collections/memberships";
import { getDashboardDueCare } from "@/lib/reminders/queries";
import {
  getDashboardSnapshot,
  getDashboardRecentActivity,
  getDashboardFavoritePlants,
} from "@/lib/dashboard/queries";
import { dashboardGreetingLine } from "@/lib/dashboard/greeting";
import { PageContainer } from "@/components/layout/page-container";
import { DashboardNeedsAttention } from "@/components/dashboard/dashboard-needs-attention";
import { DashboardSnapshot } from "@/components/dashboard/dashboard-snapshot";
import { DashboardRecentActivity } from "@/components/dashboard/dashboard-recent-activity";
import { DashboardFavorites } from "@/components/dashboard/dashboard-favorites";
import { DashboardAssistantNudge } from "@/components/dashboard/dashboard-assistant-nudge";
import { getPendingInviteCountForUser } from "@/lib/collections/invites-queries";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const firstName =
    session.user.name?.trim()?.split(" ")[0] ??
    session.user.email?.split("@")[0] ??
    "Gardener";

  const [memberships, dueCare, snapshot, recentActivity, favorites, inviteCount] =
    await Promise.all([
      getActiveMembershipsForUser(session.user.id),
      getDashboardDueCare(session.user.id),
      getDashboardSnapshot(session.user.id),
      getDashboardRecentActivity(session.user.id),
      getDashboardFavoritePlants(session.user.id),
      getPendingInviteCountForUser(session.user.email),
    ]);

  const attentionCount = dueCare.filter(
    (i) => i.status === "due" || i.status === "overdue",
  ).length;
  const greeting = dashboardGreetingLine(firstName);
  const subline =
    attentionCount > 0
      ? `You have ${attentionCount} ${attentionCount === 1 ? "reminder" : "reminders"} that could use your attention.`
      : "You’re all caught up on scheduled care — enjoy the calm.";

  return (
    <PageContainer wide>
      <div className="xl:grid xl:grid-cols-[1fr_22rem] xl:gap-12">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-[2rem]">
            {greeting}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
            {subline}
          </p>

          {inviteCount > 0 ? (
            <Link
              href="/invitations"
              className="mt-6 flex max-w-lg items-center justify-between gap-4 rounded-2xl border border-primary/20 bg-primary-fixed/30 px-5 py-4 text-left transition hover:bg-primary-fixed/40"
            >
              <span className="text-sm text-on-surface">
                You have{" "}
                <span className="font-semibold">
                  {inviteCount}{" "}
                  {inviteCount === 1 ? "collection invite" : "collection invites"}
                </span>{" "}
                waiting
              </span>
              <span className="text-sm font-medium text-primary">Review</span>
            </Link>
          ) : null}

          <section className="mt-10">
            <h2 className="font-display text-xl font-semibold text-on-surface">
              Needs attention today
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Reminders due or coming up — tap done when you&apos;ve taken care of it.
            </p>
            <div className="mt-6">
              <DashboardNeedsAttention items={dueCare} />
            </div>
          </section>

          <DashboardFavorites plants={favorites} />
        </div>

        <aside className="mt-12 space-y-10 border-t border-outline-variant/10 pt-10 xl:mt-0 xl:border-t-0 xl:border-l xl:pl-10 xl:pt-0">
          <DashboardSnapshot data={snapshot} />
          <DashboardRecentActivity rows={recentActivity} />
          <DashboardAssistantNudge />
          <div className="rounded-2xl bg-surface-container-low/60 p-5 ring-1 ring-outline-variant/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-on-surface-variant">
              Collections
            </p>
            <p className="mt-2 font-display text-2xl font-semibold text-on-surface">
              {memberships.length}
            </p>
            <Link
              href="/collections"
              className="mt-2 inline-block text-sm font-medium text-primary hover:underline"
            >
              View all
            </Link>
          </div>
        </aside>
      </div>
    </PageContainer>
  );
}
