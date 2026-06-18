import mongoose, { Schema, Document } from "mongoose";

export interface IMedicineIssue extends Document {
  pharmacy: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  doctor: mongoose.Types.ObjectId; // Prescribing doctor
  medicines: {
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  billUrl?: string;
  date: Date;
}

const medicineIssueSchema = new Schema<IMedicineIssue>(
  {
    pharmacy: { type: Schema.Types.ObjectId, ref: "Pharmacy", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor" },
    medicines: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: { type: Number, required: true },
    billUrl: { type: String },
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const MedicineIssue = mongoose.model<IMedicineIssue>(
  "MedicineIssue",
  medicineIssueSchema
);
