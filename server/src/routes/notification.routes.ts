import express from "express";
import * as notificationController from "../controllers/notification.controller";
import { protect } from "../middlewares/auth"; // Assuming you have this

const router = express.Router();

router.use(protect); // All routes require auth

router.get("/", notificationController.getNotifications);
router.patch("/:id/read", notificationController.markAsRead);
router.patch("/mark-all-read", notificationController.markAllAsRead);

export default router;
