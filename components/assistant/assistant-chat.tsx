"use client";

import { useEffect, useRef, useState } from "react";
import { AssistantMessageBubble } from "./assistant-message-bubble";
import { AssistantComposer } from "./assistant-composer";
import { AssistantEmptyState } from "./assistant-empty-state";
import { AssistantSuggestedPrompts } from "./assistant-suggested-prompts";
import {
  createGlobalThreadAction,
  sendAssistantMessageAction,
} from "@/lib/ai/actions";
import { useRouter } from "next/navigation";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: string;
};

type AssistantChatProps = {
  mode: "global" | "plant";
  threadId: string | null;
  initialMessages: ChatMessage[];
  collectionSlugForGlobal?: string | null;
  plantNickname?: string;
};

const GLOBAL_PROMPTS = [
  "How do I know if a plant is overwatered?",
  "What causes yellow leaves on houseplants?",
  "What is the best way to care for indoor herbs?",
];

const PLANT_PROMPTS = [
  "What should I do next for this plant?",
  "What do you notice about the care history?",
  "Is the watering pattern reasonable for this plant?",
  "What should I watch over the next week?",
];

export function AssistantChat({
  mode,
  threadId: initialThreadId,
  initialMessages,
  collectionSlugForGlobal,
  plantNickname,
}: AssistantChatProps) {
  const router = useRouter();
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setThreadId(initialThreadId);
  }, [initialThreadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initialMessages.length, pending]);

  async function handleSend(text: string) {
    setActionError(null);
    setPending(true);
    try {
      let tid = threadId;
      if (!tid) {
        if (mode !== "global") return;
        const created = await createGlobalThreadAction();
        tid = created.id;
        setThreadId(tid);
        router.replace(`/assistant?thread=${encodeURIComponent(tid)}`);
      }

      const result = await sendAssistantMessageAction({
        threadId: tid!,
        content: text,
        collectionSlug: collectionSlugForGlobal ?? undefined,
      });

      if (!result.ok) {
        setActionError(result.error);
        return;
      }

      try {
        router.refresh();
      } catch {
        /* refresh can fail offline; UI still has server response */
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something went wrong. Try again.";
      if (msg.includes("fetch") || msg.includes("Fetch")) {
        setActionError(
          "Could not reach the server. Check your connection and try again.",
        );
      } else {
        setActionError(msg);
      }
    } finally {
      setPending(false);
    }
  }

  const visible = initialMessages.filter(
    (m) => m.role === "user" || m.role === "assistant",
  );
  const showEmpty = visible.length === 0;
  const prompts = mode === "plant" ? PLANT_PROMPTS : GLOBAL_PROMPTS;

  return (
    <div className="flex min-h-[min(70vh,720px)] flex-col">
      {actionError ? (
        <div
          className="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-900 ring-1 ring-red-500/20"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
        {showEmpty ? (
          <AssistantEmptyState variant={mode === "plant" ? "plant" : "global"} />
        ) : null}

        {initialMessages.map((m) => (
          <AssistantMessageBubble
            key={m.id}
            role={m.role}
            content={m.content}
            createdAt={m.createdAt}
          />
        ))}

        {pending ? (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface-variant ring-1 ring-outline-variant/12">
              <span className="inline-flex gap-1">
                <span className="animate-pulse">Thinking</span>
                <span className="opacity-60">…</span>
              </span>
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 space-y-3 border-t border-outline-variant/10 pt-4">
        {showEmpty ? (
          <AssistantSuggestedPrompts
            prompts={prompts}
            disabled={pending}
            onPick={(p) => void handleSend(p)}
          />
        ) : null}

        <AssistantComposer
          onSend={handleSend}
          disabled={pending || (mode === "plant" && !threadId)}
          placeholder={
            mode === "plant" && plantNickname
              ? `Ask about ${plantNickname}…`
              : "Ask about plants or Soil Mates…"
          }
        />
        <p className="text-center text-[0.65rem] font-medium uppercase tracking-[0.12em] text-on-surface-variant/80">
          Soil Mates assistant can make mistakes. Verify important care decisions.
        </p>
      </div>
    </div>
  );
}
