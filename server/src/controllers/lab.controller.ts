import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { TestResult } from "../models/TestResult";
import { Lab } from "../models/Lab";
import { Patient } from "../models/Patient";
import { Notification } from "../models/Notification";
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
      doctor: doctorId || undefined,
      testName,
      resultValue,
      reportUrl,
      comments,
    });

    // Notify patient
    await Notification.create({
      user: patient.user,
      message: `New lab report available for ${testName} from ${lab.labName}`,
      type: "booking",
      relatedId: testResult._id,
    });

    res.status(201).json({
      success: true,
      data: { testResult },
    });
  }
);

export const getPatientTestResults = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { patientId } = req.params;

    const patient = await Patient.findOne({ patientID: patientId });
    if (!patient) return next(new AppError("Patient not found", 404));

    // Ensure patient can only query their own results
    if (req.user?.role === "patient" && patient.user.toString() !== req.user._id.toString()) {
      return next(new AppError("You are only authorized to view your own lab reports", 403));
    }

    const results = await TestResult.find({ patient: patient._id })
      .populate("lab", "labName phone address")
      .populate("doctor", "fullName specialization")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: { results },
    });
  }
);

export const getLabHistory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const lab = await Lab.findOne({ user: req.user?._id });
    if (!lab) return next(new AppError("Lab profile not found", 404));

    const results = await TestResult.find({ lab: lab._id })
      .populate("patient", "fullName patientID")
      .populate("doctor", "fullName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      data: { results },
    });
  }
);

export const getPendingTests = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      success: true,
      data: { pendingTests: [] },
    });
  }
);
