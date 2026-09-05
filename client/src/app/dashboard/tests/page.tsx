"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FlaskConical, PlusCircle, CheckCircle, FileText, ExternalLink, Clock, Building, CheckCircle2 } from "lucide-react";

export default function LabTestsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recommendedTests, setRecommendedTests] = useState<any[]>([]);
  const [completedResults, setCompletedResults] = useState<any[]>([]);

  // Lab upload form state
  const [patientId, setPatientId] = useState("");
  const [testName, setTestName] = useState("");
  const [resultValue, setResultValue] = useState("");
  const [reportUrl, setReportUrl] = useState("");
  const [comments, setComments] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");

  // Lab Upload History
  const [labHistory, setLabHistory] = useState<any[]>([]);

  const fetchPatientLabData = async () => {
    try {
      setLoading(true);
      if (user?.role === "patient") {
        const profileRes = await api.get("/patients/profile");
        const pId = profileRes.data.data?.patient?.patientID;
        if (pId) {
          const [consultRes, testRes] = await Promise.allSettled([
            api.get(`/consultations/${pId}`),
            api.get(`/labs/patient/${pId}`),
          ]);

          if (consultRes.status === "fulfilled") {
            const consults = consultRes.value.data.data?.consultations || [];
            const tests: any[] = [];
            consults.forEach((c: any) => {
              if (c.recommendedTests && c.recommendedTests.length > 0) {
                c.recommendedTests.forEach((t: string) => {
                  tests.push({
                    testName: t,
                    doctor: c.doctor?.fullName,
                    specialization: c.doctor?.specialization,
                    date: c.date || c.createdAt,
                  });
                });
              }
            });
            setRecommendedTests(tests);
          }

          if (testRes.status === "fulfilled") {
            setCompletedResults(testRes.value.data.data?.results || []);
          }
        }
      } else if (user?.role === "lab") {
        const historyRes = await api.get("/labs/history");
        setLabHistory(historyRes.data.data?.results || []);
      }
    } catch (err) {
      console.error("Failed to load lab data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPatientLabData();
    }
  }, [user]);

  const handleUploadTest = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    setUploadSuccess("");
    setUploadError("");

    try {
      await api.post("/labs/upload", {
        patientId,
        testName,
        resultValue,
        reportUrl,
        comments,
      });

      setUploadSuccess("Test report uploaded successfully!");
      setPatientId("");
      setTestName("");
      setResultValue("");
      setReportUrl("");
      setComments("");
      fetchPatientLabData();
    } catch (err: any) {
      setUploadError(err.response?.data?.message || "Failed to upload test result");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-400">Loading diagnostic test data...</div>;
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          {user?.role === "lab" ? "Diagnostic Center Portal" : "Diagnostic & Lab Reports"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {user?.role === "lab"
            ? "Upload digital test records with PDF attachments directly to verified patient vaults"
            : "Review clinical investigation requests and access verified laboratory test results"}
        </p>
      </div>

      {/* Lab Staff View */}
      {user?.role === "lab" && (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <Card className="border border-slate-200/90 shadow-xs">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <PlusCircle className="h-4 w-4 text-teal-600" /> Upload Diagnostic Report
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  Publish validated lab values to the patient's digital vault
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                {uploadSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    {uploadSuccess}
                  </div>
                )}
                {uploadError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                    {uploadError}
                  </div>
                )}

                <form onSubmit={handleUploadTest} className="space-y-3.5">
                  <Input
                    label="Patient Unique ID *"
                    placeholder="e.g. PAT-1725281940"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    required
                  />

                  <Input
                    label="Test Name / Panel *"
                    placeholder="e.g. Complete Blood Count (CBC)"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    required
                  />

                  <Input
                    label="Result Value / Clinical Summary *"
                    placeholder="e.g. Hemoglobin: 14.2 g/dL (Normal)"
                    value={resultValue}
                    onChange={(e) => setResultValue(e.target.value)}
                    required
                  />

                  <Input
                    label="Document / PDF Report URL"
                    placeholder="e.g. https://reports.lab.com/file.pdf"
                    value={reportUrl}
                    onChange={(e) => setReportUrl(e.target.value)}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-1">
                      Technician Remarks / Observations
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Notes on calibration, flags, or biological reference interval..."
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    className="w-full mt-2"
                    disabled={uploading}
                  >
                    {uploading ? "Publishing Report..." : "Publish Report to Patient Vault"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-6">
            <Card className="border border-slate-200/90 shadow-xs h-full">
              <CardHeader className="pb-3 border-b border-slate-100">
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-teal-600" /> Recent Center Uploads ({labHistory.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {labHistory.length > 0 ? (
                  <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
                    {labHistory.map((item) => (
                      <div
                        key={item._id}
                        className="p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between font-bold text-slate-900">
                          <span>{item.testName}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {new Date(item.testDate || item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-600">
                          Patient: <strong className="text-slate-800">{item.patient?.fullName || "Patient"}</strong>
                        </p>
                        <p className="text-teal-700 font-semibold">{item.resultValue}</p>
                        {item.reportUrl && (
                          <a
                            href={item.reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline pt-0.5"
                          >
                            <ExternalLink className="h-3 w-3" /> View Attachment
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic py-8 text-center">No reports uploaded yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Patient View: Completed Reports + Recommended Tests */}
      {user?.role === "patient" && (
        <div className="space-y-6">
          {/* Completed Reports */}
          <div className="space-y-3">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-600" /> Verified Diagnostic Reports ({completedResults.length})
            </h2>

            {completedResults.length > 0 ? (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {completedResults.map((result) => (
                  <Card key={result._id} className="border-emerald-200/80 bg-gradient-to-b from-emerald-50/30 to-white shadow-xs">
                    <CardHeader className="pb-2 border-b border-emerald-100 p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-sm font-bold text-slate-900">{result.testName}</CardTitle>
                          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                            <Building className="h-3 w-3" /> {result.lab?.labName || "Diagnostic Center"}
                          </p>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Validated
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-3 space-y-2 text-xs">
                      <div className="p-2.5 bg-white rounded-xl border border-emerald-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Result:</span>
                        <span className="text-sm font-bold text-slate-900">{result.resultValue}</span>
                      </div>

                      {result.comments && (
                        <p className="text-slate-600 italic text-[11px]">
                          <strong>Remarks:</strong> {result.comments}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span>{new Date(result.testDate || result.createdAt).toLocaleDateString()}</span>
                        {result.reportUrl && (
                          <a
                            href={result.reportUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700 hover:underline"
                          >
                            <ExternalLink className="h-3 w-3" /> Open Document
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border border-dashed border-slate-200 bg-slate-50/50">
                <CardContent className="py-8 text-center text-xs text-slate-400">
                  No completed lab test reports yet on file.
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recommended Tests */}
          <div className="space-y-3 pt-2">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-purple-600" /> Tests Recommended by Clinicians ({recommendedTests.length})
            </h2>

            {recommendedTests.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {recommendedTests.map((t, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl border border-purple-200/80 bg-purple-50/40 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <h4 className="font-bold text-purple-950 text-sm">{t.testName}</h4>
                      <p className="text-purple-700 mt-0.5">
                        Advised by Dr. {t.doctor} • {t.specialization}
                      </p>
                    </div>
                    <span className="text-[10px] text-purple-500 bg-white px-2.5 py-1 rounded-full border border-purple-100 flex-shrink-0">
                      {new Date(t.date).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border border-dashed border-slate-200 bg-slate-50/50">
                <CardContent className="py-8 text-center text-xs text-slate-400">
                  No pending lab tests recommended by your doctors.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
