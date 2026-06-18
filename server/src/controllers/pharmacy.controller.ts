import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { MedicineIssue } from "../models/MedicineIssue";
import { Pharmacy } from "../models/Pharmacy";
import { Patient } from "../models/Patient";
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
      doctor: doctorId,
      medicines,
      totalAmount,
      billUrl,
    });

    res.status(201).json({
      success: true,
      data: { issue },
    });
  }
);
