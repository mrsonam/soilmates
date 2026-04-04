import type { DiagnosisAiOutput } from "./schemas";
import type { DiagnosisContextBundle } from "./context";
import {
  getNvidiaApiKey,
  getNvidiaChatModel,
  postNvidiaChatCompletion,
} from "@/lib/ai/nvidia-integrate";
import {
  extractTextFromChatContent,
  parseJsonObjectFromAssistantText,
} from "@/lib/ai/chat-content";
import { normalizeDiagnosisPayload } from "./normalize-model-output";

function bufferToDataUrl(buffer: ArrayBuffer, mime: string): string {
  const b64 = Buffer.from(buffer).toString("base64");
  const safeMime = mime.startsWith("image/") ? mime : "image/jpeg";
  return `data:${safeMime};base64,${b64}`;
}

function fallbackDiagnosis(
  reason: string,
  plantNickname: string,
): DiagnosisAiOutput {
  return {
    summary: [
      `I reviewed ${plantNickname} with the context we have, but ${reason}.`,
      "Here are conservative, low-risk steps you can take while you gather more detail.",
    ].join(" "),
    suspected_issues: [
      "Insufficient visual detail or offline AI — causes can’t be narrowed confidently yet.",
    ],
    confidence: {
      level: "low",
      notes: reason,
    },
    recommendations: [
      "Take a few well-lit photos in natural light (top, sides, soil line) and try again.",
      "Note any changes in watering, light, or drafts over the last two weeks.",
    ],
    safest_next_steps: [
      "Avoid drastic changes; adjust one variable at a time.",
      "Check drainage and let the top inch of soil dry before watering again if unsure.",
    ],
    follow_up_questions: [
      "Are the spots mostly on older leaves or new growth?",
      "Is the soil staying wet for several days after watering?",
    ],
    reasoning_notes: null,
    suggested_ai_health_status: null,
    observed_evidence: [],
    monitor_next: ["Leaf color, texture, and any spreading pattern over 3–5 days."],
    when_to_recheck: "After a few days of stable care, or once you add clearer photos.",
  };
}

/**
 * Vision + JSON diagnosis. Server-only; uses NVIDIA integrate API (`NVIDIA_API_KEY`).
 */
export async function generatePlantDiagnosisVision(input: {
  contextBundle: DiagnosisContextBundle;
  plantNickname: string;
  userConcern: string | null;
  images: Array<{ buffer: ArrayBuffer; contentType: string }>;
}): Promise<DiagnosisAiOutput> {
  const { contextBundle, plantNickname, userConcern, images } = input;

  const system = [
    "You are a careful indoor plant advisor for Soil Mates.",
    "You receive photos of a user's plant plus structured JSON context from their records.",
    "Rules:",
    "- Never present uncertain guesses as facts. Label hypotheses clearly.",
    "- Separate: observed evidence (from photos/records), likely hypotheses, safest immediate actions, longer monitoring.",
    "- Prefer conservative, reversible actions over aggressive interventions.",
    "- Do not claim pest/disease ID with certainty from photos alone.",
    "- Reply with ONLY one JSON object. No markdown, no code fences, no text before or after the JSON.",
    "- suggested_ai_health_status must be 'thriving' or 'needs_attention' or null if unclear.",
    "Tone: calm, supportive, not alarmist.",
  ].join("\n");

  const userText = [
    `Plant nickname: ${plantNickname}`,
    userConcern?.trim()
      ? `What the grower is worried about: ${userConcern.trim()}`
      : "The grower did not add a specific concern.",
    "",
    "--- CONTEXT (JSON) ---",
    JSON.stringify(
      {
        assistantContext: contextBundle.plantAssistantJson,
        selectedImagesMeta: contextBundle.selectedImages,
        assembledAt: contextBundle.assembledAt,
      },
      null,
      2,
    ),
    "",
    "--- REQUIRED JSON SHAPE ---",
    JSON.stringify({
      summary: "string",
      suspected_issues: ["string"],
      confidence: {
        level: "low|medium|high",
        score: 0.0,
        notes: "optional string",
      },
      recommendations: ["string"],
      safest_next_steps: ["string"],
      follow_up_questions: ["string"],
      reasoning_notes: "string or null",
      suggested_ai_health_status: "thriving | needs_attention | null",
      observed_evidence: ["optional strings from photos/records"],
      monitor_next: ["optional"],
      when_to_recheck: "optional string or null",
    }),
  ].join("\n");

  const userContent: Array<
    | { type: "text"; text: string }
    | { type: "image_url"; image_url: { url: string } }
  > = [{ type: "text", text: userText }];

  for (const img of images) {
    userContent.push({
      type: "image_url",
      image_url: { url: bufferToDataUrl(img.buffer, img.contentType) },
    });
  }

  if (!getNvidiaApiKey()) {
    return fallbackDiagnosis(
      "the AI service is not configured (missing NVIDIA_API_KEY)",
      plantNickname,
    );
  }

  const diagnosisMaxTokens =
    Number(process.env.NVIDIA_DIAGNOSIS_MAX_TOKENS) || 2048;

  try {
    const res = await postNvidiaChatCompletion({
      model: process.env.NVIDIA_DIAGNOSIS_MODEL?.trim() || getNvidiaChatModel(),
      messages: [
        { role: "system", content: system },
        { role: "user", content: userContent },
      ],
      temperature: 0.2,
      top_p: 0.7,
      frequency_penalty: 0,
      presence_penalty: 0,
      max_tokens: diagnosisMaxTokens,
      stream: false,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`NVIDIA API error ${res.status}: ${errText.slice(0, 200)}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: unknown } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    const raw = extractTextFromChatContent(content);
    if (!raw) {
      console.error("[diagnosis] empty content", {
        sample: JSON.stringify(data).slice(0, 400),
      });
      throw new Error("Empty model response");
    }

    let parsed: unknown;
    try {
      parsed = parseJsonObjectFromAssistantText(raw);
    } catch (parseErr) {
      console.error("[diagnosis] JSON extract failed", {
        head: raw.slice(0, 600),
        err: parseErr,
      });
      throw new Error("Model did not return parseable JSON");
    }

    try {
      return normalizeDiagnosisPayload(parsed);
    } catch (normErr) {
      console.error("[diagnosis] normalize failed", {
        keys:
          parsed && typeof parsed === "object"
            ? Object.keys(parsed as object)
            : [],
        err: normErr,
      });
      throw new Error("Model JSON could not be normalized");
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    console.error("[generatePlantDiagnosisVision]", e);
    return fallbackDiagnosis(msg.slice(0, 120), plantNickname);
  }
}
