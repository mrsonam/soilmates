import Link from "next/link";
import { Plus } from "lucide-react";
import { AssistantChat } from "./assistant-chat";

type ThreadRow = {
  id: string;
  title: string | null;
  lastMessageAt: Date | null;
  createdAt: Date;
};

export function GlobalAssistantView({
  threads,
  activeThreadId,
  messages,
  collectionSlug,
}: {
  threads: ThreadRow[];
  activeThreadId: string | null;
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    createdAt: string;
  }>;
  collectionSlug?: string | null;
}) {
  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-10">
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-display text-sm font-semibold text-on-surface">
            Conversations
          </h2>
          <Link
            href="/assistant"
            className="flex size-9 items-center justify-center rounded-full bg-primary/12 text-primary transition hover:bg-primary/18"
            aria-label="New conversation"
            title="New conversation"
          >
            <Plus className="size-4" strokeWidth={2.25} />
          </Link>
        </div>
        <nav className="mt-4 flex flex-col gap-1" aria-label="Assistant threads">
          {threads.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No threads yet — start below.
            </p>
          ) : (
            threads.map((t) => {
              const active = activeThreadId === t.id;
              const label = t.title?.trim() || "Conversation";
              return (
                <Link
                  key={t.id}
                  href={`/assistant?thread=${encodeURIComponent(t.id)}`}
                  className={[
                    "rounded-2xl px-3 py-2.5 text-sm transition",
                    active
                      ? "bg-surface-container-high font-medium text-on-surface ring-1 ring-outline-variant/15"
                      : "text-on-surface-variant hover:bg-surface-container-high/60 hover:text-on-surface",
                  ].join(" ")}
                >
                  <span className="line-clamp-2">{label}</span>
                  {t.lastMessageAt ? (
                    <span className="mt-1 block text-xs text-on-surface-variant/80">
                      {t.lastMessageAt.toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  ) : null}
                </Link>
              );
            })
          )}
        </nav>
      </aside>

      <div className="min-w-0">
        <AssistantChat
          mode="global"
          threadId={activeThreadId}
          initialMessages={messages}
          collectionSlugForGlobal={collectionSlug ?? undefined}
        />
      </div>
    </div>
  );
}
