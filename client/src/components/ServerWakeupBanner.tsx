"use client";

import React, { useState, useEffect } from "react";
import { useServerStatus } from "@/context/ServerStatusContext";
import { Server, Sparkles, CheckCircle2, RefreshCw, Activity, WifiOff } from "lucide-react";

export default function ServerWakeupBanner() {
  const { isWakingUp, isOnline, elapsedSeconds, checkServerHealth, triggerWakeUp } = useServerStatus();
  const [justConnected, setJustConnected] = useState(false);
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    if (!isWakingUp && isOnline && elapsedSeconds > 0) {
      setJustConnected(true);
      const timer = setTimeout(() => {
        setJustConnected(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isWakingUp, isOnline, elapsedSeconds]);

  const handleManualRetry = async () => {
    setRetrying(true);
    triggerWakeUp();
    await checkServerHealth();
    setTimeout(() => setRetrying(false), 1000);
  };

  if (!isWakingUp && !justConnected) {
    return null;
  }

  return (
    <div className="fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-2xl animate-in fade-in slide-in-from-top-4 duration-300">
      {isWakingUp ? (
        <div className="p-4 rounded-2xl bg-slate-900/95 text-white border border-teal-500/40 shadow-2xl backdrop-blur-xl flex flex-col gap-2.5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500/20 border border-teal-500/30 text-teal-400 flex items-center justify-center flex-shrink-0 animate-pulse">
                <Server className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold tracking-wider uppercase text-teal-400 flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    Cloud Backend Waking Up ({elapsedSeconds}s)
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/10 text-slate-300">
                    Render Free Tier Spin-up
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  The backend server is spinning up after being idle (~20–40s). Your requests and data will load automatically once connected.
                </p>
              </div>
            </div>

            <button
              onClick={handleManualRetry}
              disabled={retrying}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors cursor-pointer flex-shrink-0"
              title="Ping server"
            >
              <RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} />
            </button>
          </div>

          {/* Animated loading bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-300 h-1.5 rounded-full transition-all duration-1000 animate-pulse"
              style={{
                width: `${Math.min(100, Math.max(15, (elapsedSeconds / 35) * 100))}%`,
              }}
            />
          </div>
        </div>
      ) : justConnected ? (
        <div className="p-3.5 rounded-2xl bg-emerald-900/95 text-white border border-emerald-400/50 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <div className="text-xs font-semibold">
              <span className="font-bold text-emerald-300">Cloud Server Online!</span> Connected successfully in {elapsedSeconds}s. All services ready.
            </div>
          </div>
          <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider bg-emerald-800/80 px-2 py-0.5 rounded-full">
            Live
          </span>
        </div>
      ) : null}
    </div>
  );
}
