import express from "express";
import * as patientController from "../controllers/patient.controller";
import { protect, restrictTo } from "../middlewares/auth";

const router = express.Router();

// Protect all routes
router.use(protect);
router.use(restrictTo("patient"));

router.get("/profile", patientController.getProfile);
router.patch("/profile", patientController.updateProfile);
router.get("/history", patientController.getMedicalHistory);

export default router;
