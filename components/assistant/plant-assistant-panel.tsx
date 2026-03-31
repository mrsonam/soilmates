"use client";

import { AssistantChat } from "./assistant-chat";

export function PlantAssistantPanel({
  threadId,
  plantNickname,
  initialMessages,
}: {
  threadId: string;
  plantNickname: string;
  initialMessages: Array<{
    id: string;
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    createdAt: string;
  }>;
}) {
  return (
    <div className="rounded-2xl bg-surface-container-lowest/40 p-4 ring-1 ring-outline-variant/[0.08] sm:p-6">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            Plant context
          </p>
          <h2 className="font-display text-lg font-semibold text-on-surface">
            Assistant for {plantNickname}
          </h2>
        </div>
        <p className="max-w-md text-sm text-on-surface-variant">
          Answers use your care history, reminders, photos metadata, and recent
          activity from this plant’s record.
        </p>
      </div>
      <AssistantChat
        mode="plant"
        threadId={threadId}
        initialMessages={initialMessages}
        plantNickname={plantNickname}
      />
    </div>
  );
}
