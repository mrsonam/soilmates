"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type CollectionPageActionsValue = {
  openCreateArea: () => void;
  hasCreateAreaHandler: boolean;
  registerCreateAreaHandler: (fn: (() => void) | null) => void;
};

const CollectionPageActionsContext =
  createContext<CollectionPageActionsValue | null>(null);

export function useCollectionPageActions() {
  return useContext(CollectionPageActionsContext);
}

export function CollectionPageActionsProvider({ children }: { children: ReactNode }) {
  const handlerRef = useRef<(() => void) | null>(null);
  const [hasHandler, setHasHandler] = useState(false);

  const registerCreateAreaHandler = useCallback((fn: (() => void) | null) => {
    handlerRef.current = fn;
    setHasHandler(fn != null);
  }, []);

  const openCreateArea = useCallback(() => {
    handlerRef.current?.();
  }, []);

  const value = useMemo(
    () => ({
      openCreateArea,
      hasCreateAreaHandler: hasHandler,
      registerCreateAreaHandler,
    }),
    [hasHandler, openCreateArea, registerCreateAreaHandler],
  );

  return (
    <CollectionPageActionsContext.Provider value={value}>
      {children}
    </CollectionPageActionsContext.Provider>
  );
}
