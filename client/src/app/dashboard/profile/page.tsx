"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import AvailabilityManager from "@/components/AvailabilityManager";
import {
  User,
  QrCode,
  Shield,
  Copy,
  Check,
  Edit3,
  Stethoscope,
  Building,
  HeartPulse,
  KeyRound,
  Lock,
  Sparkles,
  Mail,
  Phone,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateUserName } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [copied, setCopied] = useState(false);

  // Security & Password Change States
  const [pwChannel, setPwChannel] = useState<"email" | "phone">("email");
  const [pwStep, setPwStep] = useState<1 | 2>(1);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwOtp, setPwOtp] = useState("");
  const [pwDevOtp, setPwDevOtp] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwIdentifier, setPwIdentifier] = useState("");

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      let endpoint = "";
      if (user?.role === "patient") {
        endpoint = "/patients/profile";
      } else if (user?.role === "doctor") {
        endpoint = "/doctors/profile";
      } else {
        setLoading(false);
        return;
      }

      const res = await api.get(endpoint);
      const profileData = res.data.data.patient || res.data.data.doctor;
      setProfile(profileData);

      if (user?.role === "patient") {
        setFormData({
          fullName: profileData.fullName || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          age: profileData.age || "",
          bloodGroup: profileData.bloodGroup || "",
          gender: profileData.gender || "male",
          dateOfBirth: profileData.dateOfBirth
            ? new Date(profileData.dateOfBirth).toISOString().split("T")[0]
            : "",
          allergies: profileData.medicalHistory?.allergies?.join(", ") || "",
          chronicDiseases: profileData.medicalHistory?.chronicDiseases?.join(", ") || "",
          pastSurgeries: profileData.medicalHistory?.pastSurgeries?.join(", ") || "",
        });
      } else if (user?.role === "doctor") {
        setFormData({
          fullName: profileData.fullName || "",
          phone: profileData.phone || "",
          address: profileData.address || "",
          specialization: profileData.specialization || "",
          qualification: profileData.qualification || "",
          hospitalClinicName: profileData.hospitalClinicName || "",
          consultationFee: profileData.consultationFee || 500,
        });
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch profile details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (!user) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCopyId = () => {
    if (profile?.patientID) {
      navigator.clipboard.writeText(profile.patientID);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      let endpoint = "";
      let payload = { ...formData };

      if (user.role === "patient") {
        endpoint = "/patients/profile";
        payload.medicalHistory = {
          allergies: formData.allergies
            ? formData.allergies.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
          chronicDiseases: formData.chronicDiseases
            ? formData.chronicDiseases.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
          pastSurgeries: formData.pastSurgeries
            ? formData.pastSurgeries.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
        };
        delete payload.allergies;
        delete payload.chronicDiseases;
        delete payload.pastSurgeries;
        if (payload.age) payload.age = Number(payload.age);
      } else if (user.role === "doctor") {
        endpoint = "/doctors/profile";
        payload.consultationFee = Number(payload.consultationFee);
      } else {
        setSaving(false);
        return;
      }

      await api.patch(endpoint, payload);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);

      if (payload.fullName) {
        updateUserName(payload.fullName);
      }

      fetchProfile();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPasswordOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    setPwDevOtp(null);
    setPwLoading(true);

    try {
      const res = await api.post("/auth/change-password/send-otp", { channel: pwChannel });
      setPwSuccess(res.data.message || `OTP sent to your registered ${pwChannel}.`);
      setPwIdentifier(res.data.identifier || "");
      if (res.data.devOtp) setPwDevOtp(res.data.devOtp);
      setPwStep(2);
    } catch (err: any) {
      setPwError(err.response?.data?.message || "Failed to send OTP for password change.");
    } finally {
      setPwLoading(false);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (!pwOtp || pwOtp.trim().length !== 6) {
      setPwError("Please enter the 6-digit OTP verification code.");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPwError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwError("New passwords do not match.");
      return;
    }

    setPwLoading(true);
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword: currentPassword || undefined,
        newPassword,
        otp: pwOtp.trim(),
        identifier: pwIdentifier || undefined,
      });

      setPwSuccess(res.data.message || "Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwOtp("");
      setPwDevOtp(null);
      setPwStep(1);
    } catch (err: any) {
      setPwError(err.response?.data?.message || "Failed to update password. Please check your OTP.");
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 font-sans">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-md p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-teal-500/20">
            {(profile?.fullName || user.email).charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 leading-tight">
              {profile?.fullName || user?.fullName || "User Account"}
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
              <span>{user?.email}</span>
              <span>•</span>
              <span className="capitalize font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full">
                {user?.role}
              </span>
            </p>
          </div>
        </div>

        {!isEditing && (user.role === "patient" || user.role === "doctor") && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Edit3 className="h-4 w-4 text-teal-600" />
            Edit Profile
          </Button>
        )}
      </div>

      {success && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          {success}
        </div>
      )}
      {error && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-12">
        {/* Main Details Card */}
        <div className="md:col-span-8 space-y-6">
          <Card className="shadow-xs border border-slate-200/90">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4 text-teal-600" />
                {isEditing ? "Edit Profile Information" : "Profile Details"}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input
                      label="Full Name *"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      label="Phone Number"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>

                  {user.role === "patient" && (
                    <>
                      <div className="grid gap-4 md:grid-cols-3">
                        <Input
                          label="Age"
                          name="age"
                          type="number"
                          value={formData.age}
                          onChange={handleChange}
                        />
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                            Blood Group
                          </label>
                          <select
                            name="bloodGroup"
                            value={formData.bloodGroup}
                            onChange={handleChange}
                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                          >
                            <option value="">Select blood group...</option>
                            {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                              <option key={bg} value={bg}>{bg}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                            Gender
                          </label>
                          <select
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Date of Birth"
                          name="dateOfBirth"
                          type="date"
                          value={formData.dateOfBirth}
                          onChange={handleChange}
                        />
                        <Input
                          label="Residential Address"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="border-t border-slate-100 pt-4 space-y-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <HeartPulse className="h-4 w-4 text-teal-600" /> Medical History Tags
                        </h4>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Allergies (comma-separated)
                          </label>
                          <textarea
                            name="allergies"
                            value={formData.allergies}
                            onChange={handleChange}
                            rows={2}
                            placeholder="e.g. Penicillin, Peanuts"
                            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Chronic Diseases (comma-separated)
                          </label>
                          <textarea
                            name="chronicDiseases"
                            value={formData.chronicDiseases}
                            onChange={handleChange}
                            rows={2}
                            placeholder="e.g. Asthma, Hypertension"
                            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Past Surgeries (comma-separated)
                          </label>
                          <textarea
                            name="pastSurgeries"
                            value={formData.pastSurgeries}
                            onChange={handleChange}
                            rows={2}
                            placeholder="e.g. Appendectomy (2020)"
                            className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {user.role === "doctor" && (
                    <div className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Specialization *"
                          name="specialization"
                          value={formData.specialization}
                          onChange={handleChange}
                          required
                        />
                        <Input
                          label="Qualification *"
                          name="qualification"
                          value={formData.qualification}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          label="Clinic / Hospital Name *"
                          name="hospitalClinicName"
                          value={formData.hospitalClinicName}
                          onChange={handleChange}
                          required
                        />
                        <Input
                          label="Consultation Fee (₹) *"
                          name="consultationFee"
                          type="number"
                          value={formData.consultationFee}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <Input
                        label="Practice Address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                      />
                    </div>
                  )}

                  <div className="flex gap-3 pt-4 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                      Cancel
                    </Button>
                    <Button type="submit" variant="gradient" disabled={saving} className="flex-1">
                      {saving ? "Saving Changes..." : "Save Profile"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-3 bg-slate-50/70 rounded-xl">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Email Address</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{user.email}</p>
                    </div>
                    <div className="p-3 bg-slate-50/70 rounded-xl">
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Phone Number</p>
                      <p className="text-sm font-semibold text-slate-800 mt-0.5">{profile?.phone || user?.phone || "Not specified"}</p>
                    </div>
                  </div>

                  {user.role === "patient" && (
                    <>
                      <div className="grid gap-4 grid-cols-3">
                        <div className="p-3 bg-slate-50/70 rounded-xl text-center">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase">Age</p>
                          <p className="text-base font-bold text-slate-800 mt-0.5">{profile?.age || "—"}</p>
                        </div>
                        <div className="p-3 bg-teal-50/60 border border-teal-100/60 rounded-xl text-center">
                          <p className="text-[11px] font-semibold text-teal-600 uppercase">Blood Group</p>
                          <p className="text-base font-bold text-teal-700 mt-0.5">{profile?.bloodGroup || "—"}</p>
                        </div>
                        <div className="p-3 bg-slate-50/70 rounded-xl text-center">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase">Gender</p>
                          <p className="text-base font-bold text-slate-800 mt-0.5 capitalize">{profile?.gender || "—"}</p>
                        </div>
                      </div>

                      {profile?.address && (
                        <div className="p-3 bg-slate-50/70 rounded-xl">
                          <p className="text-[11px] font-semibold text-slate-400 uppercase">Residential Address</p>
                          <p className="text-xs text-slate-700 mt-0.5">{profile.address}</p>
                        </div>
                      )}

                      {/* Medical History Section */}
                      <div className="border-t border-slate-100 pt-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                          <HeartPulse className="h-4 w-4 text-teal-600" /> Medical History Profile
                        </h4>
                        <div className="grid gap-3 sm:grid-cols-3">
                          <div className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl">
                            <p className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mb-1.5">Allergies</p>
                            {profile?.medicalHistory?.allergies?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {profile.medicalHistory.allergies.map((a: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-rose-100/80 text-rose-800 rounded text-[10px] font-medium">
                                    {a}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">None recorded</p>
                            )}
                          </div>

                          <div className="p-3 bg-amber-50/50 border border-amber-100 rounded-xl">
                            <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1.5">Chronic Diseases</p>
                            {profile?.medicalHistory?.chronicDiseases?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {profile.medicalHistory.chronicDiseases.map((d: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-amber-100/80 text-amber-800 rounded text-[10px] font-medium">
                                    {d}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">None recorded</p>
                            )}
                          </div>

                          <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                            <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider mb-1.5">Past Surgeries</p>
                            {profile?.medicalHistory?.pastSurgeries?.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {profile.medicalHistory.pastSurgeries.map((s: string, i: number) => (
                                  <span key={i} className="px-2 py-0.5 bg-blue-100/80 text-blue-800 rounded text-[10px] font-medium">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-400">None recorded</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {user.role === "doctor" && (
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="p-3 bg-slate-50/70 rounded-xl">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Specialization</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{profile?.specialization || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-slate-50/70 rounded-xl">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Qualifications</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{profile?.qualification || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-slate-50/70 rounded-xl">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase">Clinic / Hospital</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{profile?.hospitalClinicName || "N/A"}</p>
                      </div>
                      <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl">
                        <p className="text-[11px] font-semibold text-teal-700 uppercase">Consultation Fee</p>
                        <p className="text-base font-bold text-teal-800 mt-0.5">₹{profile?.consultationFee || 500}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security & Password Change Card */}
          <Card className="shadow-xs border border-slate-200/90">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-base flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-teal-600" />
                  Security & Change Password
                </span>
                <span className="text-[11px] font-semibold text-slate-400">
                  OTP-Secured
                </span>
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                To update your password, a 6-digit security code will be sent to your registered Email or Mobile Number.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-5 space-y-4">
              {pwSuccess && (
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Check className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <span>{pwSuccess}</span>
                </div>
              )}

              {pwError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold">
                  {pwError}
                </div>
              )}

              {pwDevOtp && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span>Dev Security OTP: <strong>{pwDevOtp}</strong></span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPwOtp(pwDevOtp)}
                    className="text-[11px] font-bold text-amber-700 hover:underline cursor-pointer"
                  >
                    Auto-fill
                  </button>
                </div>
              )}

              {pwStep === 1 ? (
                <form onSubmit={handleRequestPasswordOTP} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                      Receive Security Code Via:
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setPwChannel("email")}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 ${
                          pwChannel === "email"
                            ? "bg-teal-50/80 border-teal-500 text-teal-900 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Mail className="h-4 w-4 text-teal-600" />
                        <div>
                          <p className="font-bold">Email Address</p>
                          <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPwChannel("phone")}
                        className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-center gap-2.5 ${
                          pwChannel === "phone"
                            ? "bg-teal-50/80 border-teal-500 text-teal-900 shadow-2xs"
                            : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <Phone className="h-4 w-4 text-teal-600" />
                        <div>
                          <p className="font-bold">Mobile Number</p>
                          <p className="text-[10px] text-slate-400 truncate">
                            {profile?.phone || user?.phone || "Registered Phone"}
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={pwLoading}
                    className="border-teal-500 text-teal-700 hover:bg-teal-50 font-bold"
                  >
                    {pwLoading ? "Sending Code..." : "Send Verification OTP"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                          6-Digit OTP Code *
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setPwStep(1);
                            setPwOtp("");
                            setPwError("");
                          }}
                          className="text-[10px] text-teal-600 hover:underline"
                        >
                          Resend Code
                        </button>
                      </div>
                      <Input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        value={pwOtp}
                        onChange={(e) => setPwOtp(e.target.value.replace(/\D/g, ""))}
                        className="tracking-widest font-mono font-bold"
                        required
                      />
                    </div>

                    <Input
                      label="Current Password (optional)"
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="New Password (min 6 chars) *"
                      type="password"
                      placeholder="New password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <Input
                      label="Confirm New Password *"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPwStep(1);
                        setPwOtp("");
                        setPwError("");
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      size="sm"
                      disabled={pwLoading}
                      className="font-bold"
                    >
                      {pwLoading ? "Updating Password..." : "Confirm & Update Password"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Cards (Holographic QR or Doctor Summary) */}
        <div className="md:col-span-4 space-y-4">
          {user.role === "patient" && profile && (
            <Card className="border border-teal-200/80 shadow-md bg-gradient-to-b from-teal-50/50 to-white text-center">
              <CardHeader className="pb-3 border-b border-teal-100">
                <CardTitle className="text-sm font-bold text-teal-900 flex items-center justify-center gap-1.5">
                  <QrCode className="h-4 w-4 text-teal-600" /> Digital Health Passport
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 flex flex-col items-center space-y-3">
                <div className="p-3.5 bg-white rounded-2xl border border-teal-100 shadow-sm inline-block">
                  <QRCodeSVG value={profile.qrCodeData || profile.patientID} size={160} />
                </div>

                <div className="w-full bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs font-mono">
                  <span className="font-bold text-slate-800 truncate">{profile.patientID}</span>
                  <button
                    onClick={handleCopyId}
                    className="text-teal-600 hover:text-teal-700 p-1 flex-shrink-0 cursor-pointer"
                    title="Copy ID"
                  >
                    {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed px-2">
                  Show this QR code to verified doctors, labs, or pharmacies for instant OTP-secured access.
                </p>
              </CardContent>
            </Card>
          )}

          {user.role === "doctor" && !isEditing && (
            <Card className="border shadow-xs">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Building className="h-4 w-4 text-teal-600" /> Practice Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 pt-2 text-xs text-slate-600">
                <div className="p-3 bg-teal-50/70 border border-teal-100 rounded-xl text-center">
                  <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">Base Consultation Rate</span>
                  <p className="text-2xl font-bold text-teal-800 mt-1">₹{profile?.consultationFee || 500}</p>
                  <p className="text-[10px] text-teal-600 mt-0.5">per appointment session</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {user.role === "doctor" && !isEditing && (
        <div className="mt-8 pt-4">
          <AvailabilityManager />
        </div>
      )}
    </div>
  );
}

