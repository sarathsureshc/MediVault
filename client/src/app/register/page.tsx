"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, ShieldCheck, User, Stethoscope, FlaskConical, Pill, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

// Base schema for all users
const baseSchema = {
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["patient", "doctor", "lab", "pharmacy"]),
};

// Role-specific schemas
const patientSchema = z.object({
  ...baseSchema,
  fullName: z.string().min(2, "Full name is required"),
});

const doctorSchema = z.object({
  ...baseSchema,
  fullName: z.string().min(2, "Full name is required"),
  specialization: z.string().min(2, "Specialization is required"),
  qualification: z.string().min(2, "Qualification is required"),
  hospitalClinicName: z.string().min(2, "Hospital/Clinic name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().optional(),
});

const labSchema = z.object({
  ...baseSchema,
  labName: z.string().min(2, "Lab name is required"),
  licenseNumber: z.string().min(2, "License number is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(2, "Address is required"),
});

const pharmacySchema = z.object({
  ...baseSchema,
  pharmacyName: z.string().min(2, "Pharmacy name is required"),
  licenseNumber: z.string().min(2, "License number is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  address: z.string().min(2, "Address is required"),
});

export default function RegisterPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "patient" | "doctor" | "lab" | "pharmacy"
  >("patient");
  const [showPassword, setShowPassword] = useState(false);

  React.useEffect(() => {
    if (!authLoading && user) {
      router.replace("/dashboard");
    }
  }, [user, authLoading, router]);

  // Determine schema based on role
  const getSchema = () => {
    switch (selectedRole) {
      case "doctor":
        return doctorSchema;
      case "lab":
        return labSchema;
      case "pharmacy":
        return pharmacySchema;
      default:
        return patientSchema;
    }
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(getSchema()),
    defaultValues: { role: "patient" },
  });

  const handleRoleChange = (
    role: "patient" | "doctor" | "lab" | "pharmacy"
  ) => {
    setSelectedRole(role);
    reset({ role });
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError("");
    try {
      await api.post("/auth/register", data);
      router.push(`/verify-otp?email=${encodeURIComponent(data.email)}`);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please check inputs.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleConfigs = [
    { key: "patient", label: "Patient", icon: User, desc: "Personal Medical Vault" },
    { key: "doctor", label: "Doctor", icon: Stethoscope, desc: "Clinician & Practice" },
    { key: "lab", label: "Diagnostic Lab", icon: FlaskConical, desc: "Reports & Tests" },
    { key: "pharmacy", label: "Pharmacy", icon: Pill, desc: "Prescription Dispense" },
  ] as const;

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50/80 p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Ambient background glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-300/15 rounded-full blur-3xl pointer-events-none" />

      <Card className="w-full max-w-2xl shadow-xl border border-slate-200/90 bg-white/95 backdrop-blur-md relative z-10">
        <CardHeader className="text-center space-y-2 pb-6">
          <Link href="/" className="inline-flex items-center gap-2 justify-center mx-auto group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/25 group-hover:scale-105 transition-transform">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Medi<span className="text-teal-600">Vault</span>
            </span>
          </Link>
          <CardTitle className="text-xl font-bold text-slate-900">Create Your Account</CardTitle>
          <CardDescription className="text-slate-500">
            Join the secure unified digital healthcare network
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Role Selection Tabs */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide mb-2">
                I am registering as:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {roleConfigs.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleRoleChange(key)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      selectedRole === key
                        ? "border-teal-500 bg-teal-50/70 text-teal-800 shadow-xs ring-2 ring-teal-500/20"
                        : "border-slate-200 bg-slate-50/50 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                    }`}
                  >
                    <Icon className={`h-5 w-5 mb-1.5 ${selectedRole === key ? "text-teal-600" : "text-slate-400"}`} />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <input type="hidden" {...register("role")} value={selectedRole} />
            </div>

            {/* Email & Password */}
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Email Address *"
                type="email"
                placeholder="name@example.com"
                error={errors.email?.message as string}
                {...register("email")}
              />
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                  Password *
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 6 characters"
                    error={errors.password?.message as string}
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
            </div>

            {/* Patient Fields */}
            {selectedRole === "patient" && (
              <Input
                label="Full Name *"
                placeholder="e.g. John Doe"
                error={errors.fullName?.message as string}
                {...register("fullName")}
              />
            )}

            {/* Doctor Fields */}
            {selectedRole === "doctor" && (
              <div className="space-y-4 pt-1">
                <Input
                  label="Full Name (with Dr. Title) *"
                  placeholder="e.g. Dr. Sarah Jenkins"
                  error={errors.fullName?.message as string}
                  {...register("fullName")}
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Specialization *"
                    placeholder="e.g. Cardiology, Neurology"
                    error={errors.specialization?.message as string}
                    {...register("specialization")}
                  />
                  <Input
                    label="Qualification *"
                    placeholder="e.g. MBBS, MD, FRCP"
                    error={errors.qualification?.message as string}
                    {...register("qualification")}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Hospital / Clinic Name *"
                    placeholder="e.g. Apollo Health City"
                    error={errors.hospitalClinicName?.message as string}
                    {...register("hospitalClinicName")}
                  />
                  <Input
                    label="Contact Phone Number *"
                    placeholder="e.g. +91 9876543210"
                    error={errors.phone?.message as string}
                    {...register("phone")}
                  />
                </div>
                <Input
                  label="Practice Address"
                  placeholder="e.g. 104 Medical Enclave, City Center"
                  error={errors.address?.message as string}
                  {...register("address")}
                />
              </div>
            )}

            {/* Lab Fields */}
            {selectedRole === "lab" && (
              <div className="space-y-4 pt-1">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Laboratory / Diagnostic Center Name *"
                    placeholder="e.g. Metropolis Diagnostics"
                    error={errors.labName?.message as string}
                    {...register("labName")}
                  />
                  <Input
                    label="License / Registration Number *"
                    placeholder="e.g. LAB-REG-2024-89"
                    error={errors.licenseNumber?.message as string}
                    {...register("licenseNumber")}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Official Phone *"
                    placeholder="e.g. +91 9876543210"
                    error={errors.phone?.message as string}
                    {...register("phone")}
                  />
                  <Input
                    label="Center Address *"
                    placeholder="e.g. 45 Diagnostic Hub"
                    error={errors.address?.message as string}
                    {...register("address")}
                  />
                </div>
              </div>
            )}

            {/* Pharmacy Fields */}
            {selectedRole === "pharmacy" && (
              <div className="space-y-4 pt-1">
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Pharmacy Name *"
                    placeholder="e.g. MediCare Health Pharmacy"
                    error={errors.pharmacyName?.message as string}
                    {...register("pharmacyName")}
                  />
                  <Input
                    label="Drug License Number *"
                    placeholder="e.g. DL-PHM-8921A"
                    error={errors.licenseNumber?.message as string}
                    {...register("licenseNumber")}
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="Pharmacy Contact Number *"
                    placeholder="e.g. +91 9876543210"
                    error={errors.phone?.message as string}
                    {...register("phone")}
                  />
                  <Input
                    label="Store Address *"
                    placeholder="e.g. Ground Floor, City Hospital Rd"
                    error={errors.address?.message as string}
                    {...register("address")}
                  />
                </div>
              </div>
            )}

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
              {isLoading ? "Creating Your Account..." : "Complete Registration"}
              {!isLoading && <ArrowRight className="h-4 w-4 ml-1" />}
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-100 text-center text-xs text-slate-600">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-teal-600 hover:text-teal-700 hover:underline">
              Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
