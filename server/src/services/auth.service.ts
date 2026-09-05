import { User, IUser } from "../models/User";
import { Patient } from "../models/Patient";
import { Doctor } from "../models/Doctor";
import { Lab } from "../models/Lab";
import { Pharmacy } from "../models/Pharmacy";
import { AppError } from "../utils/AppError";
import { signToken, signRefreshToken } from "../utils/jwt";
import { sendOTP, verifyOTP } from "./otp.service";

export const registerUser = async (userData: any, roleData: any) => {
  // 1. Check if user exists
  const existingUser = await User.findOne({ email: userData.email });
  if (existingUser) {
    throw new AppError("Email already in use", 400);
  }

  // 2. Create User (unverified)
  const user = await User.create({
    email: userData.email,
    password: userData.password,
    role: userData.role,
    isVerified: false,
  });

  // 3. Create Role Profile
  let profile: any;
  if (userData.role === "patient") {
    profile = await Patient.create({
      ...roleData,
      user: user._id,
      patientID: `PAT-${Date.now()}`,
    }); // Simple ID gen
  } else if (userData.role === "doctor") {
    profile = await Doctor.create({ ...roleData, user: user._id });
  } else if (userData.role === "lab") {
    profile = await Lab.create({ ...roleData, user: user._id });
  } else if (userData.role === "pharmacy") {
    profile = await Pharmacy.create({ ...roleData, user: user._id });
  }

  // 4. Link profile to user
  if (!profile) {
    throw new AppError("Failed to create profile", 500);
  }
  user.profileId = profile._id;
  await user.save({ validateBeforeSave: false });

  // 5. Send OTP
  await sendOTP(user.email);

  return user;
};

const getUserWithProfileName = async (user: IUser) => {
  let fullName = "";
  if (user.role === "patient") {
    const profile = await Patient.findOne({ user: user._id });
    if (profile) fullName = profile.fullName;
  } else if (user.role === "doctor") {
    const profile = await Doctor.findOne({ user: user._id });
    if (profile) fullName = profile.fullName;
  } else if (user.role === "lab") {
    const profile = await Lab.findOne({ user: user._id });
    if (profile) fullName = profile.labName;
  } else if (user.role === "pharmacy") {
    const profile = await Pharmacy.findOne({ user: user._id });
    if (profile) fullName = profile.pharmacyName;
  }
  const userObj = user.toObject();
  (userObj as any).fullName = fullName;
  return userObj;
};

export const loginUser = async (email: string, password: string) => {
  // 1. Check if user exists & password is correct
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Incorrect email or password", 401);
  }

  // 2. Check if user is blocked / suspended for malpractice
  if (user.isBlocked) {
    throw new AppError(
      `Your account has been suspended by administration. Reason: ${user.blockReason || "Malpractice or regulatory violation"}`,
      403
    );
  }

  // 3. Check verification
  if (!user.isVerified) {
    // Resend OTP? Or just tell them to verify.
    // Let's assume we want them to verify.
    throw new AppError("Account not verified. Please verify OTP.", 401);
  }

  // 4. Generate tokens
  const accessToken = signToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  const userWithProfile = await getUserWithProfileName(user);

  return { user: userWithProfile, accessToken, refreshToken };
};

export const verifyUserOTP = async (email: string, otp: string) => {
  await verifyOTP(email, otp);

  const user = await User.findOne({ email });
  if (!user) throw new AppError("User not found", 404);

  if (user.isBlocked) {
    throw new AppError(
      `Your account has been suspended by administration. Reason: ${user.blockReason || "Malpractice or regulatory violation"}`,
      403
    );
  }

  user.isVerified = true;
  await user.save({ validateBeforeSave: false });

  const accessToken = signToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());

  const userWithProfile = await getUserWithProfileName(user);

  return { user: userWithProfile, accessToken, refreshToken };
};
