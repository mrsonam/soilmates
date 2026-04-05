"use client";

import { memo } from "react";
import Image from "next/image";
import { formatCareLogWhen } from "@/lib/format";
import { AssistantMarkdown } from "./assistant-markdown";

type AssistantMessageBubbleProps = {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: Date | string;
  diagnosisImageThumbs?: Array<{ id: string; signedUrl: string | null }>;
};

function AssistantMessageBubbleInner({
  role,
  content,
  createdAt,
  diagnosisImageThumbs,
}: AssistantMessageBubbleProps) {
  if (role === "system" || role === "tool") return null;

  const isUser = role === "user";
  const when =
    typeof createdAt === "string" ? createdAt : createdAt.toISOString();

  return (
    <div
      className={[
        "flex w-full",
        isUser ? "justify-end" : "justify-start",
      ].join(" ")}
    >
      <div
        className={[
          "animate-message-in max-w-[min(100%,36rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-[0_2px_12px_-4px_rgba(27,28,26,0.08)]",
          isUser
            ? "bg-primary text-on-primary rounded-br-md"
            : "bg-surface-container-high/95 text-on-surface ring-1 ring-outline-variant/10 rounded-bl-md",
        ].join(" ")}
      >
        {!isUser &&
        diagnosisImageThumbs &&
        diagnosisImageThumbs.some((t) => t.signedUrl) ? (
          <div
            className="mb-3 flex flex-wrap gap-2"
            aria-label="Photos used for this review"
          >
            {diagnosisImageThumbs.map((t) =>
              t.signedUrl ? (
                <div
                  key={t.id}
                  className="relative size-14 shrink-0 overflow-hidden rounded-xl ring-1 ring-outline-variant/15 sm:size-16"
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
        {isUser ? (
          <p className="whitespace-pre-wrap break-words">{content}</p>
        ) : (
          <AssistantMarkdown content={content} />
        )}
        <p
          className={[
            "mt-2 text-[0.65rem] font-medium tabular-nums",
            isUser ? "text-on-primary/75" : "text-on-surface-variant/80",
          ].join(" ")}
        >
          {formatCareLogWhen(when)}
        </p>
      </div>
    </div>
  );
}

export const AssistantMessageBubble = memo(AssistantMessageBubbleInner);
