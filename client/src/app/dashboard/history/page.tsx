"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { FileText, ShieldAlert, HeartPulse, Activity, Edit3, ArrowRight } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get("/patients/history");
        setHistory(res.data.data?.history || {});
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === "patient") {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) return <div className="p-8 text-center text-xs text-slate-400">Loading medical records...</div>;

  if (user?.role !== "patient") {
    return (
      <div className="p-8 text-center text-xs text-slate-500">
        Only patients can access their personal history overview. Clinicians should use the Patient Search / QR scan.
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Medical History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Overview of your recorded allergies, chronic conditions, and surgical history
          </p>
        </div>

        <Link href="/dashboard/profile">
          <Button variant="outline" className="flex items-center gap-1.5 text-xs">
            <Edit3 className="h-3.5 w-3.5 text-teal-600" /> Update in Profile
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {/* Allergies */}
        <Card className="border-rose-200/80 bg-gradient-to-b from-rose-50/40 to-white shadow-xs">
          <CardHeader className="pb-3 border-b border-rose-100">
            <CardTitle className="text-sm font-bold text-rose-800 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-rose-600" /> Known Allergies
            </CardTitle>
            <CardDescription className="text-[11px] text-rose-600/80">
              Drugs, food, and environmental triggers
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {history?.allergies?.length > 0 ? (
              <div className="space-y-2">
                {history.allergies.map((item: string, i: number) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-rose-100 text-xs font-semibold text-rose-900 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">No allergies recorded.</p>
            )}
          </CardContent>
        </Card>

        {/* Chronic Diseases */}
        <Card className="border-amber-200/80 bg-gradient-to-b from-amber-50/40 to-white shadow-xs">
          <CardHeader className="pb-3 border-b border-amber-100">
            <CardTitle className="text-sm font-bold text-amber-800 flex items-center gap-1.5">
              <HeartPulse className="h-4 w-4 text-amber-600" /> Chronic Diseases
            </CardTitle>
            <CardDescription className="text-[11px] text-amber-600/80">
              Long-term diagnosed medical conditions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {history?.chronicDiseases?.length > 0 ? (
              <div className="space-y-2">
                {history.chronicDiseases.map((item: string, i: number) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-amber-100 text-xs font-semibold text-amber-900 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">No chronic conditions recorded.</p>
            )}
          </CardContent>
        </Card>

        {/* Past Surgeries */}
        <Card className="border-blue-200/80 bg-gradient-to-b from-blue-50/40 to-white shadow-xs">
          <CardHeader className="pb-3 border-b border-blue-100">
            <CardTitle className="text-sm font-bold text-blue-800 flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-blue-600" /> Past Surgeries
            </CardTitle>
            <CardDescription className="text-[11px] text-blue-600/80">
              Surgical procedures & interventions
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {history?.pastSurgeries?.length > 0 ? (
              <div className="space-y-2">
                {history.pastSurgeries.map((item: string, i: number) => (
                  <div key={i} className="p-2 bg-white rounded-lg border border-blue-100 text-xs font-semibold text-blue-900 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                    {item}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-4 text-center">No past surgeries recorded.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Link Card */}
      <Card className="border border-teal-100 bg-teal-50/40 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-teal-900">Looking for your prescribed medications?</h3>
            <p className="text-xs text-teal-700 mt-0.5">View all prescriptions issued during medical consultations.</p>
          </div>
          <Link href="/dashboard/prescriptions">
            <Button size="sm" variant="gradient" className="text-xs">
              Open Prescriptions <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
