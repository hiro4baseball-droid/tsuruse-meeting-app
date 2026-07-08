"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "campus_display_name";

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot() {
  return window.localStorage.getItem(KEY) ?? "";
}

function getServerSnapshot() {
  return "";
}

export function useDisplayName(): [string, (name: string) => void] {
  const name = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const update = useCallback((next: string) => {
    window.localStorage.setItem(KEY, next);
    // Same-tab writes don't emit a native `storage` event, so dispatch one
    // ourselves to notify every useDisplayName() instance in this tab.
    window.dispatchEvent(new Event("storage"));
  }, []);

  return [name, update];
}
