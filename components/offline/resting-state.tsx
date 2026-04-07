"use client";

import { useSyncStatus } from "@/hooks/useSyncStatus";
import { Moon, Leaf } from "lucide-react";
import { useEffect } from "react";

export function RestingState() {
  const { phase, ready } = useSyncStatus();
  const isOffline = ready && phase === "offline";

  useEffect(() => {
    if (isOffline) {
      document.body.classList.add("offline-resting");
    } else {
      document.body.classList.remove("offline-resting");
    }
  }, [isOffline]);

  if (!isOffline) return null;

  return (
    <>
      {/* Gentle desaturation overlay, ignores pointer events to keep app usable */}
      <div 
        className="pointer-events-none fixed inset-0 z-[99] transition-all duration-1000 ease-in-out backdrop-grayscale-[0.35] bg-surface/5" 
        aria-hidden="true" 
      />
      
      {/* Floating status indicator */}
      <div className="fixed bottom-8 left-1/2 z-[100] flex -translate-x-1/2 animate-in slide-in-from-bottom-5 fade-in duration-700 items-center gap-3 rounded-full bg-surface-container-highest/80 px-5 py-2.5 shadow-2xl backdrop-blur-xl border border-white/5">
        <div className="relative flex items-center justify-center">
          <Leaf className="h-4 w-4 text-primary opacity-60" />
          <Moon className="absolute -right-2 -top-1.5 h-3 w-3 text-on-surface-variant opacity-80" />
        </div>
        <p className="text-[13px] font-medium tracking-tight text-on-surface">
          Sleeping offline. We'll sync up when you're back.
        </p>
      </div>
    </>
  );
}
