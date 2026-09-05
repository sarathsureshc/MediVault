import express from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { z } from "zod";

import { protect } from "../middlewares/auth";

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["patient", "doctor", "lab", "pharmacy"]),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string(),
  }),
});

const otpSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
  }),
});

router.post("/register", validate(registerSchema), authController.register);
router.post("/login", validate(loginSchema), authController.login);
router.post("/verify-otp", validate(otpSchema), authController.verifyOTP);
router.post("/resend-otp", authController.resendOTP);
router.post("/logout", authController.logout);
router.get("/refresh", authController.refreshToken);

// Forgot Password Flow (Public - either email OR phone mandatory)
router.post("/forgot-password/send-otp", authController.forgotPasswordSendOTP);
router.post("/forgot-password/reset", authController.forgotPasswordReset);

// Change Password Flow (Protected - for logged-in users with OTP verification)
router.post("/change-password/send-otp", protect, authController.changePasswordSendOTP);
router.post("/change-password", protect, authController.changePassword);

export default router;
