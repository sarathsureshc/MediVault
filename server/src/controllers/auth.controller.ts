import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import * as authService from "../services/auth.service";
import { sendOTP } from "../services/otp.service";
import { AppError } from "../utils/AppError";
import { verifyToken, signToken, signRefreshToken } from "../utils/jwt";
import { User } from "../models/User";

export const register = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, role, ...roleData } = req.body;
    const user = await authService.registerUser(
      { email, password, role },
      roleData
    );

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please verify OTP sent to your email.",
      data: { userId: user._id, email: user.email },
    });
  }
);

export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const { user, accessToken, refreshToken } = await authService.loginUser(
      email,
      password
    );

    // Send refresh token in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      accessToken,
      data: { user },
    });
  }
);

export const verifyOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, otp } = req.body;
    const { user, accessToken, refreshToken } = await authService.verifyUserOTP(
      email,
      otp
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      accessToken,
      data: { user },
    });
  }
);

export const refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return next(new AppError('No refresh token provided', 401));
  }
  try {
    const decoded = verifyToken(refreshToken);
    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    const newAccessToken = signToken(user._id.toString());
    // Optionally rotate refresh token
    const newRefreshToken = signRefreshToken(user._id.toString());
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.status(200).json({ success: true, accessToken: newAccessToken });
  } catch (err) {
    return next(new AppError('Invalid refresh token', 401));
  }
});

export const resendOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    await sendOTP(email);

    res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  }
);

export const logout = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }
);

import { Patient } from "../models/Patient";
import { Doctor } from "../models/Doctor";
import { Lab } from "../models/Lab";
import { Pharmacy } from "../models/Pharmacy";
import { Notification } from "../models/Notification";

// Helper to find a user by email or phone number across models
const findUserByIdentifier = async (email?: string, phone?: string) => {
  if (email && email.trim() !== "") {
    return await User.findOne({ email: email.trim().toLowerCase() });
  }

  if (phone && phone.trim() !== "") {
    const cleanPhone = phone.trim();
    // 1. Direct match on User.phone
    let user = await User.findOne({ phone: cleanPhone });
    if (user) return user;

    // 2. Check role profile tables
    const [patient, doctor, lab, pharmacy] = await Promise.all([
      Patient.findOne({ phone: cleanPhone }),
      Doctor.findOne({ phone: cleanPhone }),
      Lab.findOne({ phone: cleanPhone }),
      Pharmacy.findOne({ phone: cleanPhone }),
    ]);

    const matchedProfile = patient || doctor || lab || pharmacy;
    if (matchedProfile && matchedProfile.user) {
      return await User.findById(matchedProfile.user);
    }
  }

  return null;
};

// 1. Forgot Password - Request OTP (either email OR phone is mandatory)
export const forgotPasswordSendOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone } = req.body;

    if ((!email || email.trim() === "") && (!phone || phone.trim() === "")) {
      return next(
        new AppError(
          "Please provide either a registered Email address or Phone number to receive the verification OTP.",
          400
        )
      );
    }

    const user = await findUserByIdentifier(email, phone);
    if (!user) {
      return next(
        new AppError(
          "No registered account found matching the provided identifier. Please check and try again.",
          404
        )
      );
    }

    const identifier = email && email.trim() !== "" ? email.trim() : phone!.trim();
    const channel = email && email.trim() !== "" ? "email" : "phone";

    const result = await sendOTP(identifier, channel);

    res.status(200).json({
      success: true,
      message: `Security OTP sent to your registered ${channel}. Valid for 5 minutes.`,
      identifier,
      channel,
      devOtp: result.devOtp,
    });
  }
);

// 2. Forgot Password - Verify OTP & Reset Password
export const forgotPasswordReset = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, phone, otp, newPassword } = req.body;

    if ((!email || email.trim() === "") && (!phone || phone.trim() === "")) {
      return next(
        new AppError("Email or phone number is mandatory for password reset.", 400)
      );
    }

    if (!otp || otp.trim().length !== 6) {
      return next(new AppError("Please provide a valid 6-digit verification OTP.", 400));
    }

    if (!newPassword || newPassword.length < 6) {
      return next(
        new AppError("New password must be at least 6 characters long.", 400)
      );
    }

    const identifier = email && email.trim() !== "" ? email.trim() : phone!.trim();

    // Verify OTP
    const { verifyOTP } = await import("../services/otp.service");
    await verifyOTP(identifier, otp);

    const user = await findUserByIdentifier(email, phone);
    if (!user) {
      return next(new AppError("User account not found.", 404));
    }

    user.password = newPassword;
    await user.save();

    // Create a security log notification
    await Notification.create({
      user: user._id,
      message: "[Security Notice] Your MediVault password was reset successfully.",
      type: "system",
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: "Password reset successfully! You can now log in with your new credentials.",
    });
  }
);

// 3. Authenticated Change Password - Request OTP
export const changePasswordSendOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;
    const { channel } = req.body; // "email" or "phone"

    let targetIdentifier = user.email;
    let selectedChannel: "email" | "phone" = "email";

    if (channel === "phone") {
      let userPhone = user.phone;
      if (!userPhone) {
        if (user.role === "patient") {
          const p = await Patient.findOne({ user: user._id });
          if (p?.phone) userPhone = p.phone;
        } else if (user.role === "doctor") {
          const d = await Doctor.findOne({ user: user._id });
          if (d?.phone) userPhone = d.phone;
        } else if (user.role === "lab") {
          const l = await Lab.findOne({ user: user._id });
          if (l?.phone) userPhone = l.phone;
        } else if (user.role === "pharmacy") {
          const ph = await Pharmacy.findOne({ user: user._id });
          if (ph?.phone) userPhone = ph.phone;
        }
      }

      if (userPhone) {
        targetIdentifier = userPhone;
        selectedChannel = "phone";
      }
    }

    const result = await sendOTP(targetIdentifier, selectedChannel);

    res.status(200).json({
      success: true,
      message: `Security OTP sent to your registered ${selectedChannel} (${targetIdentifier}).`,
      identifier: targetIdentifier,
      channel: selectedChannel,
      devOtp: result.devOtp,
    });
  }
);

// 4. Authenticated Change Password - Verify OTP & Update
export const changePassword = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;
    const { currentPassword, newPassword, otp, identifier } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return next(new AppError("New password must be at least 6 characters.", 400));
    }

    if (!otp || otp.trim().length !== 6) {
      return next(new AppError("Please provide the 6-digit OTP verification code.", 400));
    }

    // Verify current password if user has password set and sent currentPassword
    if (currentPassword) {
      const userWithPass = await User.findById(user._id).select("+password");
      if (userWithPass?.password && !(await userWithPass.comparePassword(currentPassword))) {
        return next(new AppError("Current password is incorrect.", 400));
      }
    }

    const targetIdentifier = identifier?.trim() || user.email;

    // Verify OTP
    const { verifyOTP } = await import("../services/otp.service");
    await verifyOTP(targetIdentifier, otp);

    const currentUser = await User.findById(user._id);
    if (!currentUser) return next(new AppError("User not found", 404));

    currentUser.password = newPassword;
    await currentUser.save();

    await Notification.create({
      user: currentUser._id,
      message: "[Security Update] Your account password was changed successfully.",
      type: "system",
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: "Password changed successfully! Keep your new credentials safe.",
    });
  }
);


