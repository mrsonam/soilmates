"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Images } from "lucide-react";
import { PlantDiagnosisStatus } from "@prisma/client";
import { AssistantMessageBubble } from "./assistant-message-bubble";
import { AssistantComposer } from "./assistant-composer";
import { AssistantEmptyState } from "./assistant-empty-state";
import { AssistantSuggestedPrompts } from "./assistant-suggested-prompts";

const DiagnosisResultCard = dynamic(() =>
  import("@/components/diagnosis/diagnosis-result-card").then((m) => ({
    default: m.DiagnosisResultCard,
  })),
);
const DiagnosisHistoryList = dynamic(() =>
  import("@/components/diagnosis/diagnosis-history-list").then((m) => ({
    default: m.DiagnosisHistoryList,
  })),
);
const PlantAssistantComposer = dynamic(() =>
  import("./plant-assistant-composer").then((m) => ({
    default: m.PlantAssistantComposer,
  })),
);
import {
  createGlobalThreadAction,
  sendAssistantMessageAction,
} from "@/lib/ai/actions";
import { resolvePlantDiagnosisAction } from "@/lib/diagnosis/actions";
import type { PlantGalleryImage } from "@/lib/plants/plant-images";
import type { DiagnosisHistoryItem } from "@/lib/diagnosis/queries";
import { useRouter } from "next/navigation";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  createdAt: string;
  /** Photos used for this message’s diagnosis (assistant replies from photo review) */
  diagnosisImageThumbs?: Array<{ id: string; signedUrl: string | null }>;
};

type AssistantChatProps = {
  mode: "global" | "plant";
  threadId: string | null;
  initialMessages: ChatMessage[];
  collectionSlugForGlobal?: string | null;
  plantNickname?: string;
  /** Plant mode: photo review + gallery */
  collectionSlug?: string;
  plantSlug?: string;
  galleryImages?: PlantGalleryImage[];
  uploadsEnabled?: boolean;
  diagnosisActive?: DiagnosisHistoryItem | null;
  diagnosisHistory?: DiagnosisHistoryItem[];
};

const GLOBAL_PROMPTS = [
  "How do I know if a plant is overwatered?",
  "What causes yellow leaves on houseplants?",
  "What is the best way to care for indoor herbs?",
];

const PLANT_PROMPTS = [
  "What should I do next for this plant?",
  "What do you notice about the care history?",
  "Is the watering pattern reasonable for this plant?",
  "What should I watch over the next week?",
];

