type Variant = "global" | "plant";

export function AssistantEmptyState({ variant }: { variant: Variant }) {
  if (variant === "plant") {
    return (
      <div className="rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/50 px-5 py-10 text-center sm:px-8 sm:py-12">
        <p className="font-display text-lg font-semibold text-on-surface">
          Ask about this plant
        </p>
        <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
          I can use your care history, reminders, recent photos metadata, and
          activity from Soil Mates — so answers stay grounded in what you
          actually logged.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-dashed border-outline-variant/25 bg-surface-container-low/50 px-5 py-10 text-center sm:px-8 sm:py-12">
      <p className="font-display text-lg font-semibold text-on-surface">
        Welcome to your assistant
      </p>
      <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
        Ask general plant questions, get calm guidance, or learn how to use
        Soil Mates. I won’t pretend to know about your specific plants unless
        you tell me — or open a plant’s assistant tab for full context.
      </p>
    </div>
  );
}
