"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Pill, Calendar, Stethoscope, Clock, ShieldCheck, FileText } from "lucide-react";

export default function PrescriptionsPage() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [patientId, setPatientId] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientAndPrescriptions = async () => {
      try {
        setLoading(true);
        if (user?.role === "patient") {
          const profileRes = await api.get("/patients/profile");
          const pId = profileRes.data.data?.patient?.patientID;
          setPatientId(pId);

          if (pId) {
            const consultRes = await api.get(`/consultations/${pId}`);
            setConsultations(consultRes.data.data?.consultations || []);
          }
        }
      } catch (err) {
        console.error("Failed to load prescriptions", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchPatientAndPrescriptions();
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading prescriptions...</div>;
  }

  const consultationsWithRx = consultations.filter(
    (c) => c.prescription && c.prescription.length > 0
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Prescriptions & Regimens
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Access all active digital medication schedules prescribed by your doctors
        </p>
      </div>

      {consultationsWithRx.length > 0 ? (
        <div className="space-y-4">
          {consultationsWithRx.map((consult) => (
            <Card key={consult._id} className="overflow-hidden border border-slate-200/90 shadow-xs">
              <CardHeader className="bg-slate-50/70 border-b border-slate-100 p-4 sm:p-5 pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="h-9 w-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center flex-shrink-0">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold text-slate-900">
                        Dr. {consult.doctor?.fullName || "Doctor"}
                      </CardTitle>
                      <p className="text-[11px] text-slate-500">
                        {consult.doctor?.specialization} • {consult.doctor?.hospitalClinicName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 self-start sm:self-auto">
                    <Calendar className="h-3.5 w-3.5 text-teal-600" />
                    <span>{new Date(consult.date || consult.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5 space-y-4">
                {consult.diagnosis && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs">
                    <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">Clinical Diagnosis</span>
                    <span className="font-semibold text-slate-900">{consult.diagnosis}</span>
                  </div>
                )}

                <div>
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                    <Pill className="h-4 w-4 text-teal-600" /> Prescribed Medications
                  </h4>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {consult.prescription.map((rx: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 bg-teal-50/60 border border-teal-100/80 rounded-xl flex flex-col justify-between"
                      >
                        <p className="font-bold text-teal-950 text-xs">{rx.medicine}</p>
                        <div className="flex items-center justify-between text-[11px] text-teal-800 font-medium mt-2 pt-2 border-t border-teal-100">
                          <span>Dosage: <strong className="font-bold">{rx.dosage}</strong></span>
                          <span>Duration: <strong className="font-bold">{rx.duration}</strong></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {consult.notes && (
                  <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <strong className="text-slate-800">Doctor's Advice: </strong>
                    <span className="italic">{consult.notes}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-dashed border-slate-200 bg-slate-50/50">
          <CardContent className="py-12 text-center space-y-2">
            <Pill className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No Prescriptions on Record</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Prescribed medications from completed medical consultations will appear in this digital health log.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
