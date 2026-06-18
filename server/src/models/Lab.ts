import mongoose, { Schema, Document } from "mongoose";

export interface ILab extends Document {
  user: mongoose.Types.ObjectId;
  labName: string;
  licenseNumber: string;
  phone: string;
  address: string;
  isVerifiedByAdmin: boolean;
}

const labSchema = new Schema<ILab>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    labName: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    isVerifiedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Lab = mongoose.model<ILab>("Lab", labSchema);
