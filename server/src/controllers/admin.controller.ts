import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { User } from "../models/User";
import { Doctor } from "../models/Doctor";
import { Lab } from "../models/Lab";
import { Pharmacy } from "../models/Pharmacy";
import { Patient } from "../models/Patient";
import { Notification } from "../models/Notification";

// 1. Get system-wide platform stats
export const getAdminStats = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const [
      totalUsers,
      totalDoctors,
      totalLabs,
      totalPharmacies,
      totalPatients,
      totalBlocked,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "doctor" }),
      User.countDocuments({ role: "lab" }),
      User.countDocuments({ role: "pharmacy" }),
      User.countDocuments({ role: "patient" }),
      User.countDocuments({ isBlocked: true }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalDoctors,
        totalLabs,
        totalPharmacies,
        totalPatients,
        totalBlocked,
      },
    });
  }
);

// 2. Get all user profiles with role-specific details
export const getAllUsers = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { role, status, search } = req.query;

    const filter: any = {};

    if (role && role !== "all") {
      filter.role = role;
    }

    if (status === "blocked") {
      filter.isBlocked = true;
    } else if (status === "active") {
      filter.isBlocked = { $ne: true };
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const searchRegex = new RegExp(search.trim(), "i");
      filter.$or = [{ email: searchRegex }];
    }

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    // Attach role profiles
    const usersWithProfiles = await Promise.all(
      users.map(async (user: any) => {
        let profile: any = null;
        if (user.role === "doctor") {
          profile = await Doctor.findOne({ user: user._id }).lean();
        } else if (user.role === "lab") {
          profile = await Lab.findOne({ user: user._id }).lean();
        } else if (user.role === "pharmacy") {
          profile = await Pharmacy.findOne({ user: user._id }).lean();
        } else if (user.role === "patient") {
          profile = await Patient.findOne({ user: user._id }).lean();
        }

        return {
          ...user,
          profile,
        };
      })
    );

    // If search was applied, filter in profile fields if not matched on email
    let finalResults = usersWithProfiles;
    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      finalResults = usersWithProfiles.filter((u: any) => {
        if (u.email?.toLowerCase().includes(q)) return true;
        if (u.profile?.fullName?.toLowerCase().includes(q)) return true;
        if (u.profile?.labName?.toLowerCase().includes(q)) return true;
        if (u.profile?.pharmacyName?.toLowerCase().includes(q)) return true;
        if (u.profile?.licenseNumber?.toLowerCase().includes(q)) return true;
        if (u.profile?.hospitalClinicName?.toLowerCase().includes(q)) return true;
        if (u.profile?.specialization?.toLowerCase().includes(q)) return true;
        return false;
      });
    }

    res.status(200).json({
      success: true,
      count: finalResults.length,
      data: {
        users: finalResults,
      },
    });
  }
);

// 3. Block or Unblock user for malpractice / violation
export const toggleBlockUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { isBlocked, reason } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    if (user.role === "admin") {
      return next(new AppError("Cannot block administrative accounts", 400));
    }

    const shouldBlock = Boolean(isBlocked);
    user.isBlocked = shouldBlock;
    user.blockReason = shouldBlock ? (reason || "Malpractice or compliance violation reported") : undefined;
    user.blockedAt = shouldBlock ? new Date() : undefined;

    await user.save({ validateBeforeSave: false });

    // Create a system audit notification
    await Notification.create({
      user: user._id,
      message: shouldBlock
        ? `[Account Suspended] Your access to MediVault has been suspended. Reason: ${user.blockReason}`
        : "[Account Restored] Your MediVault account access has been reviewed and reinstated by the administration team.",
      type: "system",
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: shouldBlock
        ? `User account ${user.email} (${user.role}) has been blocked and suspended for malpractice.`
        : `User account ${user.email} has been unblocked and restored.`,
      data: {
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked,
          blockReason: user.blockReason,
          blockedAt: user.blockedAt,
        },
      },
    });
  }
);

// 4. Verify entity credentials (doctor license, lab approval, pharmacy permit)
export const toggleVerifyEntity = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = req.params;
    const { isVerifiedByAdmin } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return next(new AppError("User not found", 404));
    }

    let updatedProfile = null;
    if (user.role === "doctor") {
      updatedProfile = await Doctor.findOneAndUpdate(
        { user: user._id },
        { isVerifiedByAdmin: Boolean(isVerifiedByAdmin) },
        { new: true }
      );
    } else if (user.role === "lab") {
      updatedProfile = await Lab.findOneAndUpdate(
        { user: user._id },
        { isVerifiedByAdmin: Boolean(isVerifiedByAdmin) },
        { new: true }
      );
    } else if (user.role === "pharmacy") {
      updatedProfile = await Pharmacy.findOneAndUpdate(
        { user: user._id },
        { isVerifiedByAdmin: Boolean(isVerifiedByAdmin) },
        { new: true }
      );
    }

    res.status(200).json({
      success: true,
      message: `Entity verification status updated for ${user.email}`,
      data: { profile: updatedProfile },
    });
  }
);
