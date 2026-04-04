import { z } from "zod";

/** AI JSON output — validated before persistence. */
export const diagnosisAiOutputSchema = z.object({
  summary: z.string().min(1).max(8000),
  suspected_issues: z.array(z.string().min(1).max(500)).max(20),
  confidence: z
    .object({
      level: z.enum(["low", "medium", "high"]),
      score: z.number().min(0).max(1).optional(),
      notes: z.string().max(2000).optional(),
    })
    .optional(),
  recommendations: z.array(z.string().min(1).max(1000)).max(25),
  safest_next_steps: z.array(z.string().min(1).max(1000)).max(25),
  follow_up_questions: z.array(z.string().min(1).max(500)).max(15),
  reasoning_notes: z.string().max(8000).optional().nullable(),
  suggested_ai_health_status: z
    .enum(["thriving", "needs_attention"])
    .nullable()
    .optional(),
  observed_evidence: z.array(z.string().max(500)).max(15).optional(),
  monitor_next: z.array(z.string().max(500)).max(15).optional(),
  when_to_recheck: z.string().max(1000).optional().nullable(),
});

export type DiagnosisAiOutput = z.infer<typeof diagnosisAiOutputSchema>;

export const createDiagnosisInputSchema = z.object({
  collectionSlug: z.string().min(1),
  plantSlug: z.string().min(1),
  imageIds: z.array(z.string().uuid()).min(1).max(8),
  userConcern: z.string().max(4000).optional().nullable(),
  /** When set, must match the plant’s thread (validated server-side). */
  threadId: z.string().uuid().optional().nullable(),
});
