import express from "express";
import * as pharmacyController from "../controllers/pharmacy.controller";
import { protect, restrictTo } from "../middlewares/auth";

const router = express.Router();

router.use(protect);
router.use(restrictTo("pharmacy"));

router.post("/issue", pharmacyController.issueMedicines);
router.get("/history", pharmacyController.getPharmacyHistory);
router.get("/patient/:patientId", pharmacyController.getPatientPrescriptions);

export default router;

