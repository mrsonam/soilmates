/**
 * Browser connectivity — complements `navigator.onLine` with a coarse "probe"
 * when we need more confidence after `online` fires.
 */

export function readNavigatorOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function subscribeOnlineStatus(
  onChange: (online: boolean) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  const sync = () => onChange(readNavigatorOnline());

  window.addEventListener("online", sync);
  window.addEventListener("offline", sync);
  sync();

  return () => {
    window.removeEventListener("online", sync);
    window.removeEventListener("offline", sync);
  };
}
