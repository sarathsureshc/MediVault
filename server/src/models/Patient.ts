import mongoose, { Schema, Document } from "mongoose";

export interface IPatient extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  dateOfBirth?: Date;
  gender?: "male" | "female" | "other";
  phone?: string;
  address?: string;
  patientID: string; // Unique ID
  qrCodeData: string; // Encrypted data for QR
  age?: number;
  bloodGroup?: string;
  medicalHistory: {
    allergies: string[];
    chronicDiseases: string[];
    pastSurgeries: string[];
  };
}

const patientSchema = new Schema<IPatient>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ["male", "female", "other"] },
    phone: { type: String },
    address: { type: String },
    patientID: { type: String, unique: true, required: true },
    qrCodeData: { type: String },
    age: { type: Number },
    bloodGroup: { type: String },
    medicalHistory: {
      allergies: [{ type: String }],
      chronicDiseases: [{ type: String }],
      pastSurgeries: [{ type: String }],
    },
  },
  { timestamps: true }
);

export const Patient = mongoose.model<IPatient>("Patient", patientSchema);
