import type { DiagnosisHistoryItem } from "@/lib/diagnosis/queries";
import { formatMediumDateTime } from "@/lib/format";
import { DiagnosisConfidenceBadge } from "./diagnosis-confidence-badge";
import { DiagnosisIssueList } from "./diagnosis-issue-list";
import { DiagnosisFollowUpQuestions } from "./diagnosis-follow-up-questions";
import { DiagnosisNextSteps } from "./diagnosis-next-steps";
import Image from "next/image";
import { PlantDiagnosisStatus } from "@prisma/client";

function parseConfidence(
  raw: DiagnosisHistoryItem["confidence"],
): { level?: string; score?: number; notes?: string } | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = raw as Record<string, unknown>;
  return {
    level: typeof o.level === "string" ? o.level : undefined,
    score: typeof o.score === "number" ? o.score : undefined,
    notes: typeof o.notes === "string" ? o.notes : undefined,
  };
}

export function DiagnosisResultCard({
  item,
  variant = "full",
  onResolve,
  resolvePending,
}: {
  item: DiagnosisHistoryItem;
  variant?: "full" | "compact";
  onResolve?: () => void;
  resolvePending?: boolean;
}) {
  const conf = parseConfidence(item.confidence);
  const isActive = item.status === PlantDiagnosisStatus.active;

  return (
    <article
      className={[
        "rounded-3xl bg-surface-container-lowest/70 ring-1 ring-outline-variant/[0.08]",
        variant === "full" ? "p-5 sm:p-7" : "p-4 sm:p-5",
      ].join(" ")}
    >
      <header className="flex flex-col gap-3 border-b border-outline-variant/10 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {isActive ? "Current review" : "Past review"}
          </p>
          <time
            dateTime={item.diagnosedAt}
            className="mt-1 block text-sm text-on-surface-variant"
          >
            {formatMediumDateTime(item.diagnosedAt)}
          </time>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DiagnosisConfidenceBadge confidence={conf} />
          {item.suggestedAiHealthStatus ? (
            <span className="inline-flex rounded-full bg-surface-container-high/80 px-3 py-1 text-xs font-medium text-on-surface-variant ring-1 ring-outline-variant/12">
              AI read:{" "}
              {item.suggestedAiHealthStatus.replace(/_/g, " ")}
            </span>
          ) : null}
        </div>
      </header>

      {item.imageThumbs.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {item.imageThumbs.map((t) =>
            t.signedUrl ? (
              <div
                key={t.id}
                className="relative size-16 overflow-hidden rounded-xl ring-1 ring-outline-variant/12"
              >
                <Image
                  src={t.signedUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              </div>
            ) : null,
          )}
        </div>
      ) : null}

      <div className="mt-5 space-y-6">
        <div>
          <h2
            className={
              variant === "full"
                ? "font-display text-xl font-semibold text-on-surface"
                : "font-display text-lg font-semibold text-on-surface"
            }
          >
            Summary
          </h2>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-on-surface">
            {item.summary}
          </p>
        </div>

        {item.observedEvidence.length > 0 ? (
          <div className="space-y-2">
            <h3 className="font-display text-base font-semibold text-on-surface">
              What stood out
            </h3>
            <ul className="space-y-2">
              {item.observedEvidence.map((s) => (
                <li
                  key={s}
                  className="rounded-2xl bg-surface-container-high/35 px-4 py-3 text-sm leading-relaxed text-on-surface ring-1 ring-outline-variant/[0.06]"
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <DiagnosisIssueList items={item.suspectedIssues} />

        <DiagnosisNextSteps
          safest={item.safestNextSteps}
          recommendations={item.recommendations}
        />

        <DiagnosisFollowUpQuestions items={item.followUpQuestions} />

        {item.monitorNext.length > 0 ? (
          <div className="space-y-2">
            <h3 className="font-display text-base font-semibold text-on-surface">
              What to monitor next
            </h3>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-on-surface-variant marker:text-primary/80">
              {item.monitorNext.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        ) : null}

        {item.whenToRecheck ? (
          <p className="rounded-2xl bg-primary/[0.04] px-4 py-3 text-sm leading-relaxed text-on-surface ring-1 ring-primary/20">
            <span className="font-semibold text-on-surface">When to ask again:</span>{" "}
            {item.whenToRecheck}
          </p>
        ) : null}

        {item.reasoningNotes ? (
          <div className="space-y-1">
            <h3 className="font-display text-base font-semibold text-on-surface">
              Reasoning notes
            </h3>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              {item.reasoningNotes}
            </p>
          </div>
        ) : null}
      </div>

      {isActive && onResolve ? (
        <div className="mt-6 border-t border-outline-variant/10 pt-4">
          <button
            type="button"
            disabled={resolvePending}
            onClick={onResolve}
            className="rounded-full border border-outline-variant/25 bg-surface-container-high/50 px-4 py-2 text-sm font-medium text-on-surface transition hover:bg-surface-container-high disabled:opacity-50"
          >
            Mark as resolved
          </button>
          <p className="mt-2 text-xs text-on-surface-variant">
            Use this when you feel the situation is stable or you’ve addressed the
            main concern. Your history stays visible below.
          </p>
        </div>
      ) : null}
    </article>
  );
}
