import { formatCareLogWhen } from "@/lib/format";

export function AssistantMessageBubble({
  role,
  content,
  createdAt,
}: {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: Date | string;
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
        <p className="whitespace-pre-wrap break-words">{content}</p>
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
