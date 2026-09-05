"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Mail,
  Phone,
  KeyRound,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function ForgotPasswordPage() {
  const router = useRouter();

  // Mode: "email" | "phone"
  const [method, setMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Flow Step: 1 = Request OTP, 2 = Verify OTP & Reset
  const [step, setStep] = useState<1 | 2>(1);

  // Step 2 Form State
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [targetIdentifier, setTargetIdentifier] = useState("");

  // 1. Send OTP Handler
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");
    setDevOtp(null);

    const activeIdentifier = method === "email" ? email.trim() : phone.trim();

    if (!activeIdentifier) {
      setError(
        method === "email"
          ? "Please enter your registered email address."
          : "Please enter your registered mobile phone number."
      );
      return;
    }

    setIsLoading(true);
    try {
      const payload = method === "email" ? { email: activeIdentifier } : { phone: activeIdentifier };
      const res = await api.post("/auth/forgot-password/send-otp", payload);

      setSuccessMsg(res.data.message || `OTP sent to your registered ${method}.`);
      setTargetIdentifier(activeIdentifier);
      if (res.data.devOtp) {
        setDevOtp(res.data.devOtp);
      }
      setStep(2);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset code. Please check your credentials and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Reset Password Handler
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || otp.trim().length !== 6) {
      setError("Please enter the complete 6-digit OTP code.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError("New password must be at least 6 characters long.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        email: method === "email" ? targetIdentifier : undefined,
        phone: method === "phone" ? targetIdentifier : undefined,
        otp: otp.trim(),
        newPassword,
      };

      const res = await api.post("/auth/forgot-password/reset", payload);
      setSuccessMsg(res.data.message || "Password reset successfully!");

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to reset password. OTP may be invalid or expired.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/80 p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-md shadow-xl border border-slate-200/90 bg-white/95 backdrop-blur-md relative z-10">
        <CardHeader className="text-center space-y-2 pb-4">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mx-auto group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Medi<span className="text-teal-600">Vault</span>
            </span>
          </Link>
          <CardTitle className="text-xl font-bold text-slate-900">
            {step === 1 ? "Reset Account Password" : "Set New Password"}
          </CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            {step === 1
              ? "Provide either your registered Email or Mobile Number to receive a 6-digit OTP"
              : `Enter the 6-digit verification code dispatched to ${targetIdentifier}`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Method Selector Tabs (Only in Step 1) */}
          {step === 1 && (
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setMethod("email");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  method === "email"
                    ? "bg-white text-teal-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Via Email</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod("phone");
                  setError("");
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  method === "phone"
                    ? "bg-white text-teal-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Phone className="h-3.5 w-3.5" />
                <span>Via Mobile #</span>
              </button>
            </div>
          )}

          {/* Dev Mode OTP Quick-Fill Badge */}
          {devOtp && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>Dev Security OTP: <strong>{devOtp}</strong></span>
              </div>
              <button
                type="button"
                onClick={() => setOtp(devOtp)}
                className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
              >
                Auto-fill
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Step 1 Form: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {method === "email" ? (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                    Registered Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      placeholder="e.g. alex.johnson@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    We will send a 6-digit verification code to this email.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                    Registered Mobile Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      type="tel"
                      placeholder="e.g. +91 9876543210 or 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    We will send a 6-digit verification code via SMS.
                  </p>
                </div>
              )}

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Sending OTP..." : "Request Reset OTP"}
                {!isLoading && <ArrowRight className="h-4 w-4 ml-1" />}
              </Button>
            </form>
          )}

          {/* Step 2 Form: Verify OTP & Set New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setOtp("");
                      setError("");
                    }}
                    className="text-[11px] text-teal-600 hover:underline cursor-pointer"
                  >
                    Change {method === "email" ? "Email" : "Phone"}
                  </button>
                </div>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  className="tracking-widest text-center font-mono font-bold text-lg"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  New Password (min 6 characters)
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Confirm New Password
                </label>
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                variant="gradient"
                size="lg"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Updating Password..." : "Reset Password & Login"}
                {!isLoading && <KeyRound className="h-4 w-4 ml-1" />}
              </Button>
            </form>
          )}

          {/* Footer Back Link */}
          <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100 flex items-center justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-slate-600 hover:text-teal-600 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
