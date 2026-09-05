"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  FileText,
  Calendar,
  User,
  Pill,
  FlaskConical,
  QrCode,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/components/ui/Button";
import Logo from "@/components/Logo";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const links = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      roles: ["patient", "doctor", "lab", "pharmacy", "admin"],
    },
    {
      href: "/dashboard/admin",
      label: "Admin & Compliance",
      icon: ShieldCheck,
      roles: ["admin"],
    },
    {
      href: "/dashboard/appointments",
      label: "Appointments",
      icon: Calendar,
      roles: ["patient", "doctor"],
    },
    {
      href: "/dashboard/history",
      label: "Medical Records",
      icon: FileText,
      roles: ["patient", "doctor"],
    },
    {
      href: "/dashboard/prescriptions",
      label: "Prescriptions",
      icon: Pill,
      roles: ["patient"],
    },
    {
      href: "/dashboard/tests",
      label: "Diagnostic Tests",
      icon: FlaskConical,
      roles: ["patient", "lab"],
    },
    {
      href: "/dashboard/pharmacy",
      label: "Pharmacy & Billing",
      icon: Pill,
      roles: ["pharmacy"],
    },
    {
      href: "/dashboard/scan",
      label: "Scan Patient QR",
      icon: QrCode,
      roles: ["doctor", "lab", "pharmacy"],
    },
    {
      href: "/dashboard/profile",
      label: "Profile & Settings",
      icon: User,
      roles: ["patient", "doctor", "lab", "pharmacy", "admin"],
    },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(user.role));

  const roleColors: Record<string, { bg: string; text: string; ring: string }> = {
    patient: { bg: "bg-teal-50", text: "text-teal-700", ring: "ring-teal-500/20" },
    doctor: { bg: "bg-blue-50", text: "text-blue-700", ring: "ring-blue-500/20" },
    lab: { bg: "bg-purple-50", text: "text-purple-700", ring: "ring-purple-500/20" },
    pharmacy: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-500/20" },
    admin: { bg: "bg-slate-900 text-white", text: "text-white", ring: "ring-slate-700" },
  };

  const currentRoleStyle = roleColors[user.role] || roleColors.patient;

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200/80 bg-white/90 backdrop-blur-md">
      {/* Brand Header */}
      <div className="flex h-16 items-center px-6 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-slate-900 tracking-tight leading-none">
              Medi<span className="text-teal-600">Vault</span>
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-wide">
              HEALTH ECOSYSTEM
            </span>
          </div>
        </Link>
      </div>

      {/* Role Badge Banner */}
      <div className="px-4 pt-4 pb-2">
        <div className={cn(
          "px-3 py-2 rounded-xl flex items-center justify-between text-xs font-semibold ring-1",
          currentRoleStyle.bg,
          currentRoleStyle.text,
          currentRoleStyle.ring
        )}>
          <span className="capitalize flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
            {user.role} Portal
          </span>
          <span className="text-[10px] opacity-75 uppercase tracking-wider font-bold">
            Live
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-3 overflow-y-auto">
        <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Navigation
        </p>
        {filteredLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group relative flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-gradient-to-r from-teal-600 to-teal-700 text-white shadow-md shadow-teal-600/20 font-semibold"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={cn(
                    "h-4 w-4 transition-transform duration-150 group-hover:scale-110",
                    isActive
                      ? "text-white"
                      : "text-slate-400 group-hover:text-teal-600"
                  )}
                />
                <span>{link.label}</span>
              </div>
              {isActive && (
                <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom User Card */}
      <div className="p-3 border-t border-slate-100">
        <Link
          href="/dashboard/profile"
          className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 transition-colors group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="h-8 w-8 rounded-lg bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-xs flex-shrink-0">
              {(user.fullName || user.email).charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-semibold text-slate-800 truncate leading-tight">
                {user.fullName || "My Account"}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}
