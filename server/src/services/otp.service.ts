import { OTP } from "../models/OTP";
import { sendEmail } from "./email.service";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (email: string) => {
  // 1. Check rate limit (optional, can be done in middleware or here)
  // 2. Generate OTP
  const otp = generateOTP();

  // 3. Save to DB (hashed)
  // We hash it in the model pre-save hook, so just save plain here?
  // Wait, if I save plain, the pre-save hook hashes it.
  // But I need to send the PLAIN otp to the user.

  await OTP.create({ email, otp });

  // 4. Send via Email
  await sendEmail(
    email,
    "Your MEDIVAULT Verification Code",
    `Your OTP is: ${otp}. It is valid for 5 minutes.`
  );
};

export const verifyOTP = async (email: string, otp: string) => {
  // 1. Find OTP record
  const otpRecord = await OTP.findOne({ email }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  // 2. Verify hash
  const isValid = await bcrypt.compare(otp, otpRecord.otp);
  if (!isValid) {
    throw new AppError("Invalid OTP", 400);
  }

  // 3. Delete OTP (prevent reuse)
  await OTP.deleteOne({ _id: otpRecord._id });

  return true;
};
