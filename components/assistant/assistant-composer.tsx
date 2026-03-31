"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Send } from "lucide-react";

type AssistantComposerProps = {
  onSend: (text: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
};

export function AssistantComposer({
  onSend,
  disabled,
  placeholder = "Ask anything…",
}: AssistantComposerProps) {
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(e?: FormEvent) {
    e?.preventDefault();
    const t = text.trim();
    if (!t || pending || disabled) return;
    startTransition(async () => {
      setText("");
      await onSend(t);
    });
  }

  return (
    <form
      onSubmit={submit}
      className="flex items-end gap-2 rounded-3xl bg-surface-container-high/90 p-2 ring-1 ring-outline-variant/15 focus-within:ring-2 focus-within:ring-primary/20"
    >
      <label className="sr-only" htmlFor="assistant-composer-input">
        Message
      </label>
      <textarea
        id="assistant-composer-input"
        rows={1}
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        placeholder={placeholder}
        disabled={pending || disabled}
        className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-on-surface placeholder:text-on-surface-variant/50 outline-none"
      />
      <button
        type="submit"
        disabled={pending || disabled || !text.trim()}
        className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-on-primary transition hover:bg-primary/92 disabled:opacity-40"
        aria-label="Send message"
      >
        <Send className="size-5" strokeWidth={2} aria-hidden />
      </button>
    </form>
  );
}
