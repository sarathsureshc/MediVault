"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import {
  Calendar,
  FileText,
  Pill,
  FlaskConical,
  QrCode,
  Clock,
  UserCheck,
  CheckCircle,
  PlusCircle,
  Activity,
  Receipt,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Stethoscope,
} from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        if (!user) return;

        if (user.role === "patient") {
          const [profileRes, aptRes] = await Promise.allSettled([
            api.get("/patients/profile"),
            api.get("/appointments"),
          ]);

          let pId = "";
          if (profileRes.status === "fulfilled") {
            pId = profileRes.value.data.data?.patient?.patientID;
          }

          let aptCount = 0;
          let pendingApt = 0;
          if (aptRes.status === "fulfilled") {
            const list = aptRes.value.data.data?.appointments || [];
            aptCount = list.filter((a: any) => a.status !== "cancelled").length;
            pendingApt = list.filter((a: any) => a.status === "pending").length;
          }

          let consultCount = 0;
          let testCount = 0;
          if (pId) {
            const [cRes, tRes] = await Promise.allSettled([
              api.get(`/consultations/${pId}`),
              api.get(`/labs/patient/${pId}`),
            ]);
            if (cRes.status === "fulfilled") {
              consultCount = cRes.value.data.data?.consultations?.length || 0;
            }
            if (tRes.status === "fulfilled") {
              testCount = tRes.value.data.data?.results?.length || 0;
            }
          }

          setStats({
            appointments: aptCount,
            pendingAppointments: pendingApt,
            prescriptions: consultCount,
            labReports: testCount,
            patientID: pId,
          });
        } else if (user.role === "doctor") {
          const docStatsRes = await api.get("/doctors/dashboard");
          setStats(docStatsRes.data.data || {});
        } else if (user.role === "lab") {
          const historyRes = await api.get("/labs/history");
          const results = historyRes.data.data?.results || [];
          setStats({
            totalUploaded: results.length,
          });
        } else if (user.role === "pharmacy") {
          const historyRes = await api.get("/pharmacies/history");
          const issues = historyRes.data.data?.issues || [];
          const totalRevenue = issues.reduce(
            (sum: number, i: any) => sum + (i.totalAmount || 0),
            0
          );
          setStats({
            totalIssues: issues.length,
            totalRevenue,
          });
        } else if (user.role === "admin") {
          const adminStatsRes = await api.get("/admin/stats");
          setStats(adminStatsRes.data.data || {});
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto p-4 space-y-6 font-sans">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-700 via-teal-800 to-slate-900 text-white p-6 sm:p-8 shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-0 right-1/3 w-48 h-48 bg-emerald-400/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              {user.role} workspace
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user.fullName || "User"}
            </h1>
            <p className="text-teal-100/80 text-xs sm:text-sm max-w-xl leading-relaxed">
              {user.role === "patient" &&
                "Access your secure health passport, schedule consultations, and track real-time clinical files."}
              {user.role === "doctor" &&
                "Review scheduled patient consultations, manage availability, and access OTP-verified medical records."}
              {user.role === "lab" &&
                "Publish validated diagnostic test results and digital PDF reports directly to patient profiles."}
              {user.role === "pharmacy" &&
                "Dispense prescribed medications, calculate pricing, and generate digital invoices."}
              {user.role === "admin" &&
                "Oversee ecosystem practitioners, audit clinical licensing, and enforce malpractice prevention."}
            </p>
          </div>

          <div className="flex-shrink-0">
            {user.role === "patient" && (
              <Link href="/dashboard/appointments">
                <Button className="bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all cursor-pointer">
                  Book Appointment <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            )}
            {user.role === "doctor" && (
              <Link href="/dashboard/scan">
                <Button className="bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer">
                  <QrCode className="h-4 w-4 text-teal-700" /> Scan Patient QR
                </Button>
              </Link>
            )}
            {user.role === "pharmacy" && (
              <Link href="/dashboard/pharmacy">
                <Button className="bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer">
                  <Pill className="h-4 w-4 text-teal-700" /> Dispense Medicine
                </Button>
              </Link>
            )}
            {user.role === "lab" && (
              <Link href="/dashboard/tests">
                <Button className="bg-white text-teal-900 hover:bg-teal-50 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer">
                  <PlusCircle className="h-4 w-4 text-teal-700" /> Upload Report
                </Button>
              </Link>
            )}
            {user.role === "admin" && (
              <Link href="/dashboard/admin">
                <Button className="bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs sm:text-sm shadow-lg flex items-center gap-2 cursor-pointer">
                  <ShieldCheck className="h-4 w-4 text-teal-700" /> Open Compliance Portal
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Real-Time Metrics Cards */}
      {user.role === "patient" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-slate-200/90 shadow-xs hover:border-teal-300 transition-all">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Appointments</span>
                <div className="h-8 w-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <Calendar className="h-4 w-4" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? "..." : stats.appointments ?? 0}
              </p>
              <p className="text-xs text-teal-600 font-semibold mt-1">
                {stats.pendingAppointments ? `${stats.pendingAppointments} pending review` : "All confirmed"}
              </p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Prescriptions</span>
                <div className="h-8 w-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Pill className="h-4 w-4" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? "..." : stats.prescriptions ?? 0}
              </p>
              <Link
                href="/dashboard/prescriptions"
                className="text-xs text-blue-600 font-semibold hover:underline mt-1 inline-block"
              >
                View digital regimens →
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/90 shadow-xs hover:border-purple-300 transition-all">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Lab Reports</span>
                <div className="h-8 w-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <FlaskConical className="h-4 w-4" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? "..." : stats.labReports ?? 0}
              </p>
              <Link
                href="/dashboard/tests"
                className="text-xs text-purple-600 font-semibold hover:underline mt-1 inline-block"
              >
                View test files →
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/90 shadow-xs hover:border-emerald-300 transition-all">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Health Passport</span>
                <div className="h-8 w-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <QrCode className="h-4 w-4" />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-xs font-mono font-bold text-slate-800 truncate bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                {stats.patientID || "PAT-ACTIVE"}
              </p>
              <Link
                href="/dashboard/profile"
                className="text-xs text-emerald-600 font-semibold hover:underline mt-1.5 inline-block"
              >
                Display QR code →
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {user.role === "doctor" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-slate-200/90 shadow-xs">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Today's Sessions</span>
                <Calendar className="h-4 w-4 text-teal-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-extrabold text-teal-700">
                {loading ? "..." : stats.todayAppointments ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Appointments scheduled for today</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/90 shadow-xs">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Pending Bookings</span>
                <Clock className="h-4 w-4 text-amber-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-extrabold text-amber-600">
                {loading ? "..." : stats.pendingAppointments ?? 0}
              </p>
              <Link
                href="/dashboard/appointments"
                className="text-xs text-amber-700 font-semibold hover:underline mt-1 inline-block"
              >
                Review requests →
              </Link>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/90 shadow-xs">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Consultations</span>
                <Activity className="h-4 w-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? "..." : stats.totalConsultations ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Clinical records created</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/90 shadow-xs">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Unique Patients</span>
                <UserCheck className="h-4 w-4 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? "..." : stats.totalPatients ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Total treated individuals</p>
            </CardContent>
          </Card>
        </div>
      )}

      {user.role === "lab" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="border border-slate-200/90 shadow-xs p-6">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Reports Issued</span>
                <FlaskConical className="h-5 w-5 text-teal-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <p className="text-4xl font-extrabold text-teal-700">
                {loading ? "..." : stats.totalUploaded ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Uploaded directly to patient vaults</p>
            </CardContent>
          </Card>

          <Card className="border border-teal-200 bg-teal-50/40 p-6 flex flex-col justify-center">
            <h3 className="font-bold text-teal-950 text-sm mb-1">Quick Action</h3>
            <p className="text-xs text-teal-700 mb-3">Upload and validate test results for patient record.</p>
            <Link href="/dashboard/tests">
              <Button size="sm" variant="gradient" className="text-xs w-fit">
                Open Lab Upload Portal
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {user.role === "pharmacy" && (
        <div className="grid gap-4 sm:grid-cols-3">
          <Card className="border border-slate-200/90 shadow-xs p-5">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Orders Fulfilled</span>
                <Pill className="h-4 w-4 text-teal-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <p className="text-3xl font-extrabold text-teal-700">
                {loading ? "..." : stats.totalIssues ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Prescription issues completed</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/90 shadow-xs p-5">
            <CardHeader className="p-0 pb-2">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Total Dispensed Revenue</span>
                <Receipt className="h-4 w-4 text-emerald-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 pt-2">
              <p className="text-3xl font-extrabold text-emerald-700">
                ₹{loading ? "..." : stats.totalRevenue ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Cumulative billing total</p>
            </CardContent>
          </Card>

          <Card className="border border-teal-200 bg-teal-50/40 p-5 flex flex-col justify-center">
            <h3 className="font-bold text-teal-950 text-sm mb-1">Dispense & Bill</h3>
            <p className="text-xs text-teal-700 mb-3">Lookup active doctor prescriptions for patient.</p>
            <Link href="/dashboard/pharmacy">
              <Button size="sm" variant="gradient" className="text-xs w-fit">
                Open Dispense Portal
              </Button>
            </Link>
          </Card>
        </div>
      )}

      {user.role === "admin" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border border-slate-200/90 shadow-xs">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Total Network Users</span>
                <UserCheck className="h-4 w-4 text-teal-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-extrabold text-slate-900">
                {loading ? "..." : stats.totalUsers ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-1">Patients, doctors, labs & pharmacies</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/90 shadow-xs">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Practitioners (Doctors)</span>
                <Stethoscope className="h-4 w-4 text-blue-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-extrabold text-blue-700">
                {loading ? "..." : stats.totalDoctors ?? 0}
              </p>
              <p className="text-xs text-blue-600 font-semibold mt-1">Clinical doctors registered</p>
            </CardContent>
          </Card>

          <Card className="border border-slate-200/90 shadow-xs">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Labs & Pharmacies</span>
                <FlaskConical className="h-4 w-4 text-purple-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-extrabold text-purple-700">
                {loading ? "..." : (stats.totalLabs ?? 0) + (stats.totalPharmacies ?? 0)}
              </p>
              <p className="text-xs text-purple-600 font-semibold mt-1">
                {stats.totalLabs ?? 0} Labs · {stats.totalPharmacies ?? 0} Pharmacies
              </p>
            </CardContent>
          </Card>

          <Card className="border border-rose-200 bg-rose-50/50 shadow-xs">
            <CardHeader className="pb-2 p-5">
              <CardTitle className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center justify-between">
                <span>Malpractice Blocks</span>
                <ShieldCheck className="h-4 w-4 text-rose-600" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0">
              <p className="text-3xl font-extrabold text-rose-900">
                {loading ? "..." : stats.totalBlocked ?? 0}
              </p>
              <Link
                href="/dashboard/admin"
                className="text-xs text-rose-700 font-semibold hover:underline mt-1 inline-block"
              >
                Inspect compliance queue →
              </Link>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="pt-2">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Quick Access
        </h2>
        <div className="grid gap-3.5 sm:grid-cols-3">
          <Link href="/dashboard/profile" className="block">
            <Card className="p-4 border border-slate-200/80 hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer h-full">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Profile & Health ID</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Manage details and QR code</p>
                </div>
              </div>
            </Card>
          </Link>

          {(user.role === "doctor" || user.role === "patient") && (
            <Link href="/dashboard/appointments" className="block">
              <Card className="p-4 border border-slate-200/80 hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer h-full">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Appointments</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">View and update calendar</p>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {(user.role === "doctor" || user.role === "lab" || user.role === "pharmacy") && (
            <Link href="/dashboard/scan" className="block">
              <Card className="p-4 border border-slate-200/80 hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer h-full">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0">
                    <QrCode className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Scan Patient QR</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Fast OTP-secured access</p>
                  </div>
                </div>
              </Card>
            </Link>
          )}

          {user.role === "patient" && (
            <Link href="/dashboard/history" className="block">
              <Card className="p-4 border border-slate-200/80 hover:border-teal-400 hover:shadow-xs transition-all cursor-pointer h-full">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">Medical History</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">Allergies & conditions</p>
                  </div>
                </div>
              </Card>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
