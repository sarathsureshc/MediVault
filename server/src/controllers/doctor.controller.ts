import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { Doctor } from "../models/Doctor";
import { Patient } from "../models/Patient";
import { AppError } from "../utils/AppError";
import { User } from "../models/User";
import { OTP } from "../models/OTP";
import { sendEmail } from "../services/email.service";
import bcrypt from "bcryptjs";
import { DoctorAvailability } from "../models/DoctorAvailability";
import { Appointment } from "../models/Appointment";
import { Consultation } from "../models/Consultation";

export const getDashboardStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctor = await Doctor.findOne({ user: (req as any).user?._id });
    if (!doctor) {
      return next(new AppError("Doctor profile not found", 404));
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [todayAppointments, totalAppointments, pendingAppointments, totalConsultations] =
      await Promise.all([
        Appointment.countDocuments({
          doctor: doctor._id,
          date: { $gte: startOfToday, $lte: endOfToday },
        }),
        Appointment.countDocuments({ doctor: doctor._id }),
        Appointment.countDocuments({ doctor: doctor._id, status: "pending" }),
        Consultation.countDocuments({ doctor: doctor._id }),
      ]);

    // Distinct patients
    const distinctPatients = await Consultation.distinct("patient", {
      doctor: doctor._id,
    });

    res.status(200).json({
      success: true,
      data: {
        todayAppointments,
        totalAppointments,
        pendingAppointments,
        totalConsultations,
        totalPatients: distinctPatients.length,
      },
    });
  }
);

export const verifyPatient = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { patientId, qrCodeData } = req.body;

    let patient;
    if (qrCodeData) {
      // Try to find by qrCodeData first, then fall back to treating it as patientID
      patient = await Patient.findOne({ qrCodeData });

      if (!patient) {
        // QR code might just be the patient ID itself
        patient = await Patient.findOne({ patientID: qrCodeData });
      }
    } else if (patientId) {
      patient = await Patient.findOne({ patientID: patientId });
    }

    if (!patient) {
      return next(new AppError("Patient not found", 404));
    }

    const patientUser = await User.findById(patient.user);
    if (!patientUser) {
      return next(new AppError("Patient user not found", 404));
    }

    // Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP
    await OTP.create({
      email: patientUser.email,
      otp,
    });

    // Send Email
    try {
      await sendEmail(
        patientUser.email,
        "MediVault - Patient Verification OTP",
        `Your OTP for doctor verification is: ${otp}. It expires in 5 minutes.`
      );
    } catch (error) {
      console.error("Failed to send OTP email:", error);
      // Continue anyway for demo/testing if email fails
    }

    res.status(200).json({
      success: true,
      message: "Patient found. OTP sent to registered email.",
      data: {
        patientId: patient.patientID,
        name: patient.fullName,
        // Only return devOtp in non-production development testing
        devOtp: process.env.NODE_ENV === "development" ? otp : undefined,
      },
    });
  }
);

export const verifyOTP = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { patientId, otp } = req.body;

    if (!patientId || !otp) {
      return next(new AppError("Please provide Patient ID and OTP", 400));
    }

    const patient = await Patient.findOne({ patientID: patientId });
    if (!patient) {
      return next(new AppError("Patient not found", 404));
    }

    const patientUser = await User.findById(patient.user);
    if (!patientUser) {
      return next(new AppError("Patient user not found", 404));
    }

    // Verify OTP
    // OTPs are hashed in the database, so we need to fetch all OTPs for this email
    // and compare each one with bcrypt
    const otpRecords = await OTP.find({ email: patientUser.email });

    if (!otpRecords || otpRecords.length === 0) {
      return next(new AppError("Invalid or expired OTP", 400));
    }

    // Check each OTP record to find a match
    let validOTP = null;
    for (const record of otpRecords) {
      const isMatch = await bcrypt.compare(otp, record.otp);
      if (isMatch) {
        validOTP = record;
        break;
      }
    }

    if (!validOTP) {
      return next(new AppError("Invalid or expired OTP", 400));
    }

    // Delete OTP after use
    await OTP.deleteOne({ _id: validOTP._id });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      data: {
        patientId: patient.patientID,
        verified: true,
      },
    });
  }
);

