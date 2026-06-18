import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  date: Date;
  timeSlot: string;
  consultationType: "new" | "follow-up";
  status: "pending" | "confirmed" | "cancelled" | "completed";
  paymentStatus: "pending" | "paid";
  amount: number;
  reason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<IAppointment>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    date: { type: Date, required: true },
    timeSlot: { type: String, required: true },
    consultationType: {
      type: String,
      enum: ["new", "follow-up"],
      required: true,
      default: "new",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    amount: { type: Number, required: true },
    reason: { type: String },
  },
  { timestamps: true }
);

export const Appointment = mongoose.model<IAppointment>(
  "Appointment",
  appointmentSchema
);
