/**
 * NVIDIA NIM / integrate OpenAI-compatible chat completions.
 * @see https://docs.nvidia.com/nim/
 */

export const NVIDIA_INTEGRATE_CHAT_COMPLETIONS_URL =
  "https://integrate.api.nvidia.com/v1/chat/completions";

export function getNvidiaApiKey(): string | undefined {
  const k = process.env.NVIDIA_API_KEY?.trim();
  return k || undefined;
}

export function getNvidiaChatModel(): string {
  return process.env.NVIDIA_CHAT_MODEL?.trim() || "google/gemma-3n-e4b-it";
}

export type NvidiaChatCompletionPayload = {
  model: string;
  messages: unknown[];
  max_tokens: number;
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  stream: boolean;
  /** OpenAI-style JSON mode; omit if the endpoint rejects it. */
  response_format?: { type: "json_object" };
};

export async function postNvidiaChatCompletion(
  payload: NvidiaChatCompletionPayload,
): Promise<Response> {
  const key = getNvidiaApiKey();
  if (!key) {
    throw new Error("NVIDIA_API_KEY is not set");
  }

  return fetch(NVIDIA_INTEGRATE_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ ...payload, stream: false }),
  });
}
