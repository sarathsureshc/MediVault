import mongoose, { Schema, Document } from "mongoose";

export interface ITestResult extends Document {
  lab: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId; // Prescribing doctor
  testName: string;
  resultValue: string;
  reportUrl: string; // URL to PDF/Image
  comments: string;
  date: Date;
}

const testResultSchema = new Schema<ITestResult>(
  {
    lab: { type: Schema.Types.ObjectId, ref: "Lab", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    testName: { type: String, required: true },
    resultValue: { type: String, required: true },
    reportUrl: { type: String },
    comments: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const TestResult = mongoose.model<ITestResult>(
  "TestResult",
  testResultSchema
);
