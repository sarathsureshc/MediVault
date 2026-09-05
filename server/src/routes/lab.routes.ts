import express from "express";
import * as labController from "../controllers/lab.controller";
import { protect, restrictTo } from "../middlewares/auth";

const router = express.Router();

router.use(protect);

// Allow patient, doctor, and lab to retrieve test results
router.get(
  "/patient/:patientId",
  restrictTo("patient", "doctor", "lab"),
  labController.getPatientTestResults
);

// Lab-only routes
router.post("/upload", restrictTo("lab"), labController.uploadTestResult);
router.get("/history", restrictTo("lab"), labController.getLabHistory);
router.get("/pending", restrictTo("lab"), labController.getPendingTests);

export default router;

