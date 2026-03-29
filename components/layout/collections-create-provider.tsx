"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { CreateCollectionDialog } from "@/components/collections/create-collection-dialog";

type CollectionsCreateContextValue = {
  openCreateCollection: () => void;
};

const CollectionsCreateContext =
  createContext<CollectionsCreateContextValue | null>(null);

export function useCollectionsCreate() {
  return useContext(CollectionsCreateContext);
}

export function CollectionsCreateProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openCreateCollection = useCallback(() => setOpen(true), []);
  const value = useMemo(
    () => ({ openCreateCollection }),
    [openCreateCollection],
  );

  return (
    <CollectionsCreateContext.Provider value={value}>
      {children}
      <CreateCollectionDialog open={open} onClose={() => setOpen(false)} />
    </CollectionsCreateContext.Provider>
  );
}
