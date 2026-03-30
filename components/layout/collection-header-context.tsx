"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/** When set, the app header shows an area detail title block (see `AreaHeaderSync`). */
export type AreaHeaderPayload = {
  eyebrow: string;
  title: string;
  tagline: string | null;
};

type CollectionHeaderState = {
  subtitleLine: string | null;
  showCollectionSearch: boolean;
  areaHeader: AreaHeaderPayload | null;
};

const initial: CollectionHeaderState = {
  subtitleLine: null,
  showCollectionSearch: false,
  areaHeader: null,
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
