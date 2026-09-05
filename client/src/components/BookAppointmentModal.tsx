"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Calendar, Clock, Stethoscope, Building, Check, X, ShieldAlert } from "lucide-react";

interface BookAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function BookAppointmentModal({
  isOpen,
  onClose,
  onSuccess,
}: BookAppointmentModalProps) {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [consultationType, setConsultationType] = useState<"new" | "follow-up">("new");
  const [date, setDate] = useState("");
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDoctors();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedDoctor && date) {
      fetchAvailableSlots();
    } else {
      setAvailableSlots([]);
      setSelectedSlot("");
    }
  }, [selectedDoctor, date]);

  const fetchDoctors = async () => {
    try {
      const res = await api.get("/doctors");
      setDoctors(res.data.data.doctors || []);
    } catch (err) {
      console.error("Failed to fetch doctors", err);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      setLoadingSlots(true);
      const res = await api.get(`/doctors/${selectedDoctor}/availability`);
      const availability = res.data.data.availability || [];

      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      const daySlots = availability.find((avail: any) => {
        const availDate = new Date(avail.date);
        availDate.setHours(0, 0, 0, 0);
        return availDate.getTime() === selectedDate.getTime();
      });

      if (daySlots) {
        setAvailableSlots(daySlots.timeSlots || []);
      } else {
        setAvailableSlots([]);
      }
    } catch (err) {
      console.error("Failed to fetch slots", err);
      setAvailableSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedDoctor || !date || !selectedSlot) {
      setError("Please select doctor, date, and available time slot.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/appointments/book", {
        doctorId: selectedDoctor,
        date,
        timeSlot: selectedSlot,
        consultationType,
        reason,
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to book appointment");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedDoctor("");
    setConsultationType("new");
    setDate("");
    setSelectedSlot("");
    setReason("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  const selectedDoctorData = doctors.find((d) => d._id === selectedDoctor);

  const getMinDate = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-slate-200 bg-white/95 backdrop-blur-md p-0">
        <CardHeader className="p-5 sm:p-6 pb-4 border-b border-slate-100 flex flex-row items-center justify-between sticky top-0 bg-white/90 backdrop-blur-sm z-10">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-teal-600" /> Book Consultation
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-0.5">
              Select an accredited specialist and pick your time slot
            </CardDescription>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </CardHeader>

        <CardContent className="p-5 sm:p-6 pt-4 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Doctor Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Select Specialist *
              </label>
              <select
                value={selectedDoctor}
                onChange={(e) => setSelectedDoctor(e.target.value)}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
                required
              >
                <option value="">Choose a specialist...</option>
                {doctors.map((doctor) => (
                  <option key={doctor._id} value={doctor._id}>
                    Dr. {doctor.fullName} — {doctor.specialization} (₹{doctor.consultationFee})
                  </option>
                ))}
              </select>
            </div>

            {selectedDoctorData && (
              <div className="p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl text-xs space-y-1.5 text-teal-900">
                <div className="flex items-center justify-between font-semibold">
                  <span className="flex items-center gap-1.5">
                    <Stethoscope className="h-4 w-4 text-teal-600" />
                    Dr. {selectedDoctorData.fullName}
                  </span>
                  <span className="text-teal-700 font-bold bg-white px-2 py-0.5 rounded-full border border-teal-200">
                    Fee: ₹{selectedDoctorData.consultationFee}
                  </span>
                </div>
                <p className="text-teal-700 text-[11px] flex items-center gap-1">
                  <Building className="h-3.5 w-3.5 text-teal-500" />
                  {selectedDoctorData.hospitalClinicName} • {selectedDoctorData.qualification}
                </p>
              </div>
            )}

            {/* Consultation Type */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Consultation Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["new", "follow-up"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setConsultationType(type)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold capitalize transition-all cursor-pointer ${
                      consultationType === type
                        ? "border-teal-500 bg-teal-50 text-teal-800 shadow-xs ring-2 ring-teal-500/20"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    {type === "new" ? "New Consultation" : "Follow-up Visit"}
                  </button>
                ))}
              </div>
            </div>

            {/* Date Selection */}
            <Input
              label="Select Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={getMinDate()}
              required
            />

            {/* Time Slot Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase">
                Available Time Slot *
              </label>
              {loadingSlots ? (
                <div className="p-3 text-xs text-slate-500 text-center bg-slate-50 rounded-xl">
                  Checking real-time doctor availability...
                </div>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                  {availableSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      type="button"
                      disabled={slot.isBooked}
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`p-2 rounded-xl text-xs font-semibold border transition-all text-center cursor-pointer disabled:cursor-not-allowed ${
                        slot.isBooked
                          ? "bg-slate-100 text-slate-400 border-slate-200 line-through opacity-60"
                          : selectedSlot === slot.time
                          ? "bg-teal-600 text-white border-teal-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:border-teal-400 hover:bg-teal-50/50"
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              ) : date && selectedDoctor ? (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-1.5">
                  <ShieldAlert className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  No open slots for this date. Please pick another date.
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">Select doctor and date to view open slots</p>
              )}
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 tracking-wide uppercase mb-1">
                Reason for Consultation (Optional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="Briefly describe your symptoms or visit purpose..."
                className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-3 border-t border-slate-100">
              <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                disabled={loading || !selectedSlot}
                className="flex-1"
              >
                {loading ? "Confirming..." : "Book Appointment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
