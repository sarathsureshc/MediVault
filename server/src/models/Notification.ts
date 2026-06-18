import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  user: mongoose.Types.ObjectId; // Recipient
  message: string;
  type: "booking" | "reminder" | "report" | "system";
  relatedId?: mongoose.Types.ObjectId; // ID of appointment/report
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ["booking", "reminder", "report", "system"],
      required: true,
    },
    relatedId: { type: Schema.Types.ObjectId },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true } // timestamps: true adds createdAt and updatedAt automatically
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
