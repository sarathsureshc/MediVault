"use client";

import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ShieldCheck, Mail, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

const otpSchema = z.object({
  otp: z.string().length(6, "OTP must be exactly 6 digits"),
});

type OtpForm = z.infer<typeof otpSchema>;

function VerifyOtpContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login } = useAuth();
  const email = searchParams.get("email");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
  });

  const onSubmit = async (data: OtpForm) => {
    if (!email) {
      setError("Email not found in query params.");
      return;
    }
    setIsLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/verify-otp", { email, otp: data.otp });
      login(res.data.accessToken, res.data.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid or expired OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    setResendMsg("");
    setError("");
    try {
      await api.post("/auth/resend-otp", { email });
      setResendMsg("A fresh 6-digit OTP has been sent to your email.");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <Card className="w-full max-w-md shadow-xl border border-slate-200/90 bg-white/95 backdrop-blur-md relative z-10">
      <CardHeader className="text-center space-y-2 pb-6">
        <Link href="/" className="inline-flex items-center gap-2 justify-center mx-auto group">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/25">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </Link>
        <CardTitle className="text-xl font-bold text-slate-900">Email Verification</CardTitle>
        <CardDescription className="text-slate-500 text-xs">
          We sent a 6-digit verification code to: <br />
          <span className="font-semibold text-slate-800">{email || "your email"}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              label="6-Digit Verification Code"
              placeholder="123456"
              maxLength={6}
              className="text-center text-xl tracking-[0.4em] font-mono font-bold"
              error={errors.otp?.message}
              {...register("otp")}
            />
          </div>

          {resendMsg && (
            <div className="p-3 rounded-xl bg-teal-50 border border-teal-200 text-xs text-teal-800 font-medium">
              {resendMsg}
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-medium">
              {error}
            </div>
          )}

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Verifying..." : "Verify & Enter Vault"}
            {!isLoading && <ArrowRight className="h-4 w-4 ml-1" />}
          </Button>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Didn't receive code?</span>
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="text-teal-600 hover:text-teal-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${resending ? "animate-spin" : ""}`} />
              {resending ? "Sending..." : "Resend Code"}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/80 p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />

      <Suspense fallback={<div className="text-sm text-slate-500">Loading verification...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
