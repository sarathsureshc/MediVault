import express from "express";
import * as pharmacyController from "../controllers/pharmacy.controller";
import { protect, restrictTo } from "../middlewares/auth";

const router = express.Router();

router.use(protect);
router.use(restrictTo("pharmacy"));

router.post("/issue", pharmacyController.issueMedicines);

export default router;