export const getPatientHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params; // patientID

    const patient = await Patient.findOne({ patientID: id });
    if (!patient) {
      return next(new AppError("Patient not found", 404));
    }

    // Calculate Age
    let age = "Unknown";
    if (patient.dateOfBirth) {
      const diff = Date.now() - new Date(patient.dateOfBirth).getTime();
      const ageDate = new Date(diff);
      age = Math.abs(ageDate.getUTCFullYear() - 1970).toString();
    }

    res.status(200).json({
      success: true,
      data: {
        patient: {
          name: patient.fullName,
          id: patient.patientID,
          age: age,
          gender: patient.gender || "Unknown",
          bloodGroup: patient.bloodGroup || "Unknown",
        },
        history: patient.medicalHistory || {
          allergies: [],
          chronicDiseases: [],
          pastSurgeries: [],
        },
      },
    });
  }
);

// Get all doctors for booking (removed verification requirement for MVP)
export const getAllDoctors = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctors = await Doctor.find()
      .select(
        "fullName specialization qualification hospitalClinicName consultationFee"
      )
      .lean();

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: { doctors },
    });
  }
);

// Add or update availability (Doctor only)
export const addAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { date, timeSlots, duration } = req.body; // timeSlots is array of strings, duration in minutes
    const userId = (req as any).user._id;

    // Find doctor profile
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return next(new AppError("Doctor profile not found", 404));
    }

    // Parse date to start of day
    const availabilityDate = new Date(date);
    availabilityDate.setHours(0, 0, 0, 0);

    // Check if availability already exists for this date
    let availability = await DoctorAvailability.findOne({
      doctor: doctor._id,
      date: availabilityDate,
    });

    // Format time slots with duration
    const slotDuration = duration || 30; // Default 30 minutes
    const formattedSlots = timeSlots.map((time: string) => ({
      time,
      duration: slotDuration,
      isBooked: false,
    }));

    if (availability) {
      // Update existing - merge new slots with existing
      const existingTimes = availability.timeSlots.map((s) => s.time);
      const newSlots = formattedSlots.filter(
        (s: { time: string }) => !existingTimes.includes(s.time)
      );
      availability.timeSlots.push(...newSlots);
      await availability.save();
    } else {
      // Create new availability
      availability = await DoctorAvailability.create({
        doctor: doctor._id,
        date: availabilityDate,
        timeSlots: formattedSlots,
      });
    }

    res.status(200).json({
      success: true,
      message: "Availability updated successfully",
      data: { availability },
    });
  }
);

// Get doctor's own availability
export const getMyAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) {
      return next(new AppError("Doctor profile not found", 404));
    }

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const availability = await DoctorAvailability.find({
      doctor: doctor._id,
      date: { $gte: startOfToday }, // Include today's availability
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: availability.length,
      data: { availability },
    });
  }
);

// Get availability for a specific doctor (for patients booking)
export const getDoctorAvailability = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { doctorId } = req.params;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const availability = await DoctorAvailability.find({
      doctor: doctorId,
      date: { $gte: startOfToday }, // Include today's availability
    }).sort({ date: 1 });

    res.status(200).json({
      success: true,
      count: availability.length,
      data: { availability },
    });
  }
);

// Get doctor's profile details
export const getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctor = await Doctor.findOne({ user: (req as any).user?._id });
    if (!doctor) {
      return next(new AppError("Doctor profile not found", 404));
    }
    res.status(200).json({
      success: true,
      data: { doctor },
    });
  }
);

// Update doctor's profile details
export const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const doctor = await Doctor.findOneAndUpdate(
      { user: (req as any).user?._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!doctor) {
      return next(new AppError("Doctor profile not found", 404));
    }
    res.status(200).json({
      success: true,
      data: { doctor },
    });
  }
);
