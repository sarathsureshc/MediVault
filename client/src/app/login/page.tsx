"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  UserCheck,
  Stethoscope,
  FlaskConical,
  Pill,
  Shield,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { user, login, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const performLogin = async (email: string, pass: string) => {
    setIsLoading(true);
    setError("");
    setValue("email", email);
    setValue("password", pass);
    try {
      const res = await api.post("/auth/login", { email, password: pass });
      login(res.data.accessToken, res.data.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginForm) => {
    await performLogin(data.email, data.password);
  };

  const demoAccounts = [
    {
      label: "Patient",
      role: "Alex Johnson",
      email: "patient@medivault.com",
      pass: "password123",
      icon: UserCheck,
      bg: "bg-teal-50 border-teal-200 text-teal-800 hover:bg-teal-100",
      iconColor: "text-teal-600",
    },
    {
      label: "Doctor",
      role: "Dr. Sarah Mitchell",
      email: "doctor@medivault.com",
      pass: "password123",
      icon: Stethoscope,
      bg: "bg-blue-50 border-blue-200 text-blue-800 hover:bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Lab",
      role: "Apex Diagnostics",
      email: "lab@medivault.com",
      pass: "password123",
      icon: FlaskConical,
      bg: "bg-purple-50 border-purple-200 text-purple-800 hover:bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      label: "Pharmacy",
      role: "MediCare Central",
      email: "pharmacy@medivault.com",
      pass: "password123",
      icon: Pill,
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Admin",
      role: "Platform Admin",
      email: "admin@medivault.com",
      pass: "admin123",
      icon: Shield,
      bg: "bg-slate-100 border-slate-300 text-slate-800 hover:bg-slate-200",
      iconColor: "text-slate-700",
    },
  ];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/80 p-4 relative overflow-hidden font-sans">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-lg shadow-xl border border-slate-200/90 bg-white/95 backdrop-blur-md relative z-10">
        <CardHeader className="text-center space-y-2 pb-4">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mx-auto group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Medi<span className="text-teal-600">Vault</span>
            </span>
          </Link>
          <CardTitle className="text-xl font-bold text-slate-900">Sign In to MediVault</CardTitle>
          <CardDescription className="text-slate-500 text-xs">
            Access your secure healthcare vault or use instant 1-click demo logins below
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick 1-Click Instant Demo Login Panel */}
          <div className="p-3.5 bg-gradient-to-br from-slate-50 to-teal-50/40 rounded-2xl border border-slate-200/90 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                1-Click Instant Demo Login:
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Click any role to log in</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {demoAccounts.map(({ label, role, email, pass, icon: Icon, bg, iconColor }) => (
                <button
                  key={label}
                  type="button"
                  disabled={isLoading}
                  onClick={() => performLogin(email, pass)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer shadow-2xs hover:scale-[1.02] active:scale-[0.98] ${bg}`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-xs">
                    <Icon className={`h-3.5 w-3.5 ${iconColor}`} />
                    <span>{label}</span>
                  </div>
                  <p className="text-[10px] opacity-75 truncate mt-0.5">{role}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Or sign in with email
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <Input
              label="Email Address"
              type="email"
              placeholder="name@example.com"
              error={errors.email?.message}
              {...register("email")}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs font-medium text-teal-600 hover:text-teal-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  className="pr-10"
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
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
              {isLoading ? "Authenticating..." : "Sign In to Vault"}
              {!isLoading && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-600 border-t border-slate-100">
            Don&apos;t have an account yet?{" "}
            <Link href="/register" className="font-semibold text-teal-600 hover:text-teal-700 hover:underline">
              Create an account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
