import mongoose, { Schema, Document } from "mongoose";

export interface IOTP extends Document {
  email: string;
  otp: string;
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>({
  email: { type: String, required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 }, // Auto-delete after 5 minutes
});

// Hash OTP before saving? Requirement says "OTP hashed in DB".
import bcrypt from "bcryptjs";

otpSchema.pre("save", async function () {
  if (!this.isModified("otp")) return;
  this.otp = await bcrypt.hash(this.otp, 10);
});

export const OTP = mongoose.model<IOTP>("OTP", otpSchema);
