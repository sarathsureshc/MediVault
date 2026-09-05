"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  PlusCircle,
  FileText,
  Pill,
  FlaskConical,
  CheckCircle2,
  ArrowLeft,
  User,
  ShieldAlert,
  HeartPulse,
  Trash2,
  X,
  Stethoscope,
} from "lucide-react";

export default function PatientDetailsPage() {
  const params = useParams();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [consultations, setConsultations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // New Consultation Form State
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [medicines, setMedicines] = useState<
    { medicine: string; dosage: string; duration: string }[]
  >([{ medicine: "", dosage: "", duration: "" }]);
  const [recommendedTests, setRecommendedTests] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [submitError, setSubmitError] = useState("");

  const fetchHistoryAndConsultations = async () => {
    try {
      setLoading(true);
      const [historyRes, consultRes] = await Promise.allSettled([
        api.get(`/doctors/patients/${params.id}/history`),
        api.get(`/consultations/${params.id}`),
      ]);

      if (historyRes.status === "fulfilled") {
        setData(historyRes.value.data.data);
      } else {
        setError(
          historyRes.reason?.response?.data?.message || "Failed to fetch patient history"
        );
      }

      if (consultRes.status === "fulfilled") {
        setConsultations(consultRes.value.data.data?.consultations || []);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchHistoryAndConsultations();
    }
  }, [params.id]);

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { medicine: "", dosage: "", duration: "" }]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (
    index: number,
    field: "medicine" | "dosage" | "duration",
    val: string
  ) => {
    const updated = [...medicines];
    updated[index][field] = val;
    setMedicines(updated);
  };

  const handleConsultationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const validPrescriptions = medicines.filter(
        (m) => m.medicine.trim() !== ""
      );

      const testsArray = recommendedTests
        ? recommendedTests.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      await api.post("/consultations", {
        patientId: params.id,
        diagnosis,
        notes,
        prescription: validPrescriptions,
        recommendedTests: testsArray,
      });

      setSubmitSuccess("Consultation & Prescription recorded successfully!");
      setShowConsultModal(false);
      setDiagnosis("");
      setNotes("");
      setMedicines([{ medicine: "", dosage: "", duration: "" }]);
      setRecommendedTests("");

      fetchHistoryAndConsultations();
    } catch (err: any) {
      setSubmitError(
        err.response?.data?.message || "Failed to save consultation record"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-6 text-slate-500 text-xs text-center">Loading patient records...</div>;
  if (error) return <div className="p-6 text-rose-500 text-xs font-semibold text-center">{error}</div>;
  if (!data) return <div className="p-6 text-slate-400 text-xs text-center">Patient file not found</div>;

  const { patient, history } = data;

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 font-sans">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-teal-500/20">
            {patient.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight flex items-center gap-2">
              <span>{patient.name}</span>
              <span className="text-[11px] font-bold font-mono bg-teal-50 text-teal-700 px-2 py-0.5 rounded-md border border-teal-100">
                {patient.id}
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Age: <strong className="text-slate-700">{patient.age}</strong> • Gender: <strong className="text-slate-700 capitalize">{patient.gender}</strong> • Blood Group: <strong className="text-teal-700 font-bold">{patient.bloodGroup || "N/A"}</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {user?.role === "doctor" && (
            <Button
              variant="gradient"
              onClick={() => setShowConsultModal(true)}
              className="flex items-center gap-1.5 shadow-md shadow-teal-500/20"
            >
              <PlusCircle className="h-4 w-4" /> New Consultation
            </Button>
          )}
          <Button variant="outline" onClick={() => window.history.back()} className="flex items-center gap-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        </div>
      </div>

      {submitSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          {submitSuccess}
        </div>
      )}

      {/* Medical History Cards */}
      <div>
        <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
          <HeartPulse className="h-4 w-4 text-teal-600" /> Clinical History & Alerts
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="border-rose-100 bg-rose-50/40">
            <CardHeader className="p-3.5 pb-2">
              <CardTitle className="text-xs font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="h-3.5 w-3.5 text-rose-600" /> Allergies
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              {history?.allergies?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {history.allergies.map((item: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded text-[11px] font-semibold">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No known allergies</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-amber-100 bg-amber-50/40">
            <CardHeader className="p-3.5 pb-2">
              <CardTitle className="text-xs font-bold text-amber-700 uppercase tracking-wider">
                Chronic Diseases
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              {history?.chronicDiseases?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {history.chronicDiseases.map((item: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-[11px] font-semibold">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No chronic conditions</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-blue-100 bg-blue-50/40">
            <CardHeader className="p-3.5 pb-2">
              <CardTitle className="text-xs font-bold text-blue-700 uppercase tracking-wider">
                Past Surgeries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 pt-0">
              {history?.pastSurgeries?.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {history.pastSurgeries.map((item: string, i: number) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-[11px] font-semibold">
                      {item}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">No past surgeries</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Past Consultations */}
      <div className="space-y-3 pt-2">
        <h2 className="text-base font-bold text-slate-900 flex items-center justify-between">
          <span>Past Consultations & Prescriptions</span>
          <span className="text-xs font-normal text-slate-500">{consultations.length} records</span>
        </h2>

        {consultations.length > 0 ? (
          <div className="space-y-3.5">
            {consultations.map((c) => (
              <Card key={c._id} className="border border-slate-200/90 shadow-xs overflow-hidden">
                <CardHeader className="bg-slate-50/70 py-3 px-5 border-b border-slate-100 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Stethoscope className="h-4 w-4 text-teal-600" />
                    <span className="font-semibold text-slate-800 text-sm">
                      Dr. {c.doctor?.fullName} ({c.doctor?.specialization})
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {new Date(c.date || c.createdAt).toLocaleDateString()}
                  </span>
                </CardHeader>
                <CardContent className="p-5 space-y-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 uppercase text-[10px] block mb-0.5">
                      Diagnosis:
                    </span>
                    <span className="text-sm font-semibold text-slate-900">{c.diagnosis}</span>
                  </div>

                  {c.prescription && c.prescription.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1.5 flex items-center gap-1">
                        <Pill className="h-3.5 w-3.5 text-teal-600" /> Prescribed Medications:
                      </span>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {c.prescription.map((rx: any, idx: number) => (
                          <div key={idx} className="p-2.5 bg-teal-50/70 border border-teal-100 rounded-xl">
                            <strong className="text-teal-950 block text-xs">{rx.medicine}</strong>
                            <span className="text-[11px] text-teal-700 font-medium">
                              Dosage: {rx.dosage} • Duration: {rx.duration}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {c.recommendedTests && c.recommendedTests.length > 0 && (
                    <div>
                      <span className="font-bold text-slate-500 uppercase text-[10px] block mb-1.5 flex items-center gap-1">
                        <FlaskConical className="h-3.5 w-3.5 text-purple-600" /> Recommended Tests:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {c.recommendedTests.map((t: string, idx: number) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {c.notes && (
                    <div className="p-2.5 bg-slate-50 rounded-xl border text-slate-600 italic">
                      Notes: {c.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-xs">
            No consultations recorded yet for this patient.
          </div>
        )}
      </div>

      {/* New Consultation Modal */}
      {showConsultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 bg-white p-0">
            <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-teal-600" /> Record Consultation & Prescription
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Enter clinical impression and medications for {patient.name}
                </CardDescription>
              </div>
              <button
                onClick={() => setShowConsultModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </CardHeader>
            <CardContent className="p-5 pt-4 space-y-4">
              {submitError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleConsultationSubmit} className="space-y-4">
                <Input
                  label="Diagnosis / Clinical Impression *"
                  placeholder="e.g. Acute Bronchitis, Type 2 Diabetes Follow-up"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  required
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                      <Pill className="h-3.5 w-3.5 text-teal-600" /> Prescribed Medications
                    </label>
                    <button
                      type="button"
                      onClick={handleAddMedicineRow}
                      className="text-xs text-teal-600 hover:underline font-semibold cursor-pointer"
                    >
                      + Add Medicine
                    </button>
                  </div>

                  <div className="space-y-2">
                    {medicines.map((med, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-5">
                          <Input
                            placeholder="Medicine Name (e.g. Amoxicillin 500mg)"
                            value={med.medicine}
                            onChange={(e) => handleMedicineChange(index, "medicine", e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Dosage (1-0-1)"
                            value={med.dosage}
                            onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                          />
                        </div>
                        <div className="col-span-3">
                          <Input
                            placeholder="Duration (5 days)"
                            value={med.duration}
                            onChange={(e) => handleMedicineChange(index, "duration", e.target.value)}
                          />
                        </div>
                        <div className="col-span-1 text-center">
                          {medicines.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMedicineRow(index)}
                              className="text-rose-400 hover:text-rose-600 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Input
                  label="Recommended Diagnostic Tests (comma-separated)"
                  placeholder="e.g. CBC, Lipid Profile, Chest X-Ray"
                  value={recommendedTests}
                  onChange={(e) => setRecommendedTests(e.target.value)}
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                    Doctor's Advice & Clinical Notes
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Dietary instructions, precautions, or review schedule..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowConsultModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? "Saving..." : "Save Consultation Record"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
