import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  email: string;
  password?: string;
  role: "patient" | "doctor" | "lab" | "pharmacy" | "admin";
  isVerified: boolean;
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
    password: { type: String, select: false },
    role: {
      type: String,
      enum: ["patient", "doctor", "lab", "pharmacy", "admin"],
      required: true,
    },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String },
    profileId: { type: Schema.Types.ObjectId, refPath: "role" }, // Dynamic reference based on role? Or just handle manually.
    // Actually, refPath might be tricky if role is lowercase string and model names are Capitalized.
    // Let's just store profileId and handle population manually or use a consistent naming convention.
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
