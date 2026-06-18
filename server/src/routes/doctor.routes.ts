import express from "express";
import * as doctorController from "../controllers/doctor.controller";
import { protect, restrictTo } from "../middlewares/auth";

const router = express.Router();

router.use(protect);

// Public routes for all authenticated users
router.get("/", doctorController.getAllDoctors);
router.get("/:doctorId/availability", doctorController.getDoctorAvailability);

// Doctor-only routes
router.use(restrictTo("doctor"));

router.get("/profile", doctorController.getProfile);
router.patch("/profile", doctorController.updateProfile);

router.get("/dashboard", doctorController.getDashboardStats);
router.post("/verify-patient", doctorController.verifyPatient);
router.post("/verify-otp", doctorController.verifyOTP);
router.get("/patients/:id/history", doctorController.getPatientHistory);

// Availability management
router.post("/availability", doctorController.addAvailability);
router.get("/my-availability", doctorController.getMyAvailability);
router.get("/:doctorId/availability", doctorController.getDoctorAvailability);

// List all doctors (for patients to book)
router.get("/", doctorController.getAllDoctors);

export default router;
