import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { Appointment } from "../models/Appointment";
import { Notification } from "../models/Notification";
import { AppError } from "../utils/AppError";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { DoctorAvailability } from "../models/DoctorAvailability";

export const bookAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { doctorId, date, timeSlot, consultationType, reason } = req.body;
    const userId = (req as any).user._id;

    // Find patient profile
    const patient = await Patient.findOne({ user: userId });
    if (!patient) {
      throw new AppError("Patient profile not found", 404);
    }

    // Find doctor and get consultation fee
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      throw new AppError("Doctor not found", 404);
    }

    // Parse date to start of day
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0, 0, 0, 0);

    // Find availability for the doctor on this date
    const availability = await DoctorAvailability.findOne({
      doctor: doctorId,
      date: appointmentDate,
    });

    if (!availability) {
      throw new AppError("No availability found for this date", 404);
    }

    // Find the specific time slot
    const slot = availability.timeSlots.find(
      (s: any) => s.time === timeSlot && !s.isBooked
    );

    if (!slot) {
      throw new AppError("Time slot not available", 400);
    }

    // Mark slot as booked
    slot.isBooked = true;
    await availability.save();

    // Create appointment
    const appointment = await Appointment.create({
      doctor: doctorId,
      patient: patient._id,
      date: appointmentDate,
      timeSlot,
      consultationType: consultationType || "new",
      amount: doctor.consultationFee,
      reason,
      status: "pending",
      paymentStatus: "pending", // Payment pending initially
    });

    // Notify doctor
    if (doctor) {
      await Notification.create({
        user: doctor.user,
        message: `New ${consultationType} appointment booking for ${appointmentDate.toLocaleDateString()} at ${timeSlot}`,
        type: "booking",
        relatedId: appointment._id,
      });
    }

    // Populate and return
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("doctor", "fullName specialization consultationFee")
      .populate("patient", "fullName");

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: { appointment: populatedAppointment },
    });
  }
);

export const getMyAppointments = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;
    const role = (req as any).user.role;

    let query: any = {};

    try {
      if (role === "patient") {
        const patientProfile = await Patient.findOne({ user: userId });
        if (!patientProfile) {
          return res.status(200).json({
            success: true,
            count: 0,
            data: { appointments: [] },
          });
        }
        query = { patient: patientProfile._id };
      } else if (role === "doctor") {
        const doctorProfile = await Doctor.findOne({ user: userId });
        if (!doctorProfile) {
          return res.status(200).json({
            success: true,
            count: 0,
            data: { appointments: [] },
          });
        }
        query = { doctor: doctorProfile._id };
      }

      const appointments = await Appointment.find(query)
        .populate({
          path: "doctor",
          select: "fullName specialization consultationFee hospitalClinicName",
        })
        .populate({
          path: "patient",
          select: "fullName",
        })
        .sort({ date: -1 })
        .lean();

      res.status(200).json({
        success: true,
        count: appointments.length,
        data: { appointments },
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      res.status(200).json({
        success: true,
        count: 0,
        data: { appointments: [] },
      });
    }
  }
);

export const updateAppointmentStatus = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const { status } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) {
      throw new AppError("Appointment not found", 404);
    }

    // Verify Doctor Ownership if requester is a doctor
    if (req.user?.role === "doctor") {
      const doctor = await Doctor.findOne({ user: req.user._id });
      if (!doctor || appointment.doctor.toString() !== doctor._id.toString()) {
        return next(new AppError("You are not authorized to modify this appointment", 403));
      }
    }

    appointment.status = status;
    await appointment.save();

    // Find patient to get their user ID for notification
    const patient = await Patient.findById(appointment.patient);
    if (patient) {
      await Notification.create({
        user: patient.user,
        message: `Your appointment status has been updated to: ${status}`,
        type: "booking",
        relatedId: appointment._id,
      });
    }

    res.status(200).json({
      success: true,
      data: appointment,
    });
  }
);

export const payAppointment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return next(new AppError("Appointment not found", 404));
    }

    // Verify patient profile
    const patientProfile = await Patient.findOne({ user: (req as any).user?._id });
    if (!patientProfile || appointment.patient.toString() !== patientProfile._id.toString()) {
      return next(new AppError("Not authorized to pay for this appointment", 403));
    }

    appointment.paymentStatus = "paid";
    appointment.status = "confirmed"; // Auto-confirm on payment
    await appointment.save();

    // Notify Doctor
    const doctor = await Doctor.findById(appointment.doctor);
    if (doctor) {
      await Notification.create({
        user: doctor.user,
        message: `Payment received. Appointment on ${appointment.date.toLocaleDateString()} at ${appointment.timeSlot} is confirmed.`,
        type: "booking",
        relatedId: appointment._id,
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment successful",
      data: appointment,
    });
  }
);
