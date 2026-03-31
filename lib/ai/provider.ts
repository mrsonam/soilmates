import type { GlobalAssistantContextJson, PlantAssistantContextJson } from "./types";
import { buildGlobalSystemPrompt, buildPlantSystemPrompt } from "./prompts";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

export type GenerateAssistantReplyInput = {
  mode: "global" | "plant";
  userMessage: string;
  history: ChatMessage[];
  globalContext?: GlobalAssistantContextJson;
  plantContext?: PlantAssistantContextJson;
};

function parseChatCompletionJson(data: unknown): string | null {
  const d = data as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  return d.choices?.[0]?.message?.content?.trim() ?? null;
}

/**
 * Calls the configured AI provider server-side. Abstracted from UI and persistence.
 * Priority: OpenAI (`OPENAI_API_KEY`) -> local fallback.
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

  const messages: Array<{ role: string; content: string }> = [
    { role: "system", content: system },
    ...input.history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: input.userMessage },
  ];

  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
        messages,
        temperature: 0.7,
        max_tokens: 1200,
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`OpenAI error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await res.json()) as unknown;
    const text = parseChatCompletionJson(data);
    if (text) return text;
    throw new Error("Empty model response");
  }

  const preview =
    input.mode === "plant"
      ? `I'm here to help with ${input.plantContext?.plant.nickname ?? "this plant"}.`
      : "I'm here to help with soil, plants, and how you use Soil Mates.";

  return [
    `${preview} (AI responses use a local fallback until you set OPENAI_API_KEY in your environment.)`,
    "",
    "To give you the best answer, could you share a bit more about what you're seeing or what you'd like to try? I'll keep suggestions conservative and avoid guessing.",
  ].join("\n");
}
