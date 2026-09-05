"use client";

import React, { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Calendar, Clock, Plus, Trash2, CheckCircle2, Lock } from "lucide-react";

export default function AvailabilityManager() {
  const [date, setDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [newSlot, setNewSlot] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [existingAvailabilities, setExistingAvailabilities] = useState<any[]>([]);

  const fetchMyAvailability = async () => {
    try {
      const res = await api.get("/doctors/my-availability");
      setExistingAvailabilities(res.data.data.availability || []);
    } catch (err) {
      console.error("Failed to fetch my availability", err);
    }
  };

  useEffect(() => {
    fetchMyAvailability();
  }, []);

  useEffect(() => {
    if (date) {
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      const found = existingAvailabilities.find((avail) => {
        const d = new Date(avail.date);
        d.setHours(0, 0, 0, 0);
        return d.getTime() === selectedDate.getTime();
      });

      if (found) {
        const loadedSlots = found.timeSlots.map((slot: any) => ({
          time: slot.time,
          isBooked: slot.isBooked,
          duration: slot.duration || 30,
        }));
        setTimeSlots(loadedSlots);
        if (found.timeSlots.length > 0) {
          setDuration(found.timeSlots[0].duration || 30);
        }
      } else {
        setTimeSlots([]);
      }
    } else {
      setTimeSlots([]);
    }
  }, [date, existingAvailabilities]);

  const addTimeSlot = (customTime?: string) => {
    const timeToAdd = (customTime || newSlot).trim();
    if (timeToAdd && !timeSlots.some((s) => s.time === timeToAdd)) {
      setTimeSlots([...timeSlots, { time: timeToAdd, isBooked: false, duration }]);
      if (!customTime) setNewSlot("");
    }
  };

  const removeTimeSlot = (slotTime: string) => {
    const slot = timeSlots.find((s) => s.time === slotTime);
    if (slot?.isBooked) {
      setMessage("Cannot remove a booked slot that has active appointments.");
      return;
    }
    setTimeSlots(timeSlots.filter((s) => s.time !== slotTime));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || timeSlots.length === 0) {
      setMessage("Please pick a date and add at least one time slot.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      await api.post("/doctors/availability", {
        date,
        timeSlots: timeSlots.map((s) => s.time),
        duration,
      });
      setMessage("Availability slots saved successfully!");
      await fetchMyAvailability();
    } catch (err: any) {
      setMessage(err.response?.data?.message || "Failed to save availability schedule");
    } finally {
      setLoading(false);
    }
  };

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const commonSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-xs border border-slate-200/90 font-sans">
      <CardHeader className="pb-3 border-b border-slate-100">
        <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-teal-600" /> Manage Doctor Availability Schedule
        </CardTitle>
        <CardDescription className="text-xs text-slate-500">
          Configure active consulting dates, session durations, and patient appointment time slots
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Select Consultation Date *"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              min={getLocalDateString()}
              required
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
                Slot Duration
              </label>
              <select
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none focus:ring-4 focus:ring-teal-500/10"
              >
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>

          {/* Quick-Add Common Slots */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Quick Add Common Slots:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {commonSlots.map((slot) => {
                const isAdded = timeSlots.some((s) => s.time === slot);
                return (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => addTimeSlot(slot)}
                    disabled={isAdded}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                      isAdded
                        ? "bg-slate-100 text-slate-400 border-slate-200 cursor-default"
                        : "bg-teal-50 text-teal-800 border-teal-200 hover:bg-teal-100"
                    }`}
                  >
                    + {slot}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Slot Input */}
          <div className="flex gap-2">
            <Input
              placeholder="Or custom time (e.g., 06:30 PM)"
              value={newSlot}
              onChange={(e) => setNewSlot(e.target.value)}
            />
            <Button type="button" variant="outline" onClick={() => addTimeSlot()} className="flex-shrink-0">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {/* Configured Slots */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wide">
              Active Time Slots for {date || "Selected Date"} ({timeSlots.length})
            </label>
            {timeSlots.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shadow-xs ${
                      slot.isBooked
                        ? "bg-slate-100 text-slate-500 border-slate-300"
                        : "bg-teal-50 text-teal-800 border-teal-200"
                    }`}
                  >
                    <Clock className="h-3.5 w-3.5 text-teal-600" />
                    <span>{slot.time}</span>
                    {slot.isBooked ? (
                      <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded font-normal flex items-center gap-0.5">
                        <Lock className="h-2.5 w-2.5" /> Booked
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => removeTimeSlot(slot.time)}
                        className="text-rose-500 hover:text-rose-700 ml-1 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">
                No slots configured for this date yet. Pick a date and click time buttons above.
              </p>
            )}
          </div>

          {message && (
            <div className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
              message.includes("success")
                ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                : "bg-amber-50 border border-amber-200 text-amber-800"
            }`}>
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              {message}
            </div>
          )}

          <Button
            type="submit"
            variant="gradient"
            size="lg"
            className="w-full mt-3"
            disabled={loading || timeSlots.length === 0}
          >
            {loading ? "Saving Schedule..." : "Save Availability Schedule"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
