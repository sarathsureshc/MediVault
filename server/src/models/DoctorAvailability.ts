import mongoose, { Schema, Document } from "mongoose";

export interface ITimeSlot {
  time: string; // e.g., "09:00 AM"
  duration: number; // Duration in minutes (e.g., 30, 60)
  isBooked: boolean;
}

export interface IDoctorAvailability extends Document {
  doctor: mongoose.Types.ObjectId;
  date: Date;
  timeSlots: ITimeSlot[];
  createdAt: Date;
  updatedAt: Date;
}

const timeSlotSchema = new Schema({
  time: { type: String, required: true },
  duration: { type: Number, required: true, default: 30 }, // Default 30 minutes
  isBooked: { type: Boolean, default: false },
});

const doctorAvailabilitySchema = new Schema<IDoctorAvailability>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    date: { type: Date, required: true },
    timeSlots: [timeSlotSchema],
  },
  { timestamps: true }
);

// Compound index to ensure one availability record per doctor per date
doctorAvailabilitySchema.index({ doctor: 1, date: 1 }, { unique: true });

export const DoctorAvailability = mongoose.model<IDoctorAvailability>(
  "DoctorAvailability",
  doctorAvailabilitySchema
);
