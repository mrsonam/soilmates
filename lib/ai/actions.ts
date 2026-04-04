"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AiMessageRole, AiThreadType } from "@prisma/client";
import { assertUserOwnsThread, createGlobalThread, getThreadMessages } from "./queries";
import {
  buildGlobalAssistantContext,
  buildPlantAssistantContext,
} from "./context-builders";
import { generateAssistantReply } from "./provider";
import type { AssistantContextSnapshot } from "./types";

export async function createGlobalThreadAction() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const thread = await createGlobalThread(session.user.id);
  revalidatePath("/assistant");
  return thread;
}

export type SendMessageResult =
  | { ok: true; assistantMessageId: string; content: string }
  | { ok: false; error: string };

export async function sendAssistantMessageAction(input: {
  threadId: string;
  content: string;
  /** Optional: scope global context to a collection the user belongs to. */
  collectionSlug?: string | null;
}): Promise<SendMessageResult> {
  try {
  const session = await auth();
  if (!session?.user?.id) return { ok: false, error: "Unauthorized" };

  const text = input.content.trim();
  if (!text) return { ok: false, error: "Message is empty" };
  if (text.length > 8000) return { ok: false, error: "Message is too long" };

  const thread = await assertUserOwnsThread(session.user.id, input.threadId);
  if (!thread) return { ok: false, error: "Thread not found" };

  const fullThread = await prisma.aiThread.findUnique({
    where: { id: input.threadId },
    select: {
      id: true,
      threadType: true,
      plantId: true,
    },
  });
  if (!fullThread) return { ok: false, error: "Thread not found" };

  await prisma.aiMessage.create({
    data: {
      threadId: input.threadId,
      role: AiMessageRole.user,
      content: text,
      createdById: session.user.id,
    },
  });

  const prior = await getThreadMessages(input.threadId);
  const history = prior
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(0, -1)
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

  let contextSnapshot: AssistantContextSnapshot | null = null;
  let replyText: string;

  try {
    if (fullThread.threadType === AiThreadType.plant && fullThread.plantId) {
      const plantRow = await prisma.plant.findFirst({
        where: { id: fullThread.plantId, archivedAt: null },
        select: {
          slug: true,
          collection: { select: { slug: true } },
        },
      });
      if (!plantRow) {
        return { ok: false, error: "Plant not found" };
      }

      const plantCtx = await buildPlantAssistantContext(
        session.user.id,
        plantRow.collection.slug,
        plantRow.slug,
      );
      if (!plantCtx) {
        return { ok: false, error: "Could not load plant context" };
      }
      contextSnapshot = plantCtx;

      replyText = await generateAssistantReply({
        mode: "plant",
        userMessage: text,
        history,
        plantContext: plantCtx,
      });
    } else {
      const globalCtx = await buildGlobalAssistantContext(session.user.id, {
        collectionSlug: input.collectionSlug ?? undefined,
      });
      contextSnapshot = globalCtx;

      replyText = await generateAssistantReply({
        mode: "global",
        userMessage: text,
        history,
        globalContext: globalCtx,
      });
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "AI request failed";
    console.error("[sendAssistantMessageAction]", err);
    replyText = [
      "I couldn’t reach the AI service just now (network, API key, or provider error).",
      "",
      `Details: ${message.slice(0, 280)}`,
      "",
      "Please try again in a moment. If it keeps happening, check NVIDIA_API_KEY / network access from your server.",
    ].join("\n");
    contextSnapshot = null;
  }

  const assistantRow = await prisma.aiMessage.create({
    data: {
      threadId: input.threadId,
      role: AiMessageRole.assistant,
      content: replyText,
      contextSnapshot: contextSnapshot
        ? (contextSnapshot as object)
        : undefined,
    },
  });

  await prisma.aiThread.update({
    where: { id: input.threadId },
    data: { lastMessageAt: new Date() },
  });

  revalidatePath("/assistant");

  if (fullThread.threadType === AiThreadType.plant && fullThread.plantId) {
    const p = await prisma.plant.findUnique({
      where: { id: fullThread.plantId },
      select: { slug: true, collection: { select: { slug: true } } },
    });
    if (p) {
      revalidatePath(
        `/collections/${p.collection.slug}/plants/${p.slug}`,
      );
    }
  }

  return {
    ok: true,
    assistantMessageId: assistantRow.id,
    content: replyText,
  };
  } catch (err) {
    console.error("[sendAssistantMessageAction] fatal", err);
    const msg =
      err instanceof Error ? err.message : "Unexpected server error";
    return {
      ok: false,
      error:
        msg.includes("ai_threads") || msg.includes("ai_messages")
          ? "Database is not ready for assistant messages. Run: npx prisma db push"
          : msg.slice(0, 400),
    };
  }
}

