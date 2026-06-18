import mongoose, { Schema, Document } from "mongoose";

export interface IConsultation extends Document {
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  diagnosis: string;
  notes: string;
  prescription: {
    medicine: string;
    dosage: string;
    duration: string;
  }[];
  recommendedTests: string[];
  date: Date;
}

const consultationSchema = new Schema<IConsultation>(
  {
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    diagnosis: { type: String, required: true },
    notes: { type: String },
    prescription: [
      {
        medicine: { type: String, required: true },
        dosage: { type: String, required: true },
        duration: { type: String, required: true },
      },
    ],
    recommendedTests: [{ type: String }],
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Consultation = mongoose.model<IConsultation>(
  "Consultation",
  consultationSchema
);
