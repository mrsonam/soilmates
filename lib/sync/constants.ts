/** After this many failed attempts, queue item moves to dead_letter (no auto-retry). */
export const SYNC_QUEUE_MAX_RETRIES = 8;

/** Reset rows stuck in "syncing" if older than this (ms). Requires syncingStartedAt — optional field. */
export const SYNC_STUCK_MS = 120_000;

/** Interval to flush queue and clear stuck syncing states (ms). */
export const SYNC_WATCHDOG_INTERVAL_MS = 90_000;
