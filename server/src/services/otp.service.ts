import { OTP } from "../models/OTP";
import { sendEmail } from "./email.service";
import bcrypt from "bcryptjs";
import { AppError } from "../utils/AppError";

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const sendOTP = async (identifier: string, channel: "email" | "phone" = "email") => {
  const cleanIdentifier = identifier.trim().toLowerCase();
  const isEmail = cleanIdentifier.includes("@") || channel === "email";

  const otp = generateOTP();

  // Save to DB (hashed by model pre-save hook)
  await OTP.create({
    identifier: cleanIdentifier,
    email: isEmail ? cleanIdentifier : undefined,
    phone: !isEmail ? cleanIdentifier : undefined,
    otp,
  });

  if (isEmail) {
    try {
      await sendEmail(
        cleanIdentifier,
        "Your MEDIVAULT Verification Code",
        `Your MEDIVAULT security OTP is: ${otp}. It is valid for 5 minutes. If you did not request this, please ignore this message.`
      );
    } catch (err) {
      console.warn(`[OTP Service] Failed to send email to ${cleanIdentifier}:`, err);
    }
  } else {
    // In production, integrate SMS provider (e.g. Twilio / Fast2SMS).
    console.log(`[OTP SMS Service] Dispatched OTP ${otp} to phone: ${cleanIdentifier}`);
  }

  // Return dev OTP in non-production environments
  const isDev = process.env.NODE_ENV !== "production";
  return {
    success: true,
    identifier: cleanIdentifier,
    channel: isEmail ? "email" : "phone",
    devOtp: isDev ? otp : undefined,
  };
};

export const verifyOTP = async (identifier: string, otp: string) => {
  const cleanIdentifier = identifier.trim().toLowerCase();

  // Find most recent OTP record matching identifier, email, or phone
  const otpRecord = await OTP.findOne({
    $or: [
      { identifier: cleanIdentifier },
      { email: cleanIdentifier },
      { phone: cleanIdentifier },
    ],
  }).sort({ createdAt: -1 });

  if (!otpRecord) {
    throw new AppError("Invalid or expired OTP. Please request a new verification code.", 400);
  }

  // Verify hash
  const isValid = await bcrypt.compare(otp.trim(), otpRecord.otp);
  if (!isValid) {
    throw new AppError("Invalid verification code. Please check and try again.", 400);
  }

  // Delete all OTPs for this identifier to prevent replay attacks
  await OTP.deleteMany({
    $or: [
      { identifier: cleanIdentifier },
      { email: cleanIdentifier },
      { phone: cleanIdentifier },
    ],
  });

  return true;
};
