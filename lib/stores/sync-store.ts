import { create } from "zustand";

export type GlobalSyncPhase =
  | "idle"
  | "offline"
  | "syncing"
  | "synced"
  | "attention";

type SyncStoreState = {
  online: boolean;
  syncing: boolean;
  phase: GlobalSyncPhase;
  pendingMutations: number;
  pendingImages: number;
  conflictCount: number;
  lastSyncAt: number | null;
  lastSyncMessage: string | null;
  ready: boolean;
  setReady: (v: boolean) => void;
  setOnline: (v: boolean) => void;
  setSyncing: (v: boolean) => void;
  setCounts: (p: {
    pendingMutations: number;
    pendingImages: number;
    conflictCount: number;
  }) => void;
  bumpLastSync: (message?: string | null) => void;
};

function derivePhase(
  online: boolean,
  syncing: boolean,
  pending: number,
  conflicts: number,
): GlobalSyncPhase {
  if (!online) return "offline";
  if (syncing) return "syncing";
  if (conflicts > 0) return "attention";
  if (pending > 0) return "synced";
  return "idle";
}

export const useSyncStore = create<SyncStoreState>((set, get) => ({
  online: typeof navigator !== "undefined" ? navigator.onLine : true,
  syncing: false,
  phase: "idle",
  pendingMutations: 0,
  pendingImages: 0,
  conflictCount: 0,
  lastSyncAt: null,
  lastSyncMessage: null,
  ready: false,
  setReady: (ready) => set({ ready }),
  setOnline: (online) => {
    const s = get();
    const pending = s.pendingMutations + s.pendingImages;
    set({
      online,
      phase: derivePhase(online, s.syncing, pending, s.conflictCount),
    });
  },
  setSyncing: (syncing) => {
    const s = get();
    const pending = s.pendingMutations + s.pendingImages;
    set({
      syncing,
      phase: derivePhase(s.online, syncing, pending, s.conflictCount),
    });
  },
  setCounts: ({ pendingMutations, pendingImages, conflictCount }) => {
    const s = get();
    const pending = pendingMutations + pendingImages;
    set({
      pendingMutations,
      pendingImages,
      conflictCount,
      phase: derivePhase(s.online, s.syncing, pending, conflictCount),
    });
  },
  bumpLastSync: (message) =>
    set({
      lastSyncAt: Date.now(),
      lastSyncMessage: message ?? null,
    }),
}));
