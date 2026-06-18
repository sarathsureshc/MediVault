import mongoose, { Schema, Document } from "mongoose";

export interface IPharmacy extends Document {
  user: mongoose.Types.ObjectId;
  pharmacyName: string;
  licenseNumber: string;
  phone: string;
  address: string;
  isVerifiedByAdmin: boolean;
}

const pharmacySchema = new Schema<IPharmacy>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    pharmacyName: { type: String, required: true },
    licenseNumber: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    isVerifiedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Pharmacy = mongoose.model<IPharmacy>("Pharmacy", pharmacySchema);
