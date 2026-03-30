import { getSupabaseAdmin, isSupabaseStorageConfigured } from "@/lib/supabase/admin";

/** Shared channel for silent cross-client refresh (broadcast). */
export const APP_REALTIME_CHANNEL = "soilmates-app-sync";

/**
 * Notify subscribed clients that app data changed (another member or tab).
 * Fire-and-forget; does not block server actions.
 */
export function notifyCollaboratorsOfChange(payload?: {
  collectionIds?: string[];
}): void {
  if (!isSupabaseStorageConfigured()) return;

  try {
    const sb = getSupabaseAdmin();
    const channel = sb.channel(APP_REALTIME_CHANNEL, {
      config: { broadcast: { self: true } },
    });

    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void channel
          .send({
            type: "broadcast",
            event: "data_changed",
            payload: payload ?? {},
          })
          .finally(() => {
            void sb.removeChannel(channel);
          });
      } else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
        void sb.removeChannel(channel);
      }
    });

    setTimeout(() => {
      void sb.removeChannel(channel);
    }, 12_000);
  } catch (e) {
    console.warn("[realtime] broadcast notify failed", e);
  }
}
