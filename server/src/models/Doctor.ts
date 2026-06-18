import mongoose, { Schema, Document } from "mongoose";

export interface IDoctor extends Document {
  user: mongoose.Types.ObjectId;
  fullName: string;
  specialization: string;
  qualification: string;
  hospitalClinicName: string;
  phone: string;
  address?: string;
  consultationFee: number;
  isVerifiedByAdmin: boolean;
}

const doctorSchema = new Schema<IDoctor>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    specialization: { type: String, required: true },
    qualification: { type: String, required: true },
    hospitalClinicName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    consultationFee: { type: Number, required: true, default: 500 },
    isVerifiedByAdmin: { type: Boolean, default: false }, // Optional admin verification
  },
  { timestamps: true }
);

export const Doctor = mongoose.model<IDoctor>("Doctor", doctorSchema);
