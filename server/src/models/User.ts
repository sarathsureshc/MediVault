import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  phone?: string;
  password?: string;
  role: "patient" | "doctor" | "lab" | "pharmacy" | "admin";
  isVerified: boolean;
  isBlocked?: boolean;
  blockReason?: string;
  blockedAt?: Date;
  googleId?: string;
  profileId?: mongoose.Types.ObjectId; // Reference to specific role profile
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["patient", "doctor", "lab", "pharmacy", "admin"],
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    isBlocked: { type: Boolean, default: false },
    blockReason: { type: String },
    blockedAt: { type: Date },
    googleId: { type: String },
    profileId: { type: Schema.Types.ObjectId, refPath: "role" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password || "");
};

export const User = mongoose.model<IUser>("User", userSchema);
