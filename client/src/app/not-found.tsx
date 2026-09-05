"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50/80 px-4 text-center relative overflow-hidden font-sans">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full p-8 rounded-3xl bg-white/90 border border-slate-200/90 shadow-xl backdrop-blur-md space-y-5">
        <div className="h-16 w-16 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto border border-teal-100 shadow-sm">
          <ShieldAlert className="h-8 w-8" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold font-mono text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
            Error 404
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
            The requested medical file, portal route, or resource could not be located in your MediVault session.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full text-xs flex items-center justify-center gap-1.5">
              <Home className="h-4 w-4" /> Home Page
            </Button>
          </Link>
          <Link href="/dashboard" className="flex-1">
            <Button variant="gradient" className="w-full text-xs flex items-center justify-center gap-1.5">
              <LayoutDashboard className="h-4 w-4" /> Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
