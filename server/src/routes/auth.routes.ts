import express from "express";
import * as authController from "../controllers/auth.controller";
import { validate } from "../middlewares/validate";
import { z } from "zod";

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(["patient", "doctor", "lab", "pharmacy"]),
    // Add specific fields validation based on role if needed, or keep it loose here
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
router.get('/refresh', authController.refreshToken);

export default router;
