import Link from "next/link";
import { Sparkles } from "lucide-react";

export function DashboardAssistantNudge() {
  return (
    <div className="rounded-3xl bg-surface-container-lowest p-5 shadow-sm ring-1 ring-outline-variant/[0.08]">
      <div className="flex gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary-fixed/40 text-primary">
          <Sparkles className="size-5" strokeWidth={1.75} aria-hidden />
        </span>
        <div>
          <p className="text-sm font-medium text-on-surface">Plant assistant</p>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            Ask about watering, light, or odd leaves — tailored to your
            collection when you&apos;re ready.
          </p>
          <Link
            href="/assistant"
            className="mt-3 inline-flex text-sm font-medium text-primary hover:underline"
          >
            Open assistant
          </Link>
        </div>
      </div>
    </div>
  );
}
