"use client";

import { useEffect, useState } from "react";
import { readNavigatorOnline, subscribeOnlineStatus } from "@/lib/sync/network";

export function useOnlineStatus(): boolean {
  const [online, setOnline] = useState(
    typeof navigator !== "undefined" ? readNavigatorOnline() : true,
  );

  useEffect(() => subscribeOnlineStatus(setOnline), []);

  return online;
}