export function AssistantChat({
  mode,
  threadId: initialThreadId,
  initialMessages,
  collectionSlugForGlobal,
  plantNickname,
  collectionSlug,
  plantSlug,
  galleryImages = [],
  uploadsEnabled = false,
  diagnosisActive = null,
  diagnosisHistory = [],
}: AssistantChatProps) {
  const router = useRouter();
  const [threadId, setThreadId] = useState<string | null>(initialThreadId);
  const [pending, setPending] = useState(false);
  const [composerPhase, setComposerPhase] = useState<
    "idle" | "upload" | "diagnose"
  >("idle");
  const [resolvePending, setResolvePending] = useState(false);
  const [photoReviewOpen, setPhotoReviewOpen] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingUserText, setPendingUserText] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const chatScrollAnchorRef = useRef<HTMLDivElement | null>(null);

  const composerBusy = composerPhase !== "idle";
  const thinking = pending || composerBusy;

  const loadingLabel =
    composerPhase === "upload"
      ? "Uploading…"
      : composerPhase === "diagnose"
        ? "Diagnosing…"
        : pending
          ? "Writing…"
          : "Thinking…";

  const scrollChatIntoView = useCallback(() => {
    requestAnimationFrame(() => {
      chatScrollAnchorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }, []);

  const focusChatThread = useCallback(() => {
    setPhotoReviewOpen(false);
    scrollChatIntoView();
  }, [scrollChatIntoView]);
  const pastDiagnoses =
    mode === "plant"
      ? diagnosisHistory.filter((h) => h.status !== PlantDiagnosisStatus.active)
      : [];

  useEffect(() => {
    setThreadId(initialThreadId);
  }, [initialThreadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [initialMessages.length, thinking, pendingUserText]);

  useEffect(() => {
    if (!photoReviewOpen) {
      setComposerPhase("idle");
    }
  }, [photoReviewOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash === "#plant-check-in") {
      setPhotoReviewOpen(true);
    }
  }, []);

  async function handleSend(text: string) {
    setActionError(null);
    setPendingUserText(text);
    if (mode === "plant" && photoReviewOpen) {
      setPhotoReviewOpen(false);
    }
    scrollChatIntoView();
    setPending(true);
    try {
      let tid = threadId;
      if (!tid) {
        if (mode !== "global") {
          setPendingUserText(null);
          setPending(false);
          return;
        }
        const created = await createGlobalThreadAction();
        tid = created.id;
        setThreadId(tid);
        router.replace(`/assistant?thread=${encodeURIComponent(tid)}`);
        scrollChatIntoView();
      }

      const result = await sendAssistantMessageAction({
        threadId: tid!,
        content: text,
        collectionSlug: collectionSlugForGlobal ?? undefined,
      });

      if (!result.ok) {
        setActionError(result.error);
        setPendingUserText(null);
        return;
      }

      try {
        router.refresh();
      } catch {
        /* refresh can fail offline; UI still has server response */
      }
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : "Something went wrong. Try again.";
      if (msg.includes("fetch") || msg.includes("Fetch")) {
        setActionError(
          "Could not reach the server. Check your connection and try again.",
        );
      } else {
        setActionError(msg);
      }
      setPendingUserText(null);
    } finally {
      setPending(false);
      setPendingUserText(null);
    }
  }

  const visible = useMemo(
    () =>
      initialMessages.filter(
        (m) => m.role === "user" || m.role === "assistant",
      ),
    [initialMessages],
  );

  /** Avoid double user rows when `router.refresh()` delivers the message before pending UI clears. */
  const serverHasPendingUserContent = useMemo(() => {
    if (!pendingUserText?.trim()) return false;
    const t = pendingUserText.trim();
    return visible.some(
      (m) => m.role === "user" && m.content.trim() === t,
    );
  }, [visible, pendingUserText]);

  const showEmpty =
    visible.length === 0 && !pendingUserText && !thinking;
  const prompts = mode === "plant" ? PLANT_PROMPTS : GLOBAL_PROMPTS;

  return (
    <div className="flex min-h-[min(70vh,720px)] flex-col">
      {actionError ? (
        <div
          className="mb-4 rounded-2xl bg-red-500/10 px-4 py-3 text-sm text-red-900 ring-1 ring-red-500/20"
          role="alert"
        >
          {actionError}
        </div>
      ) : null}
      <div
        id={mode === "plant" ? "plant-assistant-chat" : "assistant-chat-messages"}
        ref={chatScrollAnchorRef}
        className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4"
      >
        {showEmpty ? (
          <AssistantEmptyState variant={mode === "plant" ? "plant" : "global"} />
        ) : null}

        {initialMessages.map((m) => (
          <AssistantMessageBubble
            key={m.id}
            role={m.role}
            content={m.content}
            createdAt={m.createdAt}
            diagnosisImageThumbs={m.diagnosisImageThumbs}
          />
        ))}

        {pendingUserText && !serverHasPendingUserContent ? (
          <AssistantMessageBubble
            role="user"
            content={pendingUserText}
            createdAt={new Date().toISOString()}
          />
        ) : null}

        {thinking ? (
          <div className="flex justify-start" aria-live="polite">
            <div className="rounded-2xl bg-surface-container-high/80 px-4 py-3 text-sm text-on-surface-variant ring-1 ring-outline-variant/12">
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block size-2 animate-pulse rounded-full bg-primary/70"
                  aria-hidden
                />
                <span className="font-medium">{loadingLabel}</span>
              </span>
            </div>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 space-y-3 border-t border-outline-variant/10 pt-4">
        {showEmpty ? (
          <AssistantSuggestedPrompts
            prompts={prompts}
            disabled={thinking}
            onPick={(p) => void handleSend(p)}
          />
        ) : null}

        {mode === "plant" &&
        collectionSlug &&
        plantSlug &&
        plantNickname &&
        threadId &&
        photoReviewOpen ? (
          <div className="space-y-4">
            {diagnosisActive ? (
              <details className="group rounded-2xl bg-surface-container-high/30 ring-1 ring-outline-variant/[0.08] open:pb-4">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-on-surface outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="group-open:text-primary">
                    Current photo review
                  </span>
                </summary>
                <div className="px-4 pt-0">
                  <DiagnosisResultCard
                    item={diagnosisActive}
                    variant="full"
                    onResolve={async () => {
                      setResolvePending(true);
                      try {
                        const r = await resolvePlantDiagnosisAction({
                          collectionSlug,
                          plantSlug,
                          diagnosisId: diagnosisActive.id,
                        });
                        if (r.ok) router.refresh();
                      } finally {
                        setResolvePending(false);
                      }
                    }}
                    resolvePending={resolvePending}
                  />
                </div>
              </details>
            ) : diagnosisHistory.length > 0 ? (
              <p className="rounded-2xl bg-surface-container-high/40 px-4 py-3 text-sm text-on-surface-variant ring-1 ring-outline-variant/[0.08]">
                No active review — run a new check below or open earlier
                reviews.
              </p>
            ) : null}

            {pastDiagnoses.length > 0 ? (
              <details className="group rounded-2xl bg-surface-container-high/30 ring-1 ring-outline-variant/[0.08] open:pb-4">
                <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-on-surface outline-none marker:content-none [&::-webkit-details-marker]:hidden">
                  <span className="group-open:text-primary">
                    Earlier photo reviews ({pastDiagnoses.length})
                  </span>
                </summary>
                <div className="px-4 pt-0">
                  <DiagnosisHistoryList items={pastDiagnoses} />
                </div>
              </details>
            ) : null}

            <PlantAssistantComposer
              collectionSlug={collectionSlug}
              plantSlug={plantSlug}
              plantNickname={plantNickname}
              threadId={threadId}
              galleryImages={galleryImages}
              uploadsEnabled={uploadsEnabled}
              onSendText={handleSend}
              chatPending={pending}
              onComposerActivity={setComposerPhase}
              onFocusChat={focusChatThread}
              onBackToChat={() => setPhotoReviewOpen(false)}
            />
          </div>
        ) : null}

        {mode === "plant" &&
        collectionSlug &&
        plantSlug &&
        plantNickname &&
        threadId &&
        !photoReviewOpen ? (
          <div className="space-y-3">
            <AssistantComposer
              onSend={handleSend}
              disabled={thinking || (mode === "plant" && !threadId)}
              placeholder={
                plantNickname
                  ? `Ask about ${plantNickname}…`
                  : "Ask about plants or Soil Mates…"
              }
              leadingSlot={
                <button
                  type="button"
                  onClick={() => setPhotoReviewOpen(true)}
                  disabled={thinking}
                  className="flex size-11 items-center justify-center rounded-2xl text-on-surface-variant ring-1 ring-outline-variant/20 transition hover:bg-surface-container-highest hover:text-primary hover:ring-primary/25 disabled:opacity-40"
                  aria-label="Photo review"
                  title="Photo review"
                >
                  <Images className="size-5" strokeWidth={1.75} aria-hidden />
                </button>
              }
            />
          </div>
        ) : mode !== "plant" || !collectionSlug || !plantSlug || !plantNickname || !threadId ? (
          <AssistantComposer
            onSend={handleSend}
            disabled={thinking || (mode === "plant" && !threadId)}
            placeholder={
              mode === "plant" && plantNickname
                ? `Ask about ${plantNickname}…`
                : "Ask about plants or Soil Mates…"
            }
          />
        ) : null}
        <p className="text-center text-[0.65rem] font-medium uppercase tracking-[0.12em] text-on-surface-variant/80">
          Soil Mates assistant can make mistakes. Verify important care decisions.
        </p>
      </div>
    </div>
  );
}
