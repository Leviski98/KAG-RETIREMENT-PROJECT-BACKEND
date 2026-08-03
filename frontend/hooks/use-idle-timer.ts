"use client";

import { useEffect, useRef } from "react";

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "scroll",
  "touchstart",
  "click",
] as const;

interface UseIdleTimerOptions {
  /** Milliseconds of inactivity after which `onIdle` fires. */
  timeoutMs: number;
  onIdle: () => void;
  /** Set to false to fully disable tracking and pending timers. */
  enabled?: boolean;
}

/**
 * Fires `onIdle` once after `timeoutMs` elapses with no detected user
 * activity (mouse, keyboard, touch, scroll, click). The timer resets on every
 * activity event via a plain ref (no re-renders), and everything is torn down
 * when `enabled` is false so callers can scope tracking to authenticated areas.
 */
export function useIdleTimer({ timeoutMs, onIdle, enabled = true }: UseIdleTimerOptions) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onIdleRef = useRef(onIdle);

  useEffect(() => {
    onIdleRef.current = onIdle;
  }, [onIdle]);

  useEffect(() => {
    if (!enabled) return;

    function resetTimer() {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => onIdleRef.current(), timeoutMs);
    }

    resetTimer();
    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimer, { passive: true });
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
    };
  }, [enabled, timeoutMs]);
}
