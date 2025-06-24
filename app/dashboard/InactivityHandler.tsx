"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function InactivityHandler() {
  const router = useRouter();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeout = 10 * 60 * 1000; // 10 minutes

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        router.replace("/login");
      }, timeout);
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "click",
    ];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [router]);
  return null;
} 