/**
 * NVIDIA NIM / integrate often requires **strict** `user` / `assistant` alternation.
 * If a prior assistant reply failed to persist, the DB can contain consecutive
 * `user` rows — merge them into one message before calling the API.
 */
export function mergeConsecutiveSameRoleMessages<
  T extends { role: string; content: string },
>(messages: T[]): T[] {
  const out: T[] = [];
  for (const m of messages) {
    const prev = out[out.length - 1];
    if (
      prev &&
      prev.role === m.role &&
      (m.role === "user" || m.role === "assistant")
    ) {
      prev.content = `${prev.content.trim()}\n\n${m.content.trim()}`;
    } else {
      out.push({ ...m });
    }
  }
  return out;
}

/**
 * NVIDIA / OpenAI-compatible chat responses may return `message.content` as a string
 * or as an array of parts. Models may wrap JSON in markdown fences or add prose.
 */

export function extractTextFromChatContent(content: unknown): string | null {
  if (typeof content === "string") {
    const t = content.trim();
    return t.length ? t : null;
  }
  if (Array.isArray(content)) {
    const parts: string[] = [];
    for (const part of content) {
      if (typeof part === "string") {
        parts.push(part);
        continue;
      }
      if (part && typeof part === "object") {
        const o = part as Record<string, unknown>;
        if (typeof o.text === "string") parts.push(o.text);
        else if (typeof o.content === "string") parts.push(o.content);
      }
    }
    const joined = parts.join("\n").trim();
    return joined.length ? joined : null;
  }
  return null;
}

/**
 * Pull a JSON value from model text: raw JSON, fenced ```json blocks, or first {...} span.
 */
export function parseJsonObjectFromAssistantText(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) throw new Error("Empty model response");

  const tryParse = (s: string) => {
    let t = s.trim();
    // Common LLM mistake: trailing commas before } or ]
    t = t.replace(/,\s*([}\]])/g, "$1");
    return JSON.parse(t) as unknown;
  };

  try {
    return tryParse(trimmed);
  } catch {
    /* continue */
  }

  const fence = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence?.[1]) {
    try {
      return tryParse(fence[1]);
    } catch {
      /* continue */
    }
  }

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) {
    const slice = trimmed.slice(start, end + 1);
    try {
      return tryParse(slice);
    } catch {
      /* continue */
    }
  }

  throw new Error("Could not parse JSON from model response");
}
