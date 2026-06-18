import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { Patient } from "../models/Patient";
import { AppError } from "../utils/AppError";

export const getProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const patient = await Patient.findOne({ user: req.user?._id });
    if (!patient) {
      return next(new AppError("Patient profile not found", 404));
    }
    res.status(200).json({
      success: true,
      data: { patient },
    });
  }
);

export const updateProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const patient = await Patient.findOneAndUpdate(
      { user: req.user?._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!patient) {
      return next(new AppError("Patient profile not found", 404));
    }
    res.status(200).json({
      success: true,
      data: { patient },
    });
  }
);

export const getMedicalHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // This would fetch from a separate MedicalHistory model or aggregated data
    // For now, returning the history stored in Patient profile
    const patient = await Patient.findOne({ user: req.user?._id });
    if (!patient) {
      return next(new AppError("Patient profile not found", 404));
    }
    res.status(200).json({
      success: true,
      data: { history: patient.medicalHistory },
    });
  }
);
