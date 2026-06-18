import express from "express";
import * as labController from "../controllers/lab.controller";
import { protect, restrictTo } from "../middlewares/auth";

const router = express.Router();

router.use(protect);
router.use(restrictTo("lab"));

router.post("/upload", labController.uploadTestResult);
router.get("/pending", labController.getPendingTests);

export default router;
