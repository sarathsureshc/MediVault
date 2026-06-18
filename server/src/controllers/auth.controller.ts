import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import * as authService from "../services/auth.service";
import { sendOTP } from "../services/otp.service";

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
