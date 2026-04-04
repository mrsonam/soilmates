import Image from "next/image";
import { formatCareLogWhen } from "@/lib/format";
import { AssistantMarkdown } from "./assistant-markdown";

export function AssistantMessageBubble({
  role,
  content,
  createdAt,
  diagnosisImageThumbs,
}: {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: Date | string;
  diagnosisImageThumbs?: Array<{ id: string; signedUrl: string | null }>;
}) {
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
          "max-w-[min(100%,36rem)] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm",
          isUser
            ? "bg-primary text-on-primary rounded-br-md"
            : "bg-surface-container-high/90 text-on-surface ring-1 ring-outline-variant/12 rounded-bl-md",
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
