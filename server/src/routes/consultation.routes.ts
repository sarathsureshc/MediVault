import express from "express";
import * as consultationController from "../controllers/consultation.controller";
import { protect, restrictTo } from "../middlewares/auth";

const router = express.Router();

router.use(protect);

// Create: Only Doctors
router.post(
  "/",
  restrictTo("doctor"),
  consultationController.createConsultation
);

// Read: Doctors, Patients (own), Labs/Pharmacies (limited access? For now allow all roles to see history if they have ID)
// Actually, strict privacy:
// Patient: Own
// Doctor: Any (if they have ID/QR)
// Lab/Pharmacy: Maybe only specific parts? For now, let's allow Doctor/Patient.
router.get(
  "/:patientId",
  restrictTo("doctor", "patient", "lab", "pharmacy"),
  consultationController.getPatientConsultations
);

export default router;
