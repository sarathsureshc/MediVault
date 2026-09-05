"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Users,
  Stethoscope,
  FlaskConical,
  Pill,
  UserCheck,
  Ban,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  RefreshCw,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

interface UserProfile {
  _id: string;
  email: string;
  role: "patient" | "doctor" | "lab" | "pharmacy" | "admin";
  isVerified: boolean;
  isBlocked?: boolean;
  blockReason?: string;
  blockedAt?: string;
  createdAt: string;
  profile?: {
    _id?: string;
    fullName?: string;
    labName?: string;
    pharmacyName?: string;
    specialization?: string;
    qualification?: string;
    hospitalClinicName?: string;
    licenseNumber?: string;
    phone?: string;
    address?: string;
    consultationFee?: number;
    patientID?: string;
    isVerifiedByAdmin?: boolean;
  };
}

interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalLabs: number;
  totalPharmacies: number;
  totalPatients: number;
  totalBlocked: number;
}

export default function AdminCompliancePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRoleTab, setSelectedRoleTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "blocked">("all");

  // Modal State for Blocking
  const [selectedUserForAction, setSelectedUserForAction] = useState<UserProfile | null>(null);
  const [blockReason, setBlockReason] = useState("Reported Medical Malpractice / Negligence");
  const [customReason, setCustomReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const fetchStatsAndUsers = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get(`/admin/users?role=${selectedRoleTab}&status=${statusFilter}&search=${encodeURIComponent(searchQuery)}`),
      ]);
      setStats(statsRes.data.data);
      setUsers(usersRes.data.data.users);
    } catch (err: any) {
      setErrorToast(err.response?.data?.message || "Failed to fetch administrative data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchStatsAndUsers();
    }
  }, [user, selectedRoleTab, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatsAndUsers();
  };

  const handleToggleBlock = async (targetUser: UserProfile, block: boolean) => {
    setActionLoading(true);
    setErrorToast(null);
    try {
      const finalReason = blockReason === "Other Custom Violation" ? customReason : blockReason;
      const res = await api.patch(`/admin/users/${targetUser._id}/block`, {
        isBlocked: block,
        reason: block ? finalReason : undefined,
      });

      setSuccessToast(res.data.message);
      setSelectedUserForAction(null);
      setCustomReason("");
      fetchStatsAndUsers();
    } catch (err: any) {
      setErrorToast(err.response?.data?.message || "Action failed.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleEntityVerification = async (targetUser: UserProfile, currentVerified: boolean) => {
    try {
      await api.patch(`/admin/users/${targetUser._id}/verify-entity`, {
        isVerifiedByAdmin: !currentVerified,
      });
      setSuccessToast(`License verification updated for ${targetUser.email}`);
      fetchStatsAndUsers();
    } catch (err: any) {
      setErrorToast(err.response?.data?.message || "Verification update failed.");
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-14 w-14 text-rose-600 animate-bounce" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="text-sm text-slate-500">Administrative clearance required to view this compliance audit portal.</p>
      </div>
    );
  }

  const roleTabItems = [
    { key: "all", label: "All Profiles", icon: Users, count: stats?.totalUsers ?? 0 },
    { key: "doctor", label: "Doctors", icon: Stethoscope, count: stats?.totalDoctors ?? 0 },
    { key: "lab", label: "Laboratories", icon: FlaskConical, count: stats?.totalLabs ?? 0 },
    { key: "pharmacy", label: "Pharmacies", icon: Pill, count: stats?.totalPharmacies ?? 0 },
    { key: "patient", label: "Patients", icon: UserCheck, count: stats?.totalPatients ?? 0 },
    { key: "blocked", label: "Flagged / Malpractice", icon: ShieldAlert, count: stats?.totalBlocked ?? 0 },
  ];

  const presetMalpracticeReasons = [
    "Reported Medical Malpractice / Negligence",
    "Forged or Expired Regulatory License",
    "Prescription / Substance Abuse Violations",
    "Unsanitary Lab Standards & Inaccurate Results",
    "Overcharging & Fraudulent Insurance Claims",
    "Patient Data Privacy Breach Violation",
    "Other Custom Violation",
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notifications */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {errorToast && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600 flex-shrink-0" />
            <span>{errorToast}</span>
          </div>
          <button onClick={() => setErrorToast(null)} className="text-rose-600 hover:text-rose-800 cursor-pointer">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2 text-teal-400 font-semibold text-xs uppercase tracking-widest">
            <ShieldCheck className="h-4 w-4" />
            Ecosystem Oversight & Governance
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Practitioner & Entity Compliance Portal
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Audit clinical credentials, inspect all user profiles across departments, and enforce immediate suspension or revocation for malpractice violations.
          </p>
        </div>
        <div className="flex items-center gap-3 relative z-10">
          <Button
            onClick={fetchStatsAndUsers}
            variant="outline"
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh Directory
          </Button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <Card className="bg-white/90 border border-slate-200/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Total Profiles</span>
              <Users className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats?.totalUsers ?? "-"}</p>
            <p className="text-[10px] text-slate-400">All registered users</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 border border-slate-200/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Doctors</span>
              <Stethoscope className="h-4 w-4 text-blue-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats?.totalDoctors ?? "-"}</p>
            <p className="text-[10px] text-blue-600 font-medium">Licensed Practitioners</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 border border-slate-200/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Laboratories</span>
              <FlaskConical className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats?.totalLabs ?? "-"}</p>
            <p className="text-[10px] text-purple-600 font-medium">Diagnostic Centers</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 border border-slate-200/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Pharmacies</span>
              <Pill className="h-4 w-4 text-emerald-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats?.totalPharmacies ?? "-"}</p>
            <p className="text-[10px] text-emerald-600 font-medium">Dispensing Outlets</p>
          </CardContent>
        </Card>

        <Card className="bg-white/90 border border-slate-200/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-slate-500 text-xs font-semibold">
              <span>Patients</span>
              <UserCheck className="h-4 w-4 text-teal-600" />
            </div>
            <p className="text-2xl font-bold text-slate-900">{stats?.totalPatients ?? "-"}</p>
            <p className="text-[10px] text-teal-600 font-medium">Health ID Holders</p>
          </CardContent>
        </Card>

        <Card className="bg-rose-50/70 border border-rose-200/80 shadow-xs">
          <CardContent className="p-4 space-y-1">
            <div className="flex items-center justify-between text-rose-700 text-xs font-bold">
              <span>Suspended</span>
              <ShieldAlert className="h-4 w-4 text-rose-600" />
            </div>
            <p className="text-2xl font-bold text-rose-900">{stats?.totalBlocked ?? "-"}</p>
            <p className="text-[10px] text-rose-600 font-medium">Malpractice Blocks</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="border border-slate-200/90 shadow-sm bg-white">
        <CardContent className="p-4 space-y-4">
          {/* Role Navigation Pills */}
          <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-100">
            {roleTabItems.map((tab) => {
              const Icon = tab.icon;
              const isActive = selectedRoleTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => {
                    setSelectedRoleTab(tab.key);
                    if (tab.key === "blocked") {
                      setStatusFilter("blocked");
                    } else if (statusFilter === "blocked") {
                      setStatusFilter("all");
                    }
                  }}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md shadow-slate-900/10"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200/80 text-slate-700"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search and Secondary Filter Row */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search profiles by name, email, license number, hospital/clinic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-xs sm:text-sm bg-slate-50/50"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Status: All Statuses</option>
                <option value="active">Status: Active & Verified</option>
                <option value="blocked">Status: Blocked / Suspended</option>
              </select>
              <Button type="submit" variant="gradient" size="sm" className="px-5">
                Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* User & Practitioner Cards / List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Audit Profiles ({users.length} Matching Records)
          </p>
        </div>

        {isLoading ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
            <RefreshCw className="h-8 w-8 text-teal-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Loading profile data and licensing registries...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80 space-y-2">
            <Users className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-base font-bold text-slate-700">No profiles found</p>
            <p className="text-xs text-slate-400">Try adjusting your role filter or search keywords.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {users.map((profileUser) => {
              const isBlocked = profileUser.isBlocked;
              const role = profileUser.role;
              const profile = profileUser.profile;

              const displayName =
                profile?.fullName ||
                profile?.labName ||
                profile?.pharmacyName ||
                (role === "admin" ? "Platform Administrator" : "Unassigned Name");

              const roleBadgeColors: Record<string, string> = {
                doctor: "bg-blue-50 text-blue-700 border-blue-200",
                lab: "bg-purple-50 text-purple-700 border-purple-200",
                pharmacy: "bg-emerald-50 text-emerald-700 border-emerald-200",
                patient: "bg-teal-50 text-teal-700 border-teal-200",
                admin: "bg-slate-900 text-white border-slate-800",
              };

              return (
                <div
                  key={profileUser._id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isBlocked
                      ? "bg-rose-50/40 border-rose-300 shadow-sm"
                      : "bg-white border-slate-200/90 hover:border-slate-300 shadow-xs"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Left: Avatar & Basic Info */}
                    <div className="flex items-start gap-4">
                      <div
                        className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-xs ${
                          isBlocked
                            ? "bg-rose-100 text-rose-700"
                            : role === "doctor"
                            ? "bg-blue-100 text-blue-700"
                            : role === "lab"
                            ? "bg-purple-100 text-purple-700"
                            : role === "pharmacy"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-teal-100 text-teal-700"
                        }`}
                      >
                        {role === "doctor" && <Stethoscope className="h-6 w-6" />}
                        {role === "lab" && <FlaskConical className="h-6 w-6" />}
                        {role === "pharmacy" && <Pill className="h-6 w-6" />}
                        {role === "patient" && <UserCheck className="h-6 w-6" />}
                        {role === "admin" && <ShieldCheck className="h-6 w-6" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-slate-900">{displayName}</h3>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                              roleBadgeColors[role] || "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {role}
                          </span>

                          {/* Status Pill */}
                          {isBlocked ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-600 text-white flex items-center gap-1 shadow-2xs">
                              <Ban className="h-3 w-3" />
                              SUSPENDED / BLOCKED
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              Active in Vault
                            </span>
                          )}

                          {/* Admin License Verified Badge for Doctor/Lab/Pharmacy */}
                          {(role === "doctor" || role === "lab" || role === "pharmacy") && (
                            <button
                              onClick={() =>
                                handleToggleEntityVerification(
                                  profileUser,
                                  Boolean(profile?.isVerifiedByAdmin)
                                )
                              }
                              title="Click to toggle official admin licensing verification"
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                                profile?.isVerifiedByAdmin
                                  ? "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100"
                                  : "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200"
                              }`}
                            >
                              <Award className="h-3 w-3" />
                              {profile?.isVerifiedByAdmin ? "License Verified" : "License Unverified"}
                            </button>
                          )}
                        </div>

                        {/* Subtitle / Attributes */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-0.5">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3.5 w-3.5 text-slate-400" />
                            {profileUser.email}
                          </span>

                          {profile?.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="h-3.5 w-3.5 text-slate-400" />
                              {profile?.phone}
                            </span>
                          )}

                          {profile?.licenseNumber && (
                            <span className="flex items-center gap-1 font-mono text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md font-semibold">
                              <FileCheck2 className="h-3.5 w-3.5 text-slate-500" />
                              Lic #{profile?.licenseNumber}
                            </span>
                          )}

                          {profile?.specialization && (
                            <span className="text-blue-700 font-medium">
                              Spec: {profile?.specialization} ({profile?.qualification})
                            </span>
                          )}

                          {profile?.hospitalClinicName && (
                            <span className="flex items-center gap-1 text-slate-600">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              {profile?.hospitalClinicName}
                            </span>
                          )}

                          {profile?.patientID && (
                            <span className="font-mono text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md font-semibold">
                              ID: {profile?.patientID}
                            </span>
                          )}

                          <span className="flex items-center gap-1 text-slate-400 text-[11px]">
                            <Calendar className="h-3 w-3" />
                            Joined {new Date(profileUser.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Malpractice Notice Banner if Blocked */}
                        {isBlocked && (
                          <div className="mt-2.5 p-3 rounded-xl bg-rose-100/80 border border-rose-300 text-rose-900 text-xs space-y-1">
                            <div className="flex items-center gap-1.5 font-bold">
                              <AlertTriangle className="h-4 w-4 text-rose-600" />
                              <span>MALPRACTICE SUSPENSION REASON:</span>
                            </div>
                            <p className="font-medium pl-5">{profileUser.blockReason || "Unspecified malpractice violation"}</p>
                            {profileUser.blockedAt && (
                              <p className="text-[10px] text-rose-700 pl-5">
                                Suspended on {new Date(profileUser.blockedAt).toLocaleString()}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2 pt-2 lg:pt-0 lg:border-l lg:border-slate-100 lg:pl-4">
                      {role !== "admin" ? (
                        isBlocked ? (
                          <Button
                            onClick={() => handleToggleBlock(profileUser, false)}
                            disabled={actionLoading}
                            variant="gradient"
                            size="sm"
                            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-xs"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1.5" />
                            Restore Access
                          </Button>
                        ) : (
                          <Button
                            onClick={() => {
                              setSelectedUserForAction(profileUser);
                              setBlockReason("Reported Medical Malpractice / Negligence");
                            }}
                            variant="outline"
                            size="sm"
                            className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                          >
                            <Ban className="h-4 w-4 mr-1.5 text-rose-600" />
                            Block for Malpractice
                          </Button>
                        )
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 italic px-2">
                          Master Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Malpractice Suspension Modal */}
      {selectedUserForAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <Card className="w-full max-w-lg bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="bg-rose-50/80 border-b border-rose-100 p-5 space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-sm uppercase tracking-wider">
                  <ShieldAlert className="h-5 w-5" />
                  <span>Enforce Malpractice Suspension</span>
                </div>
                <button
                  onClick={() => setSelectedUserForAction(null)}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Block {selectedUserForAction.profile?.fullName || selectedUserForAction.profile?.labName || selectedUserForAction.profile?.pharmacyName || selectedUserForAction.email}
              </CardTitle>
              <CardDescription className="text-xs text-rose-800">
                Suspension will immediately revoke JWT authentication, block all patient interactions, prescription generation, and diagnostic test processing.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Violation / Malpractice Category
                </label>
                <select
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                >
                  {presetMalpracticeReasons.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>

              {blockReason === "Other Custom Violation" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                    Specific Report / Audit Findings
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide detailed justification or report ticket #..."
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 font-medium">
                <strong>Audit Trail:</strong> An automated notice will be logged and dispatched to{" "}
                <span className="font-mono underline">{selectedUserForAction.email}</span>.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedUserForAction(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={actionLoading || (blockReason === "Other Custom Violation" && !customReason.trim())}
                  onClick={() => handleToggleBlock(selectedUserForAction, true)}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold"
                >
                  {actionLoading ? "Enforcing Block..." : "Confirm & Suspend Account"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
