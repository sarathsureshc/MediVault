import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { TestResult } from "../models/TestResult";
import { Lab } from "../models/Lab";
import { Patient } from "../models/Patient";
import { AppError } from "../utils/AppError";

export const uploadTestResult = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { patientId, doctorId, testName, resultValue, reportUrl, comments } =
      req.body;

    const lab = await Lab.findOne({ user: req.user?._id });
    if (!lab) return next(new AppError("Lab profile not found", 404));

    const patient = await Patient.findOne({ patientID: patientId });
    if (!patient) return next(new AppError("Patient not found", 404));

    const testResult = await TestResult.create({
      lab: lab._id,
      patient: patient._id,
      doctor: doctorId, // Optional, can be null if self-test
      testName,
      resultValue,
      reportUrl,
      comments,
    });

    res.status(201).json({
      success: true,
      data: { testResult },
    });
  }
);

export const getPendingTests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // In a real app, we would query Consultations for prescribed tests that haven't been fulfilled.
    // For now, we'll just return an empty list or mock data.
    res.status(200).json({
      success: true,
      data: { pendingTests: [] },
    });
  }
);
