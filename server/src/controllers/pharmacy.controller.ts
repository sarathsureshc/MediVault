import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { MedicineIssue } from "../models/MedicineIssue";
import { Pharmacy } from "../models/Pharmacy";
import { Patient } from "../models/Patient";
import { Consultation } from "../models/Consultation";
import { Notification } from "../models/Notification";
import { AppError } from "../utils/AppError";

export const issueMedicines = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { patientId, doctorId, medicines, totalAmount, billUrl } = req.body;

    const pharmacy = await Pharmacy.findOne({ user: req.user?._id });
    if (!pharmacy) return next(new AppError("Pharmacy profile not found", 404));

    const patient = await Patient.findOne({ patientID: patientId });
    if (!patient) return next(new AppError("Patient not found", 404));

    const issue = await MedicineIssue.create({
      pharmacy: pharmacy._id,
      patient: patient._id,
      doctor: doctorId || undefined,
      medicines,
      totalAmount,
      billUrl,
    });

    // Notify patient
    await Notification.create({
      user: patient.user,
      message: `Medicines issued by ${pharmacy.pharmacyName}. Total amount: ₹${totalAmount}`,
      type: "booking",
      relatedId: issue._id,
    });

    res.status(201).json({
      success: true,
      data: { issue },
    });
  }
);

export const getPharmacyHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const pharmacy = await Pharmacy.findOne({ user: req.user?._id });
    if (!pharmacy) return next(new AppError("Pharmacy profile not found", 404));

    const issues = await MedicineIssue.find({ pharmacy: pharmacy._id })
      .populate("patient", "fullName patientID phone")
      .populate("doctor", "fullName specialization")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: issues.length,
      data: { issues },
    });
  }
);

export const getPatientPrescriptions = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { patientId } = req.params;

    const patient = await Patient.findOne({ patientID: patientId });
    if (!patient) return next(new AppError("Patient not found", 404));

    const consultations = await Consultation.find({ patient: patient._id })
      .populate("doctor", "fullName specialization hospitalClinicName")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: {
        patient: {
          name: patient.fullName,
          patientID: patient.patientID,
          phone: patient.phone,
          age: patient.age,
          gender: patient.gender,
        },
        consultations,
      },
    });
  }
);
