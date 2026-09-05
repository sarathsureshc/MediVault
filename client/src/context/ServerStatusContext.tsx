"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

interface ServerStatusContextType {
  isWakingUp: boolean;
  isOnline: boolean;
  elapsedSeconds: number;
  triggerWakeUp: () => void;
  checkServerHealth: () => Promise<boolean>;
}

const ServerStatusContext = createContext<ServerStatusContextType | undefined>(undefined);

export function ServerStatusProvider({ children }: { children: React.ReactNode }) {
  const [isWakingUp, setIsWakingUp] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isPollingRef = useRef(false);

  const getHealthUrl = () => {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    // If base ends with /api/v1, hit /api/v1/health, otherwise /health
    return `${base.replace(/\/+$/, "")}/health`;
  };

  const checkServerHealth = useCallback(async (): Promise<boolean> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(getHealthUrl(), {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });
      clearTimeout(timeoutId);

      if (res.ok || res.status === 200) {
        return true;
      }
      return false;
    } catch (err) {
      return false;
    }
  }, []);

  const startWakeUpPoll = useCallback(() => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;
    setIsWakingUp(true);
    setIsOnline(false);
    setElapsedSeconds(0);

    // Timer interval
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    // Poll interval
    const pollInterval = setInterval(async () => {
      const alive = await checkServerHealth();
      if (alive) {
        clearInterval(pollInterval);
        if (timerRef.current) clearInterval(timerRef.current);
        isPollingRef.current = false;
        setIsWakingUp(false);
        setIsOnline(true);
        // Dispatch custom event so any paused or queued requests can resume
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("server-awake"));
        }
      }
    }, 3000);
  }, [checkServerHealth]);

  const triggerWakeUp = useCallback(() => {
    startWakeUpPoll();
  }, [startWakeUpPoll]);

  useEffect(() => {
    // 1. Initial warm-up ping on application load
    checkServerHealth().then((alive) => {
      if (!alive) {
        startWakeUpPoll();
      } else {
        setIsOnline(true);
        setIsWakingUp(false);
      }
    });

    // 2. Listen for global network error triggers from Axios
    const handleNetworkError = () => {
      startWakeUpPoll();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("server-wake-trigger", handleNetworkError);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== "undefined") {
        window.removeEventListener("server-wake-trigger", handleNetworkError);
      }
    };
  }, [checkServerHealth, startWakeUpPoll]);

  return (
    <ServerStatusContext.Provider
      value={{
        isWakingUp,
        isOnline,
        elapsedSeconds,
        triggerWakeUp,
        checkServerHealth,
      }}
    >
      {children}
    </ServerStatusContext.Provider>
  );
}

export function useServerStatus() {
  const context = useContext(ServerStatusContext);
  if (context === undefined) {
    throw new Error("useServerStatus must be used within a ServerStatusProvider");
  }
  return context;
}
