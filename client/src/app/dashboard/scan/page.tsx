"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { QrCode, Search, ShieldCheck, KeyRound, ArrowRight, UserCheck, CheckCircle2 } from "lucide-react";

export default function ScanPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"manual" | "scan">("manual");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [manualPatientId, setManualPatientId] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [verifyingPatient, setVerifyingPatient] = useState(false);

  useEffect(() => {
    if (mode !== "scan") return;

    if (!document.getElementById("reader")) {
      return;
    }

    let scanner: Html5QrcodeScanner | null = null;

    try {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(onScanSuccess, onScanFailure);
    } catch (err) {
      console.error("Failed to initialize scanner:", err);
    }

    function onScanSuccess(decodedText: string) {
      setScanResult(decodedText);
      if (scanner) {
        scanner.clear().catch(console.error);
      }
      verifyPatient(decodedText);
    }

    function onScanFailure() {
      // Ignore continuous frame failures
    }

    return () => {
      if (scanner) {
        scanner.clear().catch((error) => {
          console.error("Failed to clear html5-qrcode scanner: ", error);
        });
      }
    };
  }, [mode]);

  const verifyPatient = async (qrData: string) => {
    try {
      setError("");
      setVerifyingPatient(true);
      const res = await api.post("/doctors/verify-patient", {
        qrCodeData: qrData,
      });
      setVerificationResult(res.data.data);
      setShowOtpInput(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Patient not found or verification failed");
    } finally {
      setVerifyingPatient(false);
    }
  };

  const handleManualVerify = async () => {
    if (!manualPatientId.trim()) {
      setError("Please enter a valid Patient ID");
      return;
    }
    await verifyPatient(manualPatientId.trim());
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      setError("Please enter the 6-digit OTP code");
      return;
    }
    setVerifyingOtp(true);
    setError("");
    try {
      await api.post("/doctors/verify-otp", {
        patientId: verificationResult.patientId,
        otp,
      });
      router.push(`/dashboard/patient/${verificationResult.patientId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP code");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleModeChange = (newMode: "scan" | "manual") => {
    setMode(newMode);
    setError("");
    setScanResult(null);
    setManualPatientId("");
    setVerificationResult(null);
    setShowOtpInput(false);
    setOtp("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 font-sans">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Patient Authentication & Access
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Scan the patient's Health Passport QR code or enter ID for consent-verified medical records access
        </p>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/70 rounded-xl w-fit">
        <button
          onClick={() => handleModeChange("manual")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mode === "manual"
              ? "bg-white text-teal-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <Search className="h-3.5 w-3.5" /> Manual Patient ID
        </button>
        <button
          onClick={() => handleModeChange("scan")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            mode === "scan"
              ? "bg-white text-teal-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <QrCode className="h-3.5 w-3.5" /> Live Camera Scanner
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Card: Input or Scanner */}
        <Card className="border border-slate-200/90 shadow-xs">
          <CardHeader className="pb-3 border-b border-slate-100">
            <CardTitle className="text-base flex items-center gap-2">
              {mode === "scan" ? (
                <>
                  <QrCode className="h-4 w-4 text-teal-600" /> Camera Viewport
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 text-teal-600" /> Patient Identification
                </>
              )}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              {mode === "scan"
                ? "Align the QR code within the scanner box"
                : "Enter the unique PAT- ID from patient's card"}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            {mode === "manual" ? (
              <div className="space-y-4">
                <Input
                  label="Patient Unique ID *"
                  type="text"
                  placeholder="e.g. PAT-1725281940"
                  value={manualPatientId}
                  onChange={(e) => setManualPatientId(e.target.value)}
                  disabled={showOtpInput}
                />
                <Button
                  variant="gradient"
                  className="w-full"
                  onClick={handleManualVerify}
                  disabled={verifyingPatient || showOtpInput}
                >
                  {verifyingPatient ? "Locating Patient..." : "Lookup Patient & Send OTP"}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {!showOtpInput && (
                  <div
                    id="reader"
                    className="w-full rounded-2xl overflow-hidden border-2 border-dashed border-teal-300 p-2 bg-slate-50"
                  />
                )}
                {scanResult && (
                  <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-teal-900">Scanned Payload:</p>
                    <p className="font-mono text-teal-700 break-all">{scanResult}</p>
                  </div>
                )}
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Card: Patient Found & OTP Form */}
        {verificationResult ? (
          <Card className="border border-teal-200 shadow-md bg-gradient-to-b from-teal-50/30 to-white">
            <CardHeader className="pb-3 border-b border-teal-100">
              <CardTitle className="text-base text-teal-950 flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-teal-600" /> Patient Located
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="p-3.5 bg-white rounded-xl border border-teal-100 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Patient Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{verificationResult.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Patient ID:</span>
                  <span className="font-mono font-semibold text-teal-700">{verificationResult.patientId}</span>
                </div>
              </div>

              {verificationResult.devOtp && (
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] font-mono text-amber-900">
                  ⚡ DEV OTP: <span className="font-bold text-amber-700">{verificationResult.devOtp}</span>
                </div>
              )}

              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <span>6-digit OTP code sent to patient's registered email address.</span>
              </div>

              {showOtpInput && (
                <div className="space-y-3 pt-2">
                  <Input
                    label="Enter 6-Digit Patient Consent OTP *"
                    type="text"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    className="text-center text-lg font-mono font-bold tracking-widest"
                  />
                  <Button
                    variant="gradient"
                    className="w-full"
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp || otp.length !== 6}
                  >
                    {verifyingOtp ? "Verifying Access..." : "Verify OTP & Access Records"}
                    {!verifyingOtp && <ArrowRight className="h-4 w-4 ml-1" />}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-slate-200/80 bg-slate-50/50 flex flex-col items-center justify-center text-center p-8">
            <ShieldCheck className="h-12 w-12 text-slate-300 mb-3" />
            <h3 className="text-sm font-semibold text-slate-700">Awaiting Verification</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs leading-relaxed">
              Scan or enter patient ID to initiate the HIPAA-compliant OTP authorization handshake.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
