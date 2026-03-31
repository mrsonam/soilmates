type AssistantSuggestedPromptsProps = {
  prompts: string[];
  onPick: (text: string) => void;
  disabled?: boolean;
};

export function AssistantSuggestedPrompts({
  prompts,
  onPick,
  disabled,
}: AssistantSuggestedPromptsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((p) => (
        <button
          key={p}
          type="button"
          disabled={disabled}
          onClick={() => onPick(p)}
          className="rounded-full bg-surface-container-high px-3.5 py-2 text-left text-sm font-medium text-on-surface ring-1 ring-outline-variant/15 transition hover:bg-surface-container-highest disabled:opacity-50"
        >
          {p}
        </button>
      ))}
    </div>
  );
}
