"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type CollectionHeaderState = {
  subtitleLine: string | null;
  showCollectionSearch: boolean;
};

const initial: CollectionHeaderState = {
  subtitleLine: null,
  showCollectionSearch: false,
};

type CollectionHeaderDispatch = {
  setCollectionHeader: (partial: Partial<CollectionHeaderState>) => void;
  resetCollectionHeader: () => void;
};

const CollectionHeaderDispatchContext =
  createContext<CollectionHeaderDispatch | null>(null);

const CollectionHeaderStateContext =
  createContext<CollectionHeaderState>(initial);

export function useCollectionHeaderDispatch() {
  return useContext(CollectionHeaderDispatchContext);
}

export function useCollectionHeaderState() {
  return useContext(CollectionHeaderStateContext);
}

export function CollectionHeaderProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CollectionHeaderState>(initial);

  const setCollectionHeader = useCallback(
    (partial: Partial<CollectionHeaderState>) => {
      setState((s) => ({ ...s, ...partial }));
    },
    [],
  );

  const resetCollectionHeader = useCallback(() => {
    setState(initial);
  }, []);

  const dispatch = useMemo(
    () => ({ setCollectionHeader, resetCollectionHeader }),
    [resetCollectionHeader, setCollectionHeader],
  );

  return (
    <CollectionHeaderDispatchContext.Provider value={dispatch}>
      <CollectionHeaderStateContext.Provider value={state}>
        {children}
      </CollectionHeaderStateContext.Provider>
    </CollectionHeaderDispatchContext.Provider>
  );
}
