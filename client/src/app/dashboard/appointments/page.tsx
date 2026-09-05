"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import BookAppointmentModal from "@/components/BookAppointmentModal";
import {
  Calendar,
  Clock,
  Stethoscope,
  CreditCard,
  CheckCircle,
  XCircle,
  Plus,
  ShieldCheck,
  AlertCircle,
  UserCheck,
} from "lucide-react";

export default function AppointmentsPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("all");

  // Payment State
  const [selectedAptToPay, setSelectedAptToPay] = useState<any>(null);
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [cardName, setCardName] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await api.get("/appointments");
      const appointmentsData =
        res.data.data?.appointments || res.data.data || [];
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSuccess = () => {
    fetchAppointments();
  };

  const handleOpenPayModal = (apt: any) => {
    setSelectedAptToPay(apt);
    setCardNumber("");
    setCardExpiry("");
    setCardCvv("");
    setCardName("");
    setPayError("");
    setPaySuccess("");
  };

  const handleClosePayModal = () => {
    setSelectedAptToPay(null);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAptToPay) return;

    setPaying(true);
    setPayError("");
    try {
      if (cardNumber.length < 16 || cardCvv.length < 3 || !cardExpiry || !cardName) {
        throw new Error("Please enter valid card details (16-digit card number, 3-digit CVV).");
      }

      await api.patch(`/appointments/${selectedAptToPay._id}/pay`);
      setPaySuccess("Payment processed successfully!");

      setTimeout(() => {
        fetchAppointments();
        handleClosePayModal();
      }, 1400);
    } catch (err: any) {
      setPayError(err.message || err.response?.data?.message || "Payment failed. Please retry.");
    } finally {
      setPaying(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      setUpdatingStatusId(appointmentId);
      await api.patch(`/appointments/${appointmentId}/status`, { status: newStatus });
      await fetchAppointments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update appointment status");
    } finally {
      setUpdatingStatusId(null);
    }
  };

  // Filter appointments
  const filteredAppointments = appointments.filter((apt) => {
    if (filter === "upcoming") {
      return apt.status === "pending" || apt.status === "confirmed";
    }
    if (filter === "completed") {
      return apt.status === "completed" || apt.status === "cancelled";
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-4 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {user?.role === "doctor" ? "Patient Consultations" : "My Appointments"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {user?.role === "doctor"
              ? "Manage scheduled patient bookings, confirm slots, and record outcomes"
              : "Review upcoming clinical consultations and complete secure booking payments"}
          </p>
        </div>

        {user?.role === "patient" && (
          <Button
            variant="gradient"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 shadow-md shadow-teal-500/20"
          >
            <Plus className="h-4 w-4" /> Book Appointment
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-200/60 rounded-xl w-fit">
        {[
          { key: "all", label: `All (${appointments.length})` },
          {
            key: "upcoming",
            label: `Active (${
              appointments.filter((a) => a.status === "pending" || a.status === "confirmed").length
            })`,
          },
          {
            key: "completed",
            label: `Past (${
              appointments.filter((a) => a.status === "completed" || a.status === "cancelled").length
            })`,
          },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filter === key
                ? "bg-white text-slate-900 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <Card className="border border-slate-200/90 shadow-xs">
        <CardHeader className="pb-3 border-b border-slate-100">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4 text-teal-600" />
            {user?.role === "doctor" ? "Scheduled Patient Sessions" : "Your Booked Slots"}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">Loading appointments...</div>
          ) : filteredAppointments.length > 0 ? (
            <div className="space-y-3.5">
              {filteredAppointments.map((apt) => (
                <div
                  key={apt._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-slate-200/80 bg-white hover:border-teal-200 hover:shadow-xs transition-all gap-4"
                >
                  <div className="flex-1 space-y-1.5">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <div className="flex items-center gap-1.5 text-slate-900 font-bold text-sm">
                        <Clock className="h-4 w-4 text-teal-600" />
                        <span>{new Date(apt.date).toLocaleDateString()}</span>
                        <span className="text-teal-700 font-extrabold bg-teal-50 px-2 py-0.5 rounded-md text-xs">
                          {apt.timeSlot}
                        </span>
                      </div>

                      {/* Status Badge */}
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          apt.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : apt.status === "confirmed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : apt.status === "completed"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {apt.status}
                      </span>
                    </div>

                    {user?.role === "patient" ? (
                      <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <Stethoscope className="h-3.5 w-3.5 text-slate-400" />
                        Dr. {apt.doctor?.fullName} • {apt.doctor?.specialization} ({apt.doctor?.hospitalClinicName})
                      </p>
                    ) : (
                      <p className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5 text-slate-400" />
                        Patient: {apt.patient?.fullName || "Patient"}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-0.5">
                      <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] font-medium text-slate-600 capitalize">
                        {apt.consultationType} visit
                      </span>
                      <span>•</span>
                      <span className="font-bold text-slate-800">₹{apt.amount}</span>
                      <span>•</span>
                      <span
                        className={`font-semibold px-2 py-0.5 rounded text-[10px] uppercase ${
                          apt.paymentStatus === "paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {apt.paymentStatus === "paid" ? "Paid" : "Payment Pending"}
                      </span>
                      {apt.reason && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-500">"{apt.reason}"</span>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    {/* Patient Payment Button */}
                    {user?.role === "patient" && apt.paymentStatus === "pending" && apt.status !== "cancelled" && (
                      <Button
                        size="sm"
                        onClick={() => handleOpenPayModal(apt)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs"
                      >
                        <CreditCard className="h-3.5 w-3.5" /> Pay ₹{apt.amount}
                      </Button>
                    )}

                    {/* Doctor Controls */}
                    {user?.role === "doctor" && apt.status !== "completed" && apt.status !== "cancelled" && (
                      <div className="flex items-center gap-1.5">
                        {apt.status === "pending" && (
                          <Button
                            size="sm"
                            disabled={updatingStatusId === apt._id}
                            onClick={() => handleStatusUpdate(apt._id, "confirmed")}
                            className="bg-teal-600 hover:bg-teal-700 text-white text-xs h-8 px-3"
                          >
                            Confirm
                          </Button>
                        )}
                        {apt.status === "confirmed" && (
                          <Button
                            size="sm"
                            disabled={updatingStatusId === apt._id}
                            onClick={() => handleStatusUpdate(apt._id, "completed")}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3"
                          >
                            Mark Done
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updatingStatusId === apt._id}
                          onClick={() => handleStatusUpdate(apt._id, "cancelled")}
                          className="text-rose-600 border-rose-200 hover:bg-rose-50 text-xs h-8 px-3"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Calendar className="h-8 w-8 mx-auto opacity-30 text-slate-500" />
              <p className="text-xs font-medium">No appointments found matching this filter.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking Modal */}
      {user?.role === "patient" && (
        <BookAppointmentModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleBookingSuccess}
        />
      )}

      {/* Checkout Modal */}
      {selectedAptToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 bg-white p-0">
            <CardHeader className="p-5 border-b border-slate-100 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-teal-600" /> Secure Checkout
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  256-Bit Encrypted Payment Gateway
                </CardDescription>
              </div>
              <button
                onClick={handleClosePayModal}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </CardHeader>
            <CardContent className="p-5 pt-4">
              {paySuccess ? (
                <div className="text-center py-6 space-y-3">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 text-2xl font-bold">
                    ✓
                  </div>
                  <p className="text-emerald-800 font-bold text-base">{paySuccess}</p>
                  <p className="text-xs text-slate-500">Your session is confirmed on doctor's schedule.</p>
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  {/* Order Summary Pill */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block">Consultation with</span>
                      <span className="font-bold text-slate-800">Dr. {selectedAptToPay.doctor?.fullName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">Total Due</span>
                      <span className="font-bold text-teal-700 text-base">₹{selectedAptToPay.amount}</span>
                    </div>
                  </div>

                  <Input
                    label="Cardholder Full Name *"
                    placeholder="e.g. John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />

                  <Input
                    label="Card Number *"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    required
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="Expiry (MM/YY) *"
                      placeholder="08/28"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      required
                    />
                    <Input
                      label="CVV *"
                      placeholder="123"
                      type="password"
                      maxLength={3}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      required
                    />
                  </div>

                  {payError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                      {payError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2 border-t border-slate-100">
                    <Button type="button" variant="outline" onClick={handleClosePayModal} className="flex-1">
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="gradient"
                      disabled={paying}
                      className="flex-1"
                    >
                      {paying ? "Processing..." : `Pay ₹${selectedAptToPay.amount}`}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
