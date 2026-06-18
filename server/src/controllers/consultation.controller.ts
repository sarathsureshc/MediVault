import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { Consultation } from "../models/Consultation";
import { AppError } from "../utils/AppError";
import { Patient } from "../models/Patient";
import { Doctor } from "../models/Doctor";

export const createConsultation = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { patientId, diagnosis, notes, prescription, recommendedTests } =
      req.body;

    // Verify Doctor profile exists
    const doctor = await Doctor.findOne({ user: req.user?._id });
    if (!doctor) {
      return next(new AppError("Doctor profile not found", 404));
    }

    // Verify Patient exists
    const patient = await Patient.findOne({ patientID: patientId });
    if (!patient) {
      return next(new AppError("Patient not found", 404));
    }

    const consultation = await Consultation.create({
      doctor: doctor._id,
      patient: patient._id,
      diagnosis,
      notes,
      prescription,
      recommendedTests,
    });

    // Update Patient Medical History (Optional, but good for quick access)
    // patient.medicalHistory.push(...)
    // For now, we rely on querying Consultation collection

    res.status(201).json({
      success: true,
      data: { consultation },
    });
  }
);

export const getPatientConsultations = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { patientId } = req.params;

    // If patient is requesting, ensure they are requesting their own
    if (req.user?.role === "patient") {
      const patient = await Patient.findOne({ user: req.user._id });
      if (!patient || patient.patientID !== patientId) {
        // Allow if they are requesting their own ID, but patientId param might be internal ID or public ID.
        // Let's assume patientId param is the public patientID string.
        if (patient?.patientID !== patientId) {
          return next(new AppError("You can only view your own history", 403));
        }
      }
    }

    // Find patient by ID string
    const targetPatient = await Patient.findOne({ patientID: patientId });
    if (!targetPatient) {
      return next(new AppError("Patient not found", 404));
    }

    const consultations = await Consultation.find({
      patient: targetPatient._id,
    })
      .populate("doctor", "fullName specialization hospitalClinicName")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      results: consultations.length,
      data: { consultations },
    });
  }
);
