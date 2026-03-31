import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { PageContainer } from "@/components/layout/page-container";
import { GlobalAssistantView } from "@/components/assistant/global-assistant-view";
import {
  assertUserOwnsThread,
  getGlobalThreadsForUser,
  getThreadMessages,
} from "@/lib/ai/queries";

type Props = {
  searchParams: Promise<{ thread?: string; collection?: string }>;
};

export default async function AssistantPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const sp = await searchParams;
  const threadParam = sp.thread?.trim() ?? null;
  const collectionSlug = sp.collection?.trim() ?? null;

  const threads = await getGlobalThreadsForUser(session.user.id);

  let activeThreadId: string | null = null;
  let messages: Array<{
    id: string;
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    createdAt: string;
  }> = [];

  if (threadParam) {
    const access = await assertUserOwnsThread(session.user.id, threadParam);
    if (access?.threadType === "global") {
      activeThreadId = threadParam;
      const rows = await getThreadMessages(threadParam);
      messages = rows.map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
      }));
    }
  }

  return (
    <PageContainer wide>
      <div className="mx-auto max-w-5xl">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
          Guidance
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-on-surface sm:text-[2rem]">
          Assistant
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
          Calm, context-aware help. Open a plant’s Assistant tab for care
          grounded in your logs — or stay here for general questions.{" "}
          <Link
            href="/search"
            className="font-medium text-primary hover:underline"
          >
            Search
          </Link>{" "}
          can also help you navigate.
        </p>

        <div className="mt-10">
          <GlobalAssistantView
            threads={threads}
            activeThreadId={activeThreadId}
            messages={messages}
            collectionSlug={collectionSlug}
          />
        </div>
      </div>
    </PageContainer>
  );
}
