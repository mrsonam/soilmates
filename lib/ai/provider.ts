import type { GlobalAssistantContextJson, PlantAssistantContextJson } from "./types";
import { buildGlobalSystemPrompt, buildPlantSystemPrompt } from "./prompts";
import {
  getNvidiaApiKey,
  getNvidiaChatModel,
  postNvidiaChatCompletion,
} from "./nvidia-integrate";
import {
  extractTextFromChatContent,
  mergeConsecutiveSameRoleMessages,
} from "./chat-content";
import { withRetry } from "@/lib/retry";
import { serverLogger } from "@/lib/logging/server";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type GenerateAssistantReplyInput = {
  mode: "global" | "plant";
  userMessage: string;
  history: ChatMessage[];
  globalContext?: GlobalAssistantContextJson;
  plantContext?: PlantAssistantContextJson;
};

function parseChatCompletionText(data: unknown): string | null {
  const d = data as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = d.choices?.[0]?.message?.content;
  return extractTextFromChatContent(content);
}

/**
 * Calls NVIDIA integrate chat completions server-side. Falls back if `NVIDIA_API_KEY` is unset.
 */
export async function generateAssistantReply(
  input: GenerateAssistantReplyInput,
): Promise<string> {
  const system =
    input.mode === "plant" && input.plantContext
      ? buildPlantSystemPrompt(input.plantContext)
      : input.mode === "global" && input.globalContext
        ? buildGlobalSystemPrompt(input.globalContext)
        : buildGlobalSystemPrompt({
            mode: "global",
            userProfileId: input.globalContext?.userProfileId ?? "",
            assembledAt: new Date().toISOString(),
          });

  const rawMessages: Array<{ role: string; content: string }> = [
    { role: "system", content: system },
    ...input.history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: input.userMessage },
  ];
  const messages = mergeConsecutiveSameRoleMessages(rawMessages);

  if (getNvidiaApiKey()) {
    try {
      const res = await withRetry(
        async () => {
          const r = await postNvidiaChatCompletion({
            model: getNvidiaChatModel(),
            messages,
            temperature: 0.2,
            top_p: 0.7,
            frequency_penalty: 0,
            presence_penalty: 0,
            max_tokens: Number(process.env.NVIDIA_ASSISTANT_MAX_TOKENS) || 1200,
            stream: false,
          });
          if (!r.ok) {
            const errText = await r.text().catch(() => "");
            const err = new Error(
              `NVIDIA API error ${r.status}: ${errText.slice(0, 200)}`,
            ) as Error & { httpStatus?: number };
            err.httpStatus = r.status;
            throw err;
          }
          return r;
        },
        {
          maxAttempts: 3,
          initialDelayMs: 500,
          shouldRetry: (error, attempt) => {
            if (attempt >= 3) return false;
            const status = (error as Error & { httpStatus?: number }).httpStatus;
            if (status != null && status < 500 && status !== 429) return false;
            if (error instanceof Error && error.name === "TimeoutError") return true;
            return status != null && (status >= 500 || status === 429);
          },
        },
      );

      const data = (await res.json()) as unknown;
      const text = parseChatCompletionText(data);
      if (text) return text;
      throw new Error("Empty model response");
    } catch (e) {
      serverLogger.integration("ai", "assistant_completion_failed", "error", {}, e);
      throw e instanceof Error ? e : new Error(String(e));
    }
  }

  const preview =
    input.mode === "plant"
      ? `I'm here to help with ${input.plantContext?.plant.nickname ?? "this plant"}.`
      : "I'm here to help with soil, plants, and how you use Soil Mates.";

  return [
    `${preview} (AI responses use a local fallback until you set NVIDIA_API_KEY in your environment.)`,
    "",
    "To give you the best answer, could you share a bit more about what you're seeing or what you'd like to try? I'll keep suggestions conservative and avoid guessing.",
  ].join("\n");
}
