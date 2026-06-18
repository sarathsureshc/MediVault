import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { Notification } from "../models/Notification";
import { AppError } from "../utils/AppError";

export const getNotifications = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    // Assuming req.user is populated by auth middleware
    const userId = (req as any).user._id;

    const notifications = await Notification.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  }
);

export const markAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = (req as any).user._id;

    const notification = await Notification.findOne({ _id: id, user: userId });

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      data: notification,
    });
  }
);

export const markAllAsRead = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user._id;

    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  }
);
