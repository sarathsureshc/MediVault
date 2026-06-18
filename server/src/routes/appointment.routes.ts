import express from "express";
import * as appointmentController from "../controllers/appointment.controller";
import { protect, restrictTo } from "../middlewares/auth";

const router = express.Router();

router.use(protect);

router.post(
  "/book",
  restrictTo("patient"),
  appointmentController.bookAppointment
);
router.patch(
  "/:id/pay",
  restrictTo("patient"),
  appointmentController.payAppointment
);
router.get("/", appointmentController.getMyAppointments);
router.patch(
  "/:id/status",
  restrictTo("doctor", "admin"),
  appointmentController.updateAppointmentStatus
);

export default router;
