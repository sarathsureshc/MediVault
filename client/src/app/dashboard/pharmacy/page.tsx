"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Pill, Search, CheckCircle, Receipt, PlusCircle, Trash2, Clock, UserCheck, CheckCircle2 } from "lucide-react";

interface MedicineItem {
  name: string;
  quantity: number;
  price: number;
}

export default function PharmacyPage() {
  const { user } = useAuth();
  const [patientId, setPatientId] = useState("");
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientData, setPatientData] = useState<any>(null);
  const [searchError, setSearchError] = useState("");

  // Medicine Issue Form
  const [doctorId, setDoctorId] = useState<string>("");
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    { name: "", quantity: 1, price: 0 },
  ]);
  const [billUrl, setBillUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState("");
  const [issueError, setIssueError] = useState("");

  // Pharmacy History
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await api.get("/pharmacies/history");
      setHistory(res.data.data?.issues || []);
    } catch (err) {
      console.error("Failed to fetch pharmacy history", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (user?.role === "pharmacy") {
      fetchHistory();
    }
  }, [user]);

  const handleSearchPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientId.trim()) return;

    setLoadingPatient(true);
    setSearchError("");
    setPatientData(null);
    setIssueSuccess("");
    setIssueError("");

    try {
      const res = await api.get(`/pharmacies/patient/${patientId.trim()}`);
      setPatientData(res.data.data);

      const consultations = res.data.data?.consultations || [];
      if (consultations.length > 0) {
        const latestWithRx = consultations.find(
          (c: any) => c.prescription && c.prescription.length > 0
        );
        if (latestWithRx) {
          setDoctorId(latestWithRx.doctor?._id || "");
          const prefilled = latestWithRx.prescription.map((p: any) => ({
            name: p.medicine,
            quantity: 1,
            price: 50,
          }));
          if (prefilled.length > 0) {
            setMedicines(prefilled);
          }
        }
      }
    } catch (err: any) {
      setSearchError(err.response?.data?.message || "Patient not found");
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleAddMedicineRow = () => {
    setMedicines([...medicines, { name: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveMedicineRow = (index: number) => {
    setMedicines(medicines.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (
    index: number,
    field: keyof MedicineItem,
    val: string | number
  ) => {
    const updated = [...medicines];
    updated[index] = {
      ...updated[index],
      [field]: field === "name" ? val : Number(val) || 0,
    };
    setMedicines(updated);
  };

  const calculateTotal = () => {
    return medicines.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientData?.patient?.patientID) return;

    const validMedicines = medicines.filter((m) => m.name.trim() !== "");
    if (validMedicines.length === 0) {
      setIssueError("Please add at least one medication to dispense.");
      return;
    }

    setSubmitting(true);
    setIssueError("");
    setIssueSuccess("");

    try {
      const totalAmount = calculateTotal();
      await api.post("/pharmacies/issue", {
        patientId: patientData.patient.patientID,
        doctorId: doctorId || undefined,
        medicines: validMedicines,
        totalAmount,
        billUrl: billUrl.trim() || undefined,
      });

      setIssueSuccess(`Successfully dispensed medicines! Total Billed: ₹${totalAmount}`);
      setMedicines([{ name: "", quantity: 1, price: 0 }]);
      setBillUrl("");
      setPatientData(null);
      setPatientId("");

      fetchHistory();
    } catch (err: any) {
      setIssueError(err.response?.data?.message || "Failed to dispense medications");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Pharmacy Dispense & Invoicing
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Lookup verified prescriptions, fulfill orders, and generate digital medication billing
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Search & Dispense */}
        <div className="lg:col-span-7 space-y-5">
          {/* Patient Search Card */}
          <Card className="border border-slate-200/90 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Search className="h-4 w-4 text-teal-600" /> Patient Prescription Lookup
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3">
              <form onSubmit={handleSearchPatient} className="flex gap-2">
                <Input
                  placeholder="Enter Patient ID (e.g. PAT-1725281940)"
                  value={patientId}
                  onChange={(e) => setPatientId(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" variant="gradient" disabled={loadingPatient} className="flex-shrink-0">
                  {loadingPatient ? "Searching..." : "Lookup"}
                </Button>
              </form>

              {searchError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                  {searchError}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Patient Details & Active Rx Preview */}
          {patientData && (
            <Card className="border border-teal-200 shadow-sm bg-gradient-to-b from-teal-50/40 to-white">
              <CardHeader className="pb-3 border-b border-teal-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-teal-600" />
                    <div>
                      <CardTitle className="text-sm font-bold text-teal-950">
                        {patientData.patient?.fullName}
                      </CardTitle>
                      <p className="text-[11px] text-teal-700 font-mono">
                        {patientData.patient?.patientID}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                    Verified
                  </span>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* Form to Dispense */}
                <form onSubmit={handleIssueSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1">
                        <Pill className="h-3.5 w-3.5 text-teal-600" /> Medication Dispense List
                      </label>
                      <button
                        type="button"
                        onClick={handleAddMedicineRow}
                        className="text-xs text-teal-600 hover:underline font-semibold cursor-pointer"
                      >
                        + Add Row
                      </button>
                    </div>

                    <div className="space-y-2">
                      {medicines.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6">
                            <Input
                              placeholder="Medicine Name"
                              value={item.name}
                              onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                            />
                          </div>
                          <div className="col-span-2">
                            <Input
                              type="number"
                              min="1"
                              placeholder="Qty"
                              value={item.quantity}
                              onChange={(e) => handleMedicineChange(index, "quantity", e.target.value)}
                            />
                          </div>
                          <div className="col-span-3">
                            <Input
                              type="number"
                              min="0"
                              placeholder="₹ Price"
                              value={item.price}
                              onChange={(e) => handleMedicineChange(index, "price", e.target.value)}
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

                  <div className="flex items-center justify-between p-3.5 bg-slate-100/80 rounded-xl">
                    <span className="text-xs font-bold text-slate-700 uppercase">Calculated Total</span>
                    <span className="text-lg font-extrabold text-teal-800">₹{calculateTotal()}</span>
                  </div>

                  <Input
                    label="Digital Bill / Receipt Link (Optional)"
                    placeholder="https://billing.pharmacy.com/inv-1002.pdf"
                    value={billUrl}
                    onChange={(e) => setBillUrl(e.target.value)}
                  />

                  {issueError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                      {issueError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full"
                    disabled={submitting}
                  >
                    {submitting ? "Processing Billing..." : `Fulfill & Issue Bill (₹${calculateTotal()})`}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {issueSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
              {issueSuccess}
            </div>
          )}
        </div>

        {/* Right Column: Recent Dispense History */}
        <div className="lg:col-span-5">
          <Card className="border border-slate-200/90 shadow-xs h-full">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Receipt className="h-4 w-4 text-teal-600" /> Recent Dispense Logs ({history.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {loadingHistory ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading history...</div>
              ) : history.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {history.map((record) => (
                    <div
                      key={record._id}
                      className="p-3.5 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="text-slate-900">{record.patient?.fullName || "Patient"}</span>
                        <span className="text-teal-700 font-extrabold bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                          ₹{record.totalAmount}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {new Date(record.issueDate || record.createdAt).toLocaleString()}
                      </p>
                      {record.medicines && record.medicines.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {record.medicines.map((m: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 rounded text-[10px] font-medium"
                            >
                              {m.name} (x{m.quantity})
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic py-8 text-center">No dispense records yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
